import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Surat } from '../entities/surat.entity';

@Injectable()
export class NomorSuratGeneratorService {
  private readonly logger = new Logger(NomorSuratGeneratorService.name);

  constructor(
    @InjectRepository(Surat)
    private readonly suratRepository: Repository<Surat>,
  ) {}

  /**
   * Generate nomor surat otomatis
   * Format: XXX/YYYY/MM/DD
   */
  public async generateNomorSurat(): Promise<string> {
    this.logger.log('Generating new nomor surat...');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Count surat created today
    const count = await this.suratRepository
      .createQueryBuilder('surat')
      .where('DATE(surat.created_at) = :today', {
        today: today.toISOString().split('T')[0],
      })
      .getCount();

    const sequence = String(count + 1).padStart(3, '0');
    const nomorSurat = `${sequence}/${year}/${month}/${day}`;

    this.logger.log(`Generated nomor surat: ${nomorSurat}`);
    return nomorSurat;
  }
}