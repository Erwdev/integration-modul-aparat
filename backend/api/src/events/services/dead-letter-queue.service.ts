import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventStatus, EventTopic } from '../enums/event-status.enum';


export interface DLQStats {
  total: number;
  by_topic: Record<string, number>;
  by_module: Record<string, number>;
  recent_errors: Array<{
    id: string;
    topic: string;
    error: string;
    moved_at: Date;
  }>;
}

@Injectable()
export class DeadLetterQueueService {
  private readonly logger = new Logger(DeadLetterQueueService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async moveToDeadLetterQueue(event: Event, reason: string): Promise<Event> {
    this.logger.warn(
      `Moving event ${event.id} to dead letter queue: ${reason}`,
    );

    event.status = EventStatus.FAILED;
    event.is_dlq = true;
    event.moved_to_dlq_at = new Date();
    event.dlq_reason = reason;

    await this.eventRepository.save(event);

    this.logger.log(
      `Event ${event.id} moved to DLQ after ${event.retry_count} retries`,
    );
    return event;
  }

  async getDeadLetterQueue(options?: {
    topic?: string;
    source_module?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: Event[]; total: number }> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.is_dlq = :is_dlq', { is_dlq: true })
      .orderBy('event.moved_to_dlq_at', 'DESC');

    if (options?.topic) {
      query.andWhere('event.topic = :topic', { topic: options.topic });
    }
    if (options?.source_module) {
      query.andWhere('event.source_module = :source_module', {
        source_module: options.source_module,
      });
    }
    const total = await query.getCount();

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }
    const events = await query.getMany();
    return { events, total };
  }

  async getStats(): Promise<DLQStats> {
    const events = await this.eventRepository.find({
      where: { is_dlq: true },
      order: { moved_to_dlq_at: 'DESC' },
      take: 100,
    });

    const stats: DLQStats = {
      total: events.length,
      by_topic: {},
      by_module: {},
      recent_errors: [],
    };

    events.forEach((event) => {
      stats.by_topic[event.topic] = (stats.by_topic[event.topic] || 0) + 1;
      stats.by_module[event.source_module] =
        (stats.by_module[event.source_module] || 0) + 1;
    });

    // Get recent errors (last 10)
    stats.recent_errors = events.slice(0, 10).map((event) => ({
      id: event.id,
      topic: event.topic,
      error: event.last_error || 'Unknown error',
      moved_at: event.moved_to_dlq_at!,
    }));

    return stats;
  }

  /**
   * Retry event from DLQ (manual intervention)
   */
  async retryFromDeadLetterQueue(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, is_dlq: true },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found in DLQ`);
    }

    this.logger.log(`Manually retrying event ${eventId} from DLQ`);

    // Reset event for retry
    event.status = EventStatus.PENDING;
    event.is_dlq = false;
    event.retry_count = 0;
    event.next_retry_at = null;
    event.last_retry_at = null;
    event.moved_to_dlq_at = null;
    event.dlq_reason = null;
    event.last_error = null;

    await this.eventRepository.save(event);

    return event;
  }

  /**
   * Delete event from DLQ permanently
   */
  async deleteFromDeadLetterQueue(eventId: string): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, is_dlq: true },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found in DLQ`);
    }

    await this.eventRepository.remove(event);

    this.logger.log(`Event ${eventId} permanently deleted from DLQ`);
  }

  /**
   * Bulk retry all DLQ events for specific topic
   */
  async bulkRetryByTopic(topic: EventTopic): Promise<number> {
    const events = await this.eventRepository.find({
      where: { is_dlq: true, topic },
    });

    this.logger.log(`Bulk retrying ${events.length} events for topic ${topic}`);

    for (const event of events) {
      await this.retryFromDeadLetterQueue(event.id);
    }

    return events.length;
  }
}
