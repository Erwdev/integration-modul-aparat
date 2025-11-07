import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventAcknowledgment } from './entities';
import { CreateEventDto, AcknowledgeEventDto, FilterEventsDto } from './dto';
import { EventStatus, ProcessingStatus } from './enums';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(EventAcknowledgment)
    private readonly acknowledgmentRepository: Repository<EventAcknowledgment>,
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

    // Create event
    const event = this.eventRepository.create({
      ...createEventDto,
      status: EventStatus.PENDING,
      timestamp: new Date(),
    });

    return await this.eventRepository.save(event);
  }

  /**
   * Acknowledge Event
   */
  async acknowledgeEvent(acknowledgeDto: AcknowledgeEventDto): Promise<EventAcknowledgment> {
    // Check event exists
    const event = await this.eventRepository.findOne({
      where: { id: acknowledgeDto.event_id },
    });

    if (!event) {
      throw new NotFoundException(`Event dengan ID "${acknowledgeDto.event_id}" tidak ditemukan`);
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
      acknowledgeDto.processing_status === ProcessingStatus.FAILED &&
      !acknowledgeDto.error_message
    ) {
      throw new BadRequestException('Error message wajib diisi jika status = failed');
    }

    // Create acknowledgment
    const acknowledgment = this.acknowledgmentRepository.create(acknowledgeDto);
    const savedAck = await this.acknowledgmentRepository.save(acknowledgment);

    // Update event status
    if (acknowledgeDto.processing_status === ProcessingStatus.FAILED) {
      event.status = EventStatus.FAILED;
    } else {
      event.status = EventStatus.CONSUMED;
    }

    await this.eventRepository.save(event);

    return savedAck;
  }

  /**
   * Find All Events with Filters
   */
  async findAll(filterDto: FilterEventsDto) {
    const { topic, status, source_module, start_date, end_date, page = 1, limit = 20 } = filterDto;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.acknowledgments', 'acknowledgment');

    // Filter by topic
    if (topic) {
      query.andWhere('event.topic = :topic', { topic });
    }

    // Filter by status
    if (status) {
      query.andWhere('event.status = :status', { status });
    }

    // Filter by source_module
    if (source_module) {
      query.andWhere('event.source_module = :source_module', { source_module });
    }

    // Filter by date range
    if (start_date && end_date) {
      query.andWhere('event.timestamp BETWEEN :start_date AND :end_date', {
        start_date,
        end_date,
      });
    } else if (start_date) {
      query.andWhere('event.timestamp >= :start_date', { start_date });
    } else if (end_date) {
      query.andWhere('event.timestamp <= :end_date', { end_date });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Order by timestamp DESC
    query.orderBy('event.timestamp', 'DESC');

    const [events, total] = await query.getManyAndCount();

    return {
      data: events,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
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
      order: { timestamp: 'ASC' },
    });
  }

  /**
   * Get Event Statistics
   */
  async getStatistics() {
    const total = await this.eventRepository.count();
    const pending = await this.eventRepository.count({ where: { status: EventStatus.PENDING } });
    const consumed = await this.eventRepository.count({ where: { status: EventStatus.CONSUMED } });
    const failed = await this.eventRepository.count({ where: { status: EventStatus.FAILED } });

    return {
      total,
      pending,
      consumed,
      failed,
      success_rate: total > 0 ? ((consumed / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
}