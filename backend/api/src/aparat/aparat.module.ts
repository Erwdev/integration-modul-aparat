import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aparat } from './entities/aparat.entity';
import { AparatService } from './aparat.service';
import { AparatController } from './aparat.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aparat]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AparatController],
  providers: [AparatService],
  exports: [AparatService],
})
export class AparatModule {}
