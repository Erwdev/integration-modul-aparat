import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuratController } from './surat.controller';
import { SuratService } from './surat.service';
import { Surat } from './entities/surat.entity';
import { EventsModule } from '../events/events.module'
// 1. IMPORT SERVICE BARU
import { NomorSuratGeneratorService } from './services/nomor-surat-generator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Surat]), EventsModule],
  controllers: [SuratController],
  // 2. TAMBAHKAN KE PROVIDERS
  providers: [SuratService, NomorSuratGeneratorService],
  exports: [SuratService],
})
export class SuratModule {}