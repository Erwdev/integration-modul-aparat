import { Injectable, NotFoundException,ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ekspedisi } from './entities/ekspedisi.entity';
import { CreateEkspedisiDto } from './dto/create-ekspedisi.dto';
import { UpdateEkspedisiDto } from './dto/update-ekspedisi.dto';
import { EventsService } from 'src/events/events.service';
import { EventTopic, SourceModule } from '../events/enums/event-status.enum';
import { SuratService } from 'src/surat/surat.service';
import { StatusSurat } from '../surat/enums/status-surat.enum';
import { StatusEkspedisi } from '../ekspedisi/enums/status-ekspedisi.enum';
import * as crypto from 'crypto';

@Injectable()
export class EkspedisiService {
  constructor(
    @InjectRepository(Ekspedisi)
    private readonly ekspedisiRepository: Repository<Ekspedisi>,
    private readonly eventsService: EventsService,
    private readonly suratService: SuratService,
  ) {}

  logger = new Logger(EkspedisiService.name)

  async create(dto: CreateEkspedisiDto): Promise<Ekspedisi> {
    try {
      // ✅ 1. Validate surat exists
      const surat = await this.suratService.findOne(dto.surat_id);

      if (!surat) {
        throw new NotFoundException(
          `Surat dengan ID ${dto.surat_id} tidak ditemukan`,
        );
      }

      // ✅ 2. Validate surat status (harus DISETUJUI untuk dikirim)
      if (surat.status !== StatusSurat.DISETUJUI) {
        throw new BadRequestException({
          message: `Surat harus berstatus DISETUJUI untuk dapat dikirim`,
          error: 'INVALID_SURAT_STATUS',
          currentStatus: surat.status,
          requiredStatus: StatusSurat.DISETUJUI,
        });
      }

      // ✅ 3. Check nomor resi uniqueness
      const existingResi = await this.ekspedisiRepository.findOne({
        where: { nomor_resi: dto.nomor_resi },
      });

      if (existingResi) {
        throw new ConflictException({
          message: `Nomor resi ${dto.nomor_resi} sudah digunakan`,
          error: 'DUPLICATE_RESI',
          nomor_resi: dto.nomor_resi,
        });
      }

      // ✅ 4. Create ekspedisi
      const ekspedisi = this.ekspedisiRepository.create({
        ...dto,
        status: StatusEkspedisi.DALAM_PERJALANAN, // Default status
      });

      const savedEkspedisi = await this.ekspedisiRepository.save(ekspedisi);

      // ✅ 5. Update surat status to TERKIRIM (optional, tergantung business logic)
      // Uncomment jika surat langsung jadi TERKIRIM saat ekspedisi dibuat
      // await this.suratService.updateStatus(
      //   surat.id,
      //   { status: StatusSurat.TERKIRIM },
      // );

      // ✅ 6. Emit event EKSPEDISI_CREATED
      await this.eventsService.publishEvent({
        topic: EventTopic.EKSPEDISI_CREATED,
        payload: {
          id: savedEkspedisi.id,
          suratId: savedEkspedisi.surat_id,
          nomorSurat: surat.nomor_surat,
          nomorResi: savedEkspedisi.nomor_resi,
          kurir: savedEkspedisi.kurir,
          tujuan: savedEkspedisi.tujuan,
          status: savedEkspedisi.status,
          createdAt: savedEkspedisi.created_at,
        },
        source_module: SourceModule.EKSPEDISI,
        idempotency_key: `ekspedisi-create-${savedEkspedisi.id}`,
      });

      this.logger.log(
        `Ekspedisi created: ${savedEkspedisi.nomor_resi} for surat ${surat.nomor_surat}`,
      );

      return savedEkspedisi;
    } catch (error) {
      // ✅ Re-throw known errors
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // ✅ Handle database errors
      if (error.code === '23505') {
        // Unique constraint violation
        this.logger.error(`Duplicate nomor resi: ${error.detail}`, error.stack);
        throw new ConflictException({
          message: 'Nomor resi sudah digunakan',
          error: 'DUPLICATE_RESI',
          details: error.detail,
        });
      }

      if (error.code === '23503') {
        // Foreign key violation
        this.logger.error(`Foreign key violation: ${error.detail}`, error.stack);
        throw new BadRequestException({
          message: 'Surat ID tidak valid',
          error: 'INVALID_SURAT_ID',
          details: error.detail,
        });
      }

      // ✅ Generic error
      this.logger.error(`Failed to create ekspedisi: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Gagal membuat ekspedisi',
        error: 'CREATE_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * ✅ Find all ekspedisi dengan pagination
   */
  async findAll(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const [data, total] = await this.ekspedisiRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { created_at: 'DESC' },
        relations: ['surat'], // ✅ Include surat relation
      });

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
    } catch (error) {
      this.logger.error(`Failed to fetch ekspedisi: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Gagal mengambil data ekspedisi',
        error: 'FETCH_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * ✅ Find one ekspedisi by ID
   */
  async findOne(id: string): Promise<Ekspedisi> {
    try {
      const ekspedisi = await this.ekspedisiRepository.findOne({
        where: { id },
        relations: ['surat'], // ✅ Include surat relation
      });

      if (!ekspedisi) {
        this.logger.warn(`Ekspedisi with ID ${id} not found`);
        throw new NotFoundException({
          message: `Ekspedisi dengan ID ${id} tidak ditemukan`,
          error: 'NOT_FOUND',
          id,
        });
      }

      return ekspedisi;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to find ekspedisi ${id}: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Gagal mengambil data ekspedisi',
        error: 'FETCH_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * ✅ Update ekspedisi (general update)
   */
  async update(id: string, dto: UpdateEkspedisiDto): Promise<Ekspedisi> {
    try {
      const ekspedisi = await this.findOne(id);

      // ✅ Store old values for event
      const oldValues = {
        kurir: ekspedisi.kurir,
        tujuan: ekspedisi.tujuan,
        status: ekspedisi.status,
      };

      // ✅ Check nomor resi uniqueness if updating
      if (dto.nomor_resi && dto.nomor_resi !== ekspedisi.nomor_resi) {
        const existingResi = await this.ekspedisiRepository.findOne({
          where: { nomor_resi: dto.nomor_resi },
        });

        if (existingResi) {
          throw new ConflictException({
            message: `Nomor resi ${dto.nomor_resi} sudah digunakan`,
            error: 'DUPLICATE_RESI',
            nomor_resi: dto.nomor_resi,
          });
        }
      }

      Object.assign(ekspedisi, dto);
      const updatedEkspedisi = await this.ekspedisiRepository.save(ekspedisi);

      // ✅ Emit event EKSPEDISI_UPDATED
      await this.eventsService.publishEvent({
        topic: EventTopic.EKSPEDISI_UPDATED,
        payload: {
          id: updatedEkspedisi.id,
          suratId: updatedEkspedisi.surat_id,
          nomorResi: updatedEkspedisi.nomor_resi,
          changes: dto,
          oldValues,
          updatedAt: updatedEkspedisi.updated_at,
        },
        source_module: SourceModule.EKSPEDISI,
        idempotency_key: this.generateIdempotencyKey('ekspedisi-update', {
          id: updatedEkspedisi.id,
          changes: dto,
          timestamp: updatedEkspedisi.updated_at,
        }),
      });

      this.logger.log(`Ekspedisi ${id} updated: ${updatedEkspedisi.nomor_resi}`);
      return updatedEkspedisi;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(`Failed to update ekspedisi ${id}: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Gagal mengupdate ekspedisi',
        error: 'UPDATE_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * ✅ Upload bukti terima pengiriman
   */
  async uploadBuktiTerima(
    id: string,
    file: Express.Multer.File,
    namaPenerima: string,
  ): Promise<Ekspedisi> {
    try {
      const ekspedisi = await this.findOne(id);

      // ✅ Validate: can't upload if already TERKIRIM
      if (ekspedisi.status === StatusEkspedisi.TERKIRIM) {
        throw new BadRequestException({
          message: 'Bukti terima sudah pernah diupload',
          error: 'ALREADY_DELIVERED',
          currentStatus: ekspedisi.status,
        });
      }

      // ✅ Update bukti terima fields
      ekspedisi.bukti_terima_path = `/uploads/bukti-terima/${file.filename}`;
      ekspedisi.nama_penerima = namaPenerima;
      ekspedisi.tanggal_terima = new Date();
      ekspedisi.status = StatusEkspedisi.TERKIRIM;

      const updatedEkspedisi = await this.ekspedisiRepository.save(ekspedisi);

      // ✅ Emit event DELIVERED
      await this.eventsService.publishEvent({
        topic: EventTopic.EKSPEDISI_DELIVERED,
        payload: {
          id: updatedEkspedisi.id,
          suratId: updatedEkspedisi.surat_id,
          nomorResi: updatedEkspedisi.nomor_resi,
          namaPenerima: updatedEkspedisi.nama_penerima,
          tanggalTerima: updatedEkspedisi.tanggal_terima,
          buktiTerimaPath: updatedEkspedisi.bukti_terima_path,
          deliveredAt: new Date(),
        },
        source_module: SourceModule.EKSPEDISI,
        idempotency_key: `ekspedisi-delivered-${updatedEkspedisi.id}`,
      });

      // ✅ Update surat status to TERKIRIM
      await this.suratService.updateStatus(
        updatedEkspedisi.surat_id,
        { status: StatusSurat.TERKIRIM },
      );

      this.logger.log(
        `Bukti terima uploaded for ekspedisi ${id} by ${namaPenerima}`,
      );

      return updatedEkspedisi;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to upload bukti terima for ekspedisi ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException({
        message: 'Gagal mengupload bukti terima',
        error: 'UPLOAD_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * ✅ Update status ekspedisi dengan validasi state machine
   */
  async updateStatus(
    id: string,
    status: StatusEkspedisi,
    catatan?: string,
  ): Promise<Ekspedisi> {
    try {
      const ekspedisi = await this.findOne(id);
      const oldStatus = ekspedisi.status;

      // ✅ Validate status transition
      this.validateStatusTransition(oldStatus, status);

      ekspedisi.status = status;
      if (catatan) {
        ekspedisi.catatan = catatan;
      }

      const updatedEkspedisi = await this.ekspedisiRepository.save(ekspedisi);

      // ✅ Emit event STATUS_CHANGED
      await this.eventsService.publishEvent({
        topic: EventTopic.EKSPEDISI_STATUS_CHANGED,
        payload: {
          id: updatedEkspedisi.id,
          suratId: updatedEkspedisi.surat_id,
          nomorResi: updatedEkspedisi.nomor_resi,
          oldStatus,
          newStatus: status,
          catatan,
          changedAt: new Date(),
        },
        source_module: SourceModule.EKSPEDISI,
        idempotency_key: this.generateIdempotencyKey('ekspedisi-status', {
          id: updatedEkspedisi.id,
          status,
          timestamp: updatedEkspedisi.updated_at,
        }),
      });

      // ✅ Update surat status jika ekspedisi TERKIRIM
      if (status === StatusEkspedisi.TERKIRIM) {
        await this.suratService.updateStatus(
          updatedEkspedisi.surat_id,
          { status: StatusSurat.TERKIRIM },
        );
      }

      this.logger.log(
        `Ekspedisi ${id} status changed: ${oldStatus} → ${status}`,
      );

      return updatedEkspedisi;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update status for ekspedisi ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException({
        message: 'Gagal mengupdate status ekspedisi',
        error: 'UPDATE_STATUS_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * ✅ Soft delete ekspedisi (hanya untuk status DALAM_PERJALANAN)
   */
  async remove(id: string): Promise<{ deleted: boolean; message: string }> {
    try {
      const ekspedisi = await this.findOne(id);

      // ✅ Validate: can't delete if already TERKIRIM
      if (ekspedisi.status === StatusEkspedisi.TERKIRIM) {
        throw new BadRequestException({
          message: 'Ekspedisi yang sudah terkirim tidak dapat dihapus',
          error: 'CANNOT_DELETE_DELIVERED',
          currentStatus: ekspedisi.status,
        });
      }

      // ✅ Store data before deletion
      const deletedData = {
        id: ekspedisi.id,
        nomorResi: ekspedisi.nomor_resi,
        suratId: ekspedisi.surat_id,
      };

      await this.ekspedisiRepository.remove(ekspedisi);

      // ✅ Emit event EKSPEDISI_DELETED
      await this.eventsService.publishEvent({
        topic: EventTopic.EKSPEDISI_DELETED,
        payload: {
          ...deletedData,
          deletedAt: new Date(),
        },
        source_module: SourceModule.EKSPEDISI,
        idempotency_key: `ekspedisi-delete-${ekspedisi.id}`,
      });

      this.logger.log(`Ekspedisi ${id} deleted: ${ekspedisi.nomor_resi}`);

      return {
        deleted: true,
        message: `Ekspedisi ${ekspedisi.nomor_resi} berhasil dihapus`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Failed to delete ekspedisi ${id}: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Gagal menghapus ekspedisi',
        error: 'DELETE_FAILED',
        details: error.message,
      });
    }
  }

  /**
   * ✅ Validate status transition (state machine)
   */
  private validateStatusTransition(
    oldStatus: StatusEkspedisi,
    newStatus: StatusEkspedisi,
  ): void {
    const validTransitions: Record<StatusEkspedisi, StatusEkspedisi[]> = {
      [StatusEkspedisi.DALAM_PERJALANAN]: [
        StatusEkspedisi.TERKIRIM,
        StatusEkspedisi.GAGAL,
        StatusEkspedisi.DIKEMBALIKAN,
      ],
      [StatusEkspedisi.TERKIRIM]: [], // Final state - no transitions allowed
      [StatusEkspedisi.GAGAL]: [
        StatusEkspedisi.DALAM_PERJALANAN, // Retry
      ],
      [StatusEkspedisi.DIKEMBALIKAN]: [
        StatusEkspedisi.DALAM_PERJALANAN, // Retry
      ],
    };

    const allowedTransitions = validTransitions[oldStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      this.logger.warn(
        `Invalid status transition: ${oldStatus} → ${newStatus}`,
      );
      throw new BadRequestException({
        message: `Perubahan status dari ${oldStatus} ke ${newStatus} tidak valid`,
        error: 'INVALID_STATUS_TRANSITION',
        oldStatus,
        newStatus,
        allowedTransitions,
      });
    }
  }

  /**
   * ✅ Generate idempotency key using hash
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
