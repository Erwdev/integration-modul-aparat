import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aparat } from './entities/aparat.entity';
import { Repository, Like, In } from 'typeorm';
import { CreateAparatDto } from './dto/create-aparat.dto';
import { UpdateAparatDto } from './dto/update-aparat.dto';
import { FilterAparatDto } from './dto/filter-aparat.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventTopic, SourceModule } from '../events/enums'; 
import { EventsService } from '../events/events.service'; 
import * as crypto from 'crypto';

@Injectable()
export class AparatService {
  private readonly logger = new Logger(AparatService.name); // ✅ Add logger

  constructor(
    @InjectRepository(Aparat)
    private readonly repo: Repository<Aparat>,
    private readonly eventEmitter: EventEmitter2, // Keep for backward compatibility
    private readonly eventsService: EventsService, // ✅ Inject EventsService
  ) {}

  /**
   * Ensure NIK and NIP are unique
   */
  private async ensureUniqueNikNip(
    nik?: string,
    nip?: string,
    excludeId?: string,
  ) {
    if (nik) {
      const q = this.repo
        .createQueryBuilder('a')
        .where('a.nik = :nik', { nik });
      if (excludeId) q.andWhere('a.id_aparat != :id', { id: excludeId });
      const ex = await q.getOne();
      if (ex) {
        this.logger.warn(`NIK ${nik} already exists`);
        throw new ConflictException({
          message: 'NIK already exists',
          error: 'DUPLICATE_NIK',
          nik,
        });
      }
    }
    if (nip) {
      const q2 = this.repo
        .createQueryBuilder('a')
        .where('a.nip = :nip', { nip });
      if (excludeId) q2.andWhere('a.id_aparat != :id', { id: excludeId });
      const ex2 = await q2.getOne();
      if (ex2) {
        this.logger.warn(`NIP ${nip} already exists`);
        throw new ConflictException({
          message: 'NIP already exists',
          error: 'DUPLICATE_NIP',
          nip,
        });
      }
    }
  }

  /**
   * Create new aparat
   */
  async create(dto: CreateAparatDto): Promise<Aparat> {
    try {
      // ✅ Validate uniqueness
      await this.ensureUniqueNikNip(dto.nik, dto.nip);

      // ✅ Generate nomor urut
      const maxUrut = await this.repo
        .createQueryBuilder('a')
        .select('MAX(a.nomor_urut)', 'max')
        .getRawOne();
      const next = (maxUrut?.max ?? 0) + 1;

      // ✅ Create and save
      const aparat = this.repo.create({ ...dto, nomor_urut: next });
      const savedAparat = await this.repo.save(aparat);

      // ✅ Emit event APARAT_CREATED
      await this.eventsService.publishEvent({
        topic: EventTopic.APARAT_CREATED,
        payload: {
          id: savedAparat.id_aparat,
          nip: savedAparat.nip,
          nik: savedAparat.nik,
          nama: savedAparat.nama,
          jabatan: savedAparat.jabatan,
          pangkat_golongan: savedAparat.pangkat_golongan,
          nomor_urut: savedAparat.nomor_urut,
          createdAt: savedAparat.created_at,
        },
        source_module: SourceModule.APARAT,
        idempotency_key: `aparat-create-${savedAparat.id_aparat}`,
      });

      // ✅ Keep backward compatibility with local events
      this.eventEmitter.emit('aparat.created', {
        id: savedAparat.id_aparat,
        nip: savedAparat.nip,
      });

      this.logger.log(
        `Aparat created: ${savedAparat.nip} - ${savedAparat.nama}`,
      );
      return savedAparat;
    } catch (error) {
      // ✅ Re-throw known errors
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // ✅ Handle database errors
      if (error.code === '23505') {
        // Unique constraint violation
        this.logger.error(`Duplicate constraint: ${error.detail}`, error.stack);
        throw new ConflictException({
          message: 'NIK or NIP already exists',
          error: 'DUPLICATE_CONSTRAINT',
          details: error.detail,
        });
      }

      if (error.code === '23503') {
        // Foreign key violation
        this.logger.error(
          `Foreign key violation: ${error.detail}`,
          error.stack,
        );
        throw new BadRequestException({
          message: 'Invalid reference data (jabatan/pangkat/pendidikan)',
          error: 'INVALID_REFERENCE',
          details: error.detail,
        });
      }

      // ✅ Generic error
      this.logger.error(`Failed to create aparat: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to create aparat',
        error: 'CREATE_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * Find all aparat with filters and pagination
   */
  async findAll(filter?: FilterAparatDto) {
    const qb = this.repo.createQueryBuilder('a');

    // ✅ Apply filters
    if (filter?.nama) {
      qb.andWhere('a.nama ILIKE :nama', { nama: `%${filter.nama}%` });
    }
    if (filter?.status) {
      qb.andWhere('a.status = :status', { status: filter.status });
    }
    if (filter?.jabatan) {
      const arr = filter.jabatan.split(',').map((s) => s.trim());
      qb.andWhere('a.jabatan IN (:...jabatan)', { jabatan: arr });
    }

    // ✅ Sorting
    const sortBy = filter?.sortBy ?? 'updated_at';
    const order = (filter?.order ?? 'DESC').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`a.${sortBy}`, order);

    // ✅ Pagination
    const page = Math.max(1, Number(filter?.page ?? 1));
    const limit = Math.min(100, Number(filter?.limit ?? 20));
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
      },
    };
  }

  /**
   * Find one aparat by ID
   */
  async findOne(id: string): Promise<Aparat> {
    const item = await this.repo.findOne({ where: { id_aparat: id } });
    if (!item) {
      this.logger.warn(`Aparat with ID ${id} not found`);
      throw new NotFoundException({
        message: 'Aparat not found',
        error: 'NOT_FOUND',
        id,
      });
    }
    return item;
  }

  /**
   * Update aparat
   */
  async update(id: string, dto: UpdateAparatDto) {
    try {
      // ✅ 1. Validate uniqueness (bisa throw ConflictException)
      await this.ensureUniqueNikNip(dto.nik, dto.nip, id);
      
      // ✅ 2. Get existing data
      const item = await this.findOne(id);
      
      // ✅ 3. Store old values before update
      const oldValues = {
        nip: item.nip,
        nik: item.nik,
        nama: item.nama,
        jabatan: item.jabatan,
        pangkat_golongan: item.pangkat_golongan,
        status: item.status,
      };
      
      // ✅ 4. Update fields
      Object.assign(item, dto);
      
      // ✅ 5. Save
      const saved = await this.repo.save(item);
      
      // ✅ 6. Publish event APARAT_UPDATED (HANYA JIKA BERHASIL!)
      await this.eventsService.publishEvent({
        topic: EventTopic.APARAT_UPDATED,
        payload: {
          id: saved.id_aparat,
          nip: saved.nip,
          nik: saved.nik,
          nama: saved.nama,
          jabatan: saved.jabatan,
          pangkat_golongan: saved.pangkat_golongan,
          status: saved.status,
          changes: dto,
          oldValues,
          version: saved.version,
          updatedAt: saved.updated_at,
        },
        source_module: SourceModule.APARAT,
        idempotency_key: this.generateIdempotencyKey('aparat-update', {
          id: saved.id_aparat,
          changes: dto,
          timestamp: saved.updated_at,
        }),
      });

      // ✅ Keep backward compatibility with local events
      this.eventEmitter.emit('aparat.updated', {
        id: saved.id_aparat,
        updated_at: saved.updated_at,
      });

      this.logger.log(`Aparat ${id} updated: ${saved.nip}`);
      return saved;
    } catch (error) {
      // ✅ Re-throw known errors without publishing events
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // ✅ Handle database errors
      if (error.code === '23505') {
        this.logger.error(`Duplicate constraint on update: ${error.detail}`, error.stack);
        throw new ConflictException({
          message: 'NIK or NIP already exists',
          error: 'DUPLICATE_CONSTRAINT',
          details: error.detail,
        });
      }

      if (error.code === '23503') {
        this.logger.error(`Foreign key violation on update: ${error.detail}`, error.stack);
        throw new BadRequestException({
          message: 'Invalid reference data',
          error: 'INVALID_REFERENCE',
          details: error.detail,
        });
      }

      // ✅ Generic error
      this.logger.error(`Failed to update aparat ${id}: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to update aparat',
        error: 'UPDATE_FAILED',
        details: error.message,
      });
    }
  }
  /**
   * Patch status only
   */
  async patchStatus(id: string, status: string) {
    try {
      const item = await this.findOne(id);
      const oldStatus = item.status;

      item.status = status as any;
      item.version = (item.version ?? 1) + 1;

      const saved = await this.repo.save(item);

      // ✅ Emit event STATUS_CHANGED
      await this.eventsService.publishEvent({
        topic: EventTopic.APARAT_STATUS_CHANGED,
        payload: {
          id: saved.id_aparat,
          nip: saved.nip,
          nama: saved.nama,
          oldStatus,
          newStatus: status,
          changedAt: saved.updated_at,
        },
        source_module: SourceModule.APARAT,
        idempotency_key: this.generateIdempotencyKey('aparat-status', {
          id: saved.id_aparat,
          status,
          timestamp: saved.updated_at,
        }),
      });

      // ✅ Keep backward compatibility
      this.eventEmitter.emit('aparat.updated', {
        id: saved.id_aparat,
        status: saved.status,
      });

      this.logger.log(`Aparat ${id} status changed: ${oldStatus} → ${status}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to patch status for aparat ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException({
        message: 'Failed to update status',
        error: 'STATUS_UPDATE_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * Remove aparat (soft delete if supported)
   */
  async remove(id: string) {
    try {
      const item = await this.findOne(id);

      // ✅ Store data before deletion
      const deletedData = {
        id: item.id_aparat,
        nip: item.nip,
        nik: item.nik,
        nama: item.nama,
        jabatan: item.jabatan,
      };

      await this.repo.remove(item);

      // ✅ Emit event APARAT_DELETED
      await this.eventsService.publishEvent({
        topic: EventTopic.APARAT_DELETED,
        payload: {
          ...deletedData,
          deletedAt: new Date(),
        },
        source_module: SourceModule.APARAT,
        idempotency_key: `aparat-delete-${item.id_aparat}`,
      });

      // ✅ Keep backward compatibility
      this.eventEmitter.emit('aparat.deleted', { id });

      this.logger.log(`Aparat ${id} deleted: ${item.nip}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to delete aparat ${id}: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to delete aparat',
        error: 'DELETE_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * Generate idempotency key using hash
   */
  private generateIdempotencyKey(prefix: string, data: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
    return `${prefix}-${hash}`;
  }
}