import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventAcknowledgment } from './entities';
import { TypeOrmModule  } from '@nestjs/typeorm';
import { ApiKeyModule } from 'src/auth/api-key/api-key.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventAcknowledgment]),
    ApiKeyModule,
  ],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
