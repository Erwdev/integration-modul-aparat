import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Aparat } from './entities/aparat.entity';
import { CreateAparatDto } from './dto/create-aparat.dto';
import { UpdateAparatDto } from './dto/update-aparat.dto';
import { FilterAparatDto } from './dto/filter-aparat.dto';
import { EventsService } from '../events/events.service';
import { EventTopic, SourceModule } from '../events/enums/index';
import { StatusAparat } from './enums/status-aparat.enum';

@Injectable()
export class AparatService {
  private readonly logger = new Logger(AparatService.name);

  constructor(
    @InjectRepository(Aparat)
    private repo: Repository<Aparat>,
    private dataSource: DataSource,
    private eventsService: EventsService,
  ) { }

  // Helper JSON SK
  private formatSK(nomor?: string, tanggal?: string): string | null {
    if (!nomor && !tanggal) return null;
    return JSON.stringify({ nomor: nomor || '', tanggal: tanggal || '' });
  }

  async create(dto: CreateAparatDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await this.repo.findOne({ where: { nik: dto.nik } });
      if (existing) throw new BadRequestException(`NIK ${dto.nik} sudah terdaftar`);

      // LOGIKA AUTO NUMBER
      let nomorUrut = dto.nomorUrut;
      if (!nomorUrut) {
        // Cari nomor urut terakhir
        const last = await this.repo.find({
          order: { nomorUrut: 'DESC' }, // Pastikan Entity sudah mapping nomorUrut -> nomor_urut
          take: 1,
        });
        nomorUrut = last.length > 0 ? last[0].nomorUrut + 1 : 1;
      }

      const aparat = this.repo.create({
        ...dto, // Spread properti dasar
        nip: dto.nip === '' ? null : dto.nip, // Handle empty string NIP
        nomorUrut: nomorUrut,
        tanggalLahir: new Date(dto.tanggalLahir),
        // Format SK ke JSON String
        skPengangkatan: this.formatSK(dto.skPengangkatanNomor, dto.skPengangkatanTanggal),
        skPemberhentian: this.formatSK(dto.skPemberhentianNomor, dto.skPemberhentianTanggal),
        status: StatusAparat.AKTIF,
      });

      const saved = await queryRunner.manager.save(aparat);

      // ✅ Safe Event Publish (Anti Error 500)
      try {
        await this.eventsService.publishEvent({
          topic: EventTopic.APARAT_CREATED,
          payload: { id: saved.id, nama: saved.nama },
          source_module: SourceModule.APARAT,
          idempotency_key: `aparat-create-${saved.id}`,
        });
      } catch (e) {
        this.logger.warn(`Event publish failed (Ignored): ${e.message}`);
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filter: FilterAparatDto) {
    const { page = 1, limit = 10, search, status, jabatan, sortBy = 'nomorUrut', sortOrder = 'ASC' } = filter;
    const skip = (page - 1) * limit;
    const queryBuilder = this.repo.createQueryBuilder('aparat');

    if (search) queryBuilder.andWhere('(aparat.nama ILIKE :search OR aparat.nip ILIKE :search OR aparat.nik ILIKE :search)', { search: `%${search}%` });
    if (status) queryBuilder.andWhere('aparat.status = :status', { status });
    if (jabatan) queryBuilder.andWhere('aparat.jabatan = :jabatan', { jabatan });

    queryBuilder.orderBy(`aparat.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Parse JSON SK saat read
    const parsedData = data.map(item => ({
      ...item,
      skPengangkatan: this.tryParseJSON(item.skPengangkatan),
      skPemberhentian: this.tryParseJSON(item.skPemberhentian),
    }));

    return { data: parsedData, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
  }

  private tryParseJSON(jsonString: string | null) {
    if (!jsonString) return null;
    try { return JSON.parse(jsonString); } catch { return jsonString; }
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Aparat tidak ditemukan`);

    item.skPengangkatan = this.tryParseJSON(item.skPengangkatan) as any;
    item.skPemberhentian = this.tryParseJSON(item.skPemberhentian) as any;
    return item;
  }

  async update(id: string, dto: UpdateAparatDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Not found');

    // Mapping Manual untuk Update
    if (dto.nama) item.nama = dto.nama;
    if (dto.nik) item.nik = dto.nik;
    if (dto.nip !== undefined) item.nip = dto.nip === '' ? null : dto.nip;
    if (dto.jabatan) item.jabatan = dto.jabatan;
    if (dto.pangkatGolongan !== undefined) item.pangkatGolongan = dto.pangkatGolongan;
    if (dto.status) item.status = dto.status as StatusAparat;
    if (dto.pendidikanTerakhir !== undefined) item.pendidikanTerakhir = dto.pendidikanTerakhir;
    if (dto.agama !== undefined) item.agama = dto.agama;
    if (dto.tempatLahir) item.tempatLahir = dto.tempatLahir;
    if (dto.tanggalLahir) item.tanggalLahir = new Date(dto.tanggalLahir);
    if (dto.keterangan !== undefined) item.keterangan = dto.keterangan;
    if (dto.jenisKelamin) item.jenisKelamin = dto.jenisKelamin;

    // Update SK
    if (dto.skPengangkatanNomor !== undefined || dto.skPengangkatanTanggal !== undefined) {
      const existing = this.tryParseJSON(item.skPengangkatan) as any || {};
      item.skPengangkatan = this.formatSK(
        dto.skPengangkatanNomor ?? existing.nomor,
        dto.skPengangkatanTanggal ?? existing.tanggal
      );
    }

    if (dto.skPemberhentianNomor !== undefined || dto.skPemberhentianTanggal !== undefined) {
      const existing = this.tryParseJSON(item.skPemberhentian) as any || {};
      item.skPemberhentian = this.formatSK(
        dto.skPemberhentianNomor ?? existing.nomor,
        dto.skPemberhentianTanggal ?? existing.tanggal
      );
    }

    const saved = await this.repo.save(item);

    try {
      await this.eventsService.publishEvent({
        topic: EventTopic.APARAT_UPDATED,
        payload: { id: saved.id, changes: dto },
        source_module: SourceModule.APARAT,
        idempotency_key: `aparat-update-${saved.id}-${Date.now()}`,
      });
    } catch (e) { this.logger.warn(`Event Error: ${e.message}`); }

    return saved;
  }

  async patchStatus(id: string, status: string) {
    const item = await this.findOne(id); // findOne sudah parse JSON, tapi save() akan stringify otomatis oleh DB driver biasanya aman
    // Untuk aman, load raw
    const rawItem = await this.repo.findOne({ where: { id } });
    if (!rawItem) throw new NotFoundException();
    rawItem.status = status as StatusAparat;
    return await this.repo.save(rawItem);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    await this.repo.remove(item);

    // ✅ Emit delete event untuk audit log
    try {
      await this.eventsService.publishEvent({
        topic: EventTopic.APARAT_DELETED,
        payload: { 
          id: item.id, 
          nama: item.nama,
          nik: item.nik,
          jabatan: item.jabatan,
          status: item.status,
          deletedAt: new Date().toISOString(),
        },
        source_module: SourceModule.APARAT,
        idempotency_key: `aparat-delete-${item.id}-${Date.now()}`,
      });
    } catch (e) {
      this.logger.warn(`Event publish failed (Ignored): ${e instanceof Error ? e.message : String(e)}`);
    }

    return { message: 'Data berhasil dihapus' };
  }
}