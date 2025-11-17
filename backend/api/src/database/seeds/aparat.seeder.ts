import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aparat } from '../../aparat/entities/aparat.entity';
import { AparatFactory } from '../factories/aparat.factory';
import { Jabatan } from '../../aparat/enums/jabatan.enum';
import { StatusAparat } from '../../aparat/enums/status-aparat.enum';

@Injectable()
export class AparatSeeder {
  private readonly logger = new Logger(AparatSeeder.name);

  constructor(
    @InjectRepository(Aparat)
    private readonly aparatRepository: Repository<Aparat>,
  ) {}

  /**
   * Seed data aparat desa
   */
  async seed(): Promise<void> {
    this.logger.log('🌱 Starting aparat seeding...');

    try {
      // ✅ Clear existing data (optional, hati-hati di production!)
      const shouldClear = process.env.SEED_CLEAR === 'true';
      if (shouldClear) {
        this.logger.warn('⚠️  Clearing existing aparat data...');
        await this.aparatRepository.delete({});
        this.logger.log('✅ Existing data cleared');
      }

      // ✅ 1. Seed Lurah (hanya 1)
      const lurah = AparatFactory.generate({
        nama: 'Budi Santoso, S.Sos',
        jabatan: Jabatan.LURAH,
        pangkat_golongan: 'Pembina (IV/a)',
        status: StatusAparat.AKTIF,
        nip: '196801011990031001',
        nik: '3301010101010001',
        pendidikan_terakhir: 'S1',
        nomor_tanggal_keputusan_pengangkatan: '001/SK/2020',
      });

      // ✅ 2. Seed Sekretaris Desa (hanya 1)
      const sekretaris = AparatFactory.generate({
        nama: 'Siti Aminah, S.Ap',
        jabatan: Jabatan.SEKRETARIS_DESA,
        pangkat_golongan: 'Penata Tingkat I (III/d)',
        status: StatusAparat.AKTIF,
        nip: '197505101995032002',
        nik: '3301010202020002',
        pendidikan_terakhir: 'S1',
      });

      // ✅ 3. Seed Kepala Urusan (3 orang)
      const kasiTataUsaha = AparatFactory.generate({
        nama: 'Ahmad Fauzi, S.Kom',
        jabatan: Jabatan.KEPALA_URUSAN_TATA_USAHA,
        pangkat_golongan: 'Penata (III/c)',
        status: StatusAparat.AKTIF,
        nip: '198003152005011003',
        nik: '3301010303030003',
      });

      const kasiKeuangan = AparatFactory.generate({
        nama: 'Dewi Lestari, S.E',
        jabatan: Jabatan.KEPALA_URUSAN_KEUANGAN,
        pangkat_golongan: 'Penata (III/c)',
        status: StatusAparat.AKTIF,
        nip: '198506202008022004',
        nik: '3301010404040004',
      });

      const kasiPerencanaan = AparatFactory.generate({
        nama: 'Rudi Hartono, S.T',
        jabatan: Jabatan.KEPALA_URUSAN_PERENCANAAN,
        pangkat_golongan: 'Penata Muda Tingkat I (III/b)',
        status: StatusAparat.AKTIF,
        nip: '199001012010011005',
        nik: '3301010505050005',
      });

      // ✅ 4. Seed Kepala Dusun (5 orang)
      const kepalaDusun = AparatFactory.generateMany(5, {
        jabatan: Jabatan.KEPALA_DUSUN,
        pangkat_golongan: 'Pengatur Tingkat I (II/d)',
        status: StatusAparat.AKTIF,
      });

      // ✅ 5. Seed Staf (10 orang - mix aktif dan cuti)
      const staf = AparatFactory.generateMany(10, {
        jabatan: Jabatan.STAF,
      });

      // ✅ 6. Save all to database dengan nomor_urut
      const allAparat = [
        lurah,
        sekretaris,
        kasiTataUsaha,
        kasiKeuangan,
        kasiPerencanaan,
        ...kepalaDusun,
        ...staf,
      ];

      // Assign nomor_urut
      allAparat.forEach((aparat, index) => {
        aparat.nomor_urut = index + 1;
      });

      const saved = await this.aparatRepository.save(allAparat);

      this.logger.log(`✅ Successfully seeded ${saved.length} aparat data`);
      this.logger.log(`   - 1 Lurah`);
      this.logger.log(`   - 1 Sekretaris Desa`);
      this.logger.log(`   - 3 Kepala Urusan`);
      this.logger.log(`   - 5 Kepala Dusun`);
      this.logger.log(`   - 10 Staf`);

    } catch (error) {
      this.logger.error('❌ Failed to seed aparat data', error.stack);
      throw error;
    }
  }

  /**
   * Rollback - hapus semua data seeded
   */
  async rollback(): Promise<void> {
    this.logger.log('🔄 Rolling back aparat seeding...');
    
    try {
      await this.aparatRepository.delete({});
      this.logger.log('✅ Rollback completed');
    } catch (error) {
      this.logger.error('❌ Failed to rollback', error.stack);
      throw error;
    }
  }
}