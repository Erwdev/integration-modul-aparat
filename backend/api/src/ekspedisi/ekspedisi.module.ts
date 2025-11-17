import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ekspedisi } from './entities/ekspedisi.entity';
import { EkspedisiService } from './ekspedisi.service';
import { EkspedisiController } from './ekspedisi.controller';
import { SuratModule } from 'src/surat/surat.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ekspedisi]),
    SuratModule,
    EventsModule,
  ],
  controllers: [EkspedisiController],
  providers: [EkspedisiService],
  exports: [EkspedisiService],
})
export class EkspedisiModule {}
