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
  // events.service.ts
async publishEvent(createEventDto: CreateEventDto): Promise<Event> {
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
    status: EventStatus.PROCESSED,  // ✅ Langsung PROCESSED, bukan PENDING
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
   * Get events for Audit Log (History)
   */
  async findAll(filterDto: FilterEventsDto): Promise<{
    data: Event[];
    total: number;
    meta: any;
  }> {
    const query = this.eventRepository.createQueryBuilder('event');

    // 1. Filter DLQ
    query.andWhere('event.is_dlq = :is_dlq', { is_dlq: false });

    // 2. Filter Status
    if (filterDto.status) {
      query.andWhere('event.status = :status', { status: filterDto.status });
    }

    // 3. Filter Topic
    if (filterDto.topic) {
      query.andWhere('event.topic = :topic', { topic: filterDto.topic });
    }

    // 4. Filter Source Module
    if (filterDto.source_module) {
      query.andWhere('event.source_module = :source_module', {
        source_module: filterDto.source_module,
      });
    }

    // 5. Filter Date Range (Start)
    if (filterDto.start_date) {
      query.andWhere('event.created_at >= :startDate', {
        startDate: new Date(filterDto.start_date),
      });
    }

    // 6. Filter Date Range (End)
    if (filterDto.end_date) {
      const endDate = new Date(filterDto.end_date);
      endDate.setHours(23, 59, 59, 999);
      query.andWhere('event.created_at <= :endDate', { endDate });
    }

    // 7. Filter Since
    if (filterDto.since) {
      query.andWhere('event.created_at > :since', {
        since: new Date(filterDto.since),
      });
    }

    // Pagination & Sorting
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const offset = (page - 1) * limit;

    query.orderBy('event.created_at', 'DESC');
    query.skip(offset).take(limit);

    const [events, total] = await query.getManyAndCount();

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
    const event = await this.eventRepository.findOne({
      where: { id: acknowledgeDto.event_id },
    });

    if (!event) {
      throw new NotFoundException(
        `Event dengan ID "${acknowledgeDto.event_id}" tidak ditemukan`,
      );
    }

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

    if (
      acknowledgeDto.processing_status === ProcessingStatus.FAILURE &&
      !acknowledgeDto.error_message
    ) {
      throw new BadRequestException(
        'Error message wajib diisi jika status = failed',
      );
    }

    const acknowledgment = this.acknowledgmentRepository.create(acknowledgeDto);
    const savedAck = await this.acknowledgmentRepository.save(acknowledgment);

    if (acknowledgeDto.processing_status === ProcessingStatus.SUCCESS) {
      event.status = EventStatus.PROCESSED;
    } else {
      event.status = EventStatus.FAILED;
    }

    await this.eventRepository.save(event);
    return savedAck;
  }

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

  async getPendingEvents(): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { status: EventStatus.PENDING },
      order: { created_at: 'ASC' },
    });
  }

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