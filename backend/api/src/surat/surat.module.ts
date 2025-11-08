import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuratController } from './surat.controller';
import { SuratService } from './surat.service';
import { Surat } from './entities/surat.entity';

// 1. IMPORT SERVICE BARU
import { NomorSuratGeneratorService } from './services/nomor-surat-generator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Surat])],
  controllers: [SuratController],
  // 2. TAMBAHKAN KE PROVIDERS
  providers: [SuratService, NomorSuratGeneratorService],
  exports: [SuratService],
})
export class SuratModule {}