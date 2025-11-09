import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Surat } from './entities/surat.entity';
import { StatusSurat } from './enums/status-surat.enum';
import { JenisSurat } from './enums/jenis-surat.enum';

// Import DTO dari file-file yang sudah dipecah
import { CreateSuratDto } from './dto/create-surat.dto';
import { UpdateSuratDto } from './dto/update-surat.dto';
import { UpdateStatusSuratDto } from './dto/update-status-surat.dto';
import { QuerySuratDto } from './dto/filter-surat.dto';
import { EventsService} from '../events/events.service';
// Import DTO Response (dari Poin 3)
import { PaginatedSuratResponseDto } from './dto/response-surat.dto';
// Import Service baru
import { NomorSuratGeneratorService } from './services/nomor-surat-generator.service';
import { EventTopic, EventStatus, SourceModule} from 'src/events/enums';

@Injectable()
export class SuratService {
  private readonly logger = new Logger(SuratService.name);

  constructor(
    @InjectRepository(Surat)
    private readonly suratRepository: Repository<Surat>,
    private eventsService: EventsService, 

    // Inject service baru
    private readonly nomorSuratGeneratorService: NomorSuratGeneratorService,
  ) {}

  /**
   * Create surat baru
   */
  async create(
    createSuratDto: CreateSuratDto,
    userId?: string,
  ): Promise<Surat> {
    try {
      // Panggil service baru untuk generate nomor
      const nomorSurat =
        await this.nomorSuratGeneratorService.generateNomorSurat();

      // Create entity
      const surat = this.suratRepository.create({
        ...createSuratDto,
        nomor_surat: nomorSurat,
        status: StatusSurat.DRAFT, // Pastikan status ada di entity
        created_by: userId,
      });

      const savedSurat = await this.suratRepository.save(surat);

      await this.eventsService.publishEvent({
      topic: EventTopic.SURAT_CREATED,
      payload: {
        id: savedSurat.id,
        nomorSurat: savedSurat.nomor_surat,
        jenisSurat: savedSurat.jenis,
        perihal: savedSurat.perihal,
        createdAt: savedSurat.created_at,
      },
      source_module: SourceModule.SURAT,
      idempotency_key: `surat-create-${savedSurat.id}`,
    });



      this.logger.log(
        `Surat created: ${savedSurat.nomor_surat} by user ${userId}`,
      );
      return savedSurat;
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        this.logger.error(
          `Failed to create surat. Nomor surat ${error.detail}`,
        );
        throw new ConflictException('Gagal menyimpan, nomor surat mungkin duplikat.');
      }
      this.logger.error(`Failed to create surat: ${error.message}`, error.stack);
      throw new BadRequestException('Gagal membuat surat baru.', error.message);
    }
  }

  /**
   * Get semua surat dengan pagination dan filter
   */
  async findAll(query: QuerySuratDto): Promise<PaginatedSuratResponseDto> {
    const {
      page = 1,
      limit = 20,
      jenis,
      status,
      tanggal_dari,
      tanggal_sampai,
      search,
      sort_by = 'created_at',
      order = 'desc',
    } = query;

    const qb = this.suratRepository.createQueryBuilder('surat');

    if (jenis) {
      qb.andWhere('surat.jenis = :jenis', { jenis });
    }
    if (status) {
      qb.andWhere('surat.status = :status', { status });
    }
    if (tanggal_dari) {
      qb.andWhere('surat.tanggal_surat >= :tanggal_dari', { tanggal_dari });
    }
    if (tanggal_sampai) {
      qb.andWhere('surat.tanggal_surat <= :tanggal_sampai', { tanggal_sampai });
    }
    if (search) {
      qb.andWhere(
        '(surat.perihal ILIKE :search OR surat.nomor_surat ILIKE :search OR surat.pengirim ILIKE :search OR surat.penerima ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Pagination
    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);

    // Sorting
    const validSortBy = ['tanggal_surat', 'created_at', 'nomor_surat', 'perihal'];
    if (validSortBy.includes(sort_by)) {
      qb.orderBy(`surat.${sort_by}`, order.toUpperCase() as 'ASC' | 'DESC');
    }

    // Get results
    const [data, total] = await qb.getManyAndCount();

    // Build meta
    const total_pages = Math.ceil(total / limit);
    const meta = {
      total,
      page,
      limit,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    };

    return { data, meta };
  }

  /**
   * Get detail surat
   */
  async findOne(id: string): Promise<Surat> {
    const surat = await this.suratRepository.findOne({ where: { id } });
    if (!surat) {
      this.logger.warn(`findOne: Surat with ID ${id} not found`);
      throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);
    }
    return surat;
  }

  /**
   * Update surat (hanya DRAFT)
   */
  async update(
    id: string,
    updateSuratDto: UpdateSuratDto,
    userId?: string,
    etag?: string,
  ): Promise<Surat> {
    const surat = await this.findOne(id);
    const oldStatus = surat.status;


    if (etag && surat.etag !== etag) {
      this.logger.warn(`Update conflict: ETag mismatch for ID ${id}`);
      throw new ConflictException('Data telah diubah oleh orang lain. Harap muat ulang.');
    }

    if (!surat.canBeModified()) {
      this.logger.warn(`Update forbidden: Surat ${id} is not DRAFT`);
      throw new BadRequestException(
        `Surat tidak dapat diubah (Status: ${surat.status})`,
      );
    }

    const updatedSurat = this.suratRepository.merge(surat, {
      ...updateSuratDto,
      updated_by: userId,
    });

    try {
      const savedSurat = await this.suratRepository.save(updatedSurat);
      this.logger.log(`Surat ${id} updated by user ${userId}`);

      // ✅ Emit event SURAT_UPDATED
      await this.eventsService.publishEvent({
        topic: EventTopic.SURAT_UPDATED,
        payload: {
          id: savedSurat.id,
          nomorSurat: savedSurat.nomor_surat,
          changes: updateSuratDto,
          oldStatus,
          newStatus: savedSurat.status,
          updatedBy: userId,
          updatedAt: savedSurat.updated_at,
        },
        source_module: SourceModule.SURAT,
        idempotency_key: `surat-update-${savedSurat.id}-${Date.now()}`,
      });

      return savedSurat;
    } catch (error) {
      this.logger.error(`Failed to update surat ${id}: ${error.message}`);
      throw new BadRequestException('Gagal menyimpan perubahan.', error.message);
    }
  }

  /**
   * Update status surat (state machine)
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusSuratDto,
    userId?: string,
  ): Promise<Surat> {
    const surat = await this.findOne(id);
    const oldStatus = surat.status;
    const newStatus = updateStatusDto.status;

    if (!surat.canTransitionTo(newStatus)) {
      this.logger.warn(
        `Invalid status transition: ${surat.status} to ${newStatus} for ${id}`,
      );
      throw new BadRequestException(
        `Perubahan status dari ${surat.status} ke ${newStatus} tidak valid.`,
      );
    }

    surat.status = newStatus;
    surat.updated_by = userId;

    const savedSurat = await this.suratRepository.save(surat);
    this.logger.log(`Status ${id} updated to ${newStatus} by user ${userId}`);

    // ✅ Emit event SURAT_STATUS_CHANGED
    await this.eventsService.publishEvent({
      topic: EventTopic.SURAT_STATUS_CHANGED,
      payload: {
        id: savedSurat.id,
        nomorSurat: savedSurat.nomor_surat,
        oldStatus,
        newStatus,
        changedBy: userId,
        changedAt: new Date(),
      },
      source_module: SourceModule.SURAT,
      idempotency_key: `surat-status-${savedSurat.id}-${newStatus}-${Date.now()}`,
    });

    return savedSurat;
  }

  /**
   * Soft delete surat (hanya DRAFT)
   */
  async remove(id: string, userId?: string): Promise<void> {
    const surat = await this.findOne(id);

    if (!surat.canBeDeleted()) {
      this.logger.warn(`Delete forbidden: Surat ${id} is not DRAFT`);
      throw new BadRequestException(
        `Surat tidak dapat dihapus (Status: ${surat.status})`,
      );
    }

    // Update 'deleted_by'
    surat.updated_by = userId;
    await this.suratRepository.save(surat);

    // Soft delete
    const result = await this.suratRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);
    }
    this.logger.log(`Surat ${id} soft deleted by user ${userId}`);

    await this.eventsService.publishEvent({
      topic: EventTopic.SURAT_DELETED,
      payload: {
        id: surat.id,
        nomorSurat: surat.nomor_surat,
        deletedBy: userId,
        deletedAt: new Date(),
      },
      source_module: SourceModule.SURAT,
      idempotency_key: `surat-delete-${surat.id}`,
    });
  }

  /**
   * Cek jika nomor surat sudah ada
   */
  async nomorSuratExists(nomor: string): Promise<boolean> {
    const count = await this.suratRepository.count({
      where: { nomor_surat: nomor, deleted_at: IsNull() },
    });
    return count > 0;
  }

  /**
   * Get statistik surat
   */
  async getStatistics(): Promise<any> {
    this.logger.log('Fetching statistics...');
    try {
      const stats = await this.suratRepository
        .createQueryBuilder('surat')
        .select('surat.status', 'status')
        .addSelect('COUNT(surat.id)', 'count')
        .groupBy('surat.status')
        .getRawMany();
      return stats;
    } catch (error) {
      this.logger.error('Failed to get statistics', error.stack);
      throw new BadRequestException('Gagal mengambil statistik.');
    }
  }
}