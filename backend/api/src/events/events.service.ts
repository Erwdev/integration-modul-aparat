import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventAcknowledgment } from './entities';
import { CreateEventDto, AcknowledgeEventDto, FilterEventsDto } from './dto';
import { EventStatus, ProcessingStatus } from './enums';
import { RetryStrategyService } from './services/retry-strategy.service';
import { DeadLetterQueueService } from './services/dead-letter-queue.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventAcknowledgment)
    private readonly acknowledgmentRepository: Repository<EventAcknowledgment>,
    private readonly retryStrategy: RetryStrategyService,
    private readonly dlqService: DeadLetterQueueService,
  ) {}

  /**
   * Publish Event
   */
  async publishEvent(createEventDto: CreateEventDto): Promise<Event> {
    // Check duplicate idempotency key
    const existingEvent = await this.eventRepository.findOne({
      where: { idempotency_key: createEventDto.idempotency_key },
    });

    if (existingEvent) {
      throw new ConflictException(
        `Event dengan idempotency key "${createEventDto.idempotency_key}" sudah ada`,
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      status: EventStatus.PENDING,
      retry_count: 0,
      max_retries: createEventDto.max_retries || 5,
      next_retry_at: null,
      last_retry_at: null,
      error_history: [],
    });

    await this.eventRepository.save(event);

    this.logger.log(`Event ${event.id} published successfully`);

    return event;
  }

  /**
   * Get events for consumption (with retry logic)
   */
  async findAll(filterDto: FilterEventsDto): Promise<{
    data: Event[];
    total: number;
    meta: any;
  }> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.PENDING })
      .andWhere('event.is_dlq = :is_dlq', { is_dlq: false });

    // ✅ Filter by topic
    if (filterDto.topic) {
      query.andWhere('event.topic = :topic', { topic: filterDto.topic });
    }

    // ✅ Filter by source module
    if (filterDto.source_module) {
      query.andWhere('event.source_module = :source_module', {
        source_module: filterDto.source_module,
      });
    }

    // ✅ Filter events ready for retry (next_retry_at <= now OR null)
    query.andWhere(
      '(event.next_retry_at IS NULL OR event.next_retry_at <= :now)',
      { now: new Date() },
    );

    // ✅ Filter by timestamp (only new events since last check)
    if (filterDto.since) {
      query.andWhere('event.created_at > :since', {
        since: new Date(filterDto.since),
      });
    }

    // Pagination
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 50;
    const offset = (page - 1) * limit;

    query.skip(offset).take(limit).orderBy('event.created_at', 'ASC');

    const [events, total] = await query.getManyAndCount();

    this.logger.log(
      `Found ${events.length} events ready for processing (total pending: ${total})`,
    );

    return {
      data: events,
      total,
      meta: {
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Acknowledge Event
   */
  async acknowledgeEvent(
    acknowledgeDto: AcknowledgeEventDto,
  ): Promise<EventAcknowledgment> {
    // Check event exists
    const event = await this.eventRepository.findOne({
      where: { id: acknowledgeDto.event_id },
    });

    if (!event) {
      throw new NotFoundException(
        `Event dengan ID "${acknowledgeDto.event_id}" tidak ditemukan`,
      );
    }

    // Check duplicate acknowledgment
    const existingAck = await this.acknowledgmentRepository.findOne({
      where: {
        event_id: acknowledgeDto.event_id,
        consumer_module: acknowledgeDto.consumer_module,
      },
    });

    if (existingAck) {
      throw new ConflictException(
        `Event sudah di-acknowledge oleh module "${acknowledgeDto.consumer_module}"`,
      );
    }

    // Validate error_message if failed
    if (
      acknowledgeDto.processing_status === ProcessingStatus.FAILURE &&
      !acknowledgeDto.error_message
    ) {
      throw new BadRequestException(
        'Error message wajib diisi jika status = failed',
      );
    }

    // Create acknowledgment
    const acknowledgment = this.acknowledgmentRepository.create(acknowledgeDto);
    const savedAck = await this.acknowledgmentRepository.save(acknowledgment);

    // Update event status
    if (acknowledgeDto.processing_status === ProcessingStatus.SUCCESS) {
      event.status = EventStatus.PROCESSED;
    } else {
      event.status = EventStatus.FAILED;
    }

    await this.eventRepository.save(event);

    return savedAck;
  }

  /**
   * Find One Event by ID
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['acknowledgments'],
    });

    if (!event) {
      throw new NotFoundException(`Event dengan ID "${id}" tidak ditemukan`);
    }

    return event;
  }

  /**
   * Get Pending Events
   */
  async getPendingEvents(): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { status: EventStatus.PENDING },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get Event Statistics
   */
  async getStatistics() {
    const total = await this.eventRepository.count();
    const pending = await this.eventRepository.count({
      where: { status: EventStatus.PENDING },
    });
    const processed = await this.eventRepository.count({
      where: { status: EventStatus.PROCESSED },
    });
    const failed = await this.eventRepository.count({
      where: { status: EventStatus.FAILED },
    });

    return {
      total,
      pending,
      processed,
      failed,
      success_rate:
        total > 0 ? ((processed / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
}
