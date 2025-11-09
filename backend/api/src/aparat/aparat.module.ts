import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aparat } from './entities/aparat.entity';
import { AparatService } from './aparat.service';
import { AparatController } from './aparat.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aparat]),
    EventsModule,
  ],
  controllers: [AparatController],
  providers: [AparatService],
  exports: [AparatService],
})
export class AparatModule {}
