import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventAcknowledgment } from './entities';
import { TypeOrmModule  } from '@nestjs/typeorm';
import { ApiKeyModule } from 'src/auth/api-key/api-key.module';
import { DeadLetterQueueController } from './controllers/dead-letter-queue.controller';
import { RetryStrategyService } from './services/retry-strategy.service';
import { DeadLetterQueueService } from './services/dead-letter-queue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventAcknowledgment]),
    ApiKeyModule,
  ],
  providers: [EventsService, RetryStrategyService, DeadLetterQueueService],
  controllers: [EventsController, DeadLetterQueueController],
  exports: [EventsService],
})
export class EventsModule {}
