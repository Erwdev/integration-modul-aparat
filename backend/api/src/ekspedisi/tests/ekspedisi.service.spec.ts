import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EkspedisiService } from '../ekspedisi.service';
import { Ekspedisi } from '../entities/ekspedisi.entity';
import { CreateEkspedisiDto } from '../dto/create-ekspedisi.dto';
import { UpdateEkspedisiDto } from '../dto/update-ekspedisi.dto';
import { EventsService } from '../../events/events.service';
import { SuratService } from '../../surat/surat.service';
import { StatusEkspedisi } from '../enums/status-ekspedisi.enum';
import { StatusSurat } from '../../surat/enums/status-surat.enum';
import { EventTopic, SourceModule } from '../../events/enums/event-status.enum';
import { Repository } from 'typeorm';

describe('EkspedisiService', () => {
  let service: EkspedisiService;
  let repository: Repository<Ekspedisi>;
  let eventsService: EventsService;
  let suratService: SuratService;

  // ✅ Mock data BASE (immutable)
  const mockSuratBase = {
    id: 'surat-uuid-123',
    nomor_surat: '001/SK/2025',
    status: StatusSurat.DISETUJUI,
    perihal: 'Test Surat',
  };

  const mockEkspedisiBase = {
    id: 'ekspedisi-uuid-456',
    surat_id: 'surat-uuid-123',
    nomor_resi: 'RESI-2025-001',
    kurir: 'JNE Express',
    tujuan: 'Jakarta',
    status: StatusEkspedisi.DALAM_PERJALANAN,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // ✅ Fresh copies created in beforeEach
  let mockSurat: any;
  let mockEkspedisi: any;

  // ✅ Create full repository mock
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  // ✅ Mock EventsService
  const mockEventsService = {
    publishEvent: jest.fn().mockResolvedValue(undefined),
  };

  // ✅ Mock SuratService
  const mockSuratService = {
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    // ✅ RESET mock data to fresh copies (prevent mutation between tests)
    mockSurat = { ...mockSuratBase };
    mockEkspedisi = { ...mockEkspedisiBase };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EkspedisiService,
        {
          provide: getRepositoryToken(Ekspedisi),
          useValue: mockRepository,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: SuratService,
          useValue: mockSuratService,
        },
      ],
    }).compile();

    service = module.get<EkspedisiService>(EkspedisiService);
    repository = module.get<Repository<Ekspedisi>>(
      getRepositoryToken(Ekspedisi),
    );
    eventsService = module.get<EventsService>(EventsService);
    suratService = module.get<SuratService>(SuratService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new ekspedisi successfully', async () => {
      const dto: CreateEkspedisiDto = {
        surat_id: mockSurat.id,
        nomor_resi: 'RESI-2025-001',
        kurir: 'JNE Express',
        tujuan: 'Jakarta',
      };

      mockSuratService.findOne.mockResolvedValue(mockSurat);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockEkspedisi);
      mockRepository.save.mockResolvedValue(mockEkspedisi);

      const result = await service.create(dto);

      expect(result).toEqual(mockEkspedisi);
      expect(mockSuratService.findOne).toHaveBeenCalledWith(mockSurat.id);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { nomor_resi: dto.nomor_resi },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        status: StatusEkspedisi.DALAM_PERJALANAN,
      });
      expect(mockRepository.save).toHaveBeenCalled();

      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.EKSPEDISI_CREATED,
          payload: expect.objectContaining({
            id: mockEkspedisi.id,
            nomorResi: mockEkspedisi.nomor_resi,
          }),
          source_module: SourceModule.EKSPEDISI,
        }),
      );
    });

    it('should throw NotFoundException if surat not found', async () => {
      const dto: CreateEkspedisiDto = {
        surat_id: 'non-existent-uuid',
        nomor_resi: 'RESI-2025-001',
        kurir: 'JNE',
        tujuan: 'Jakarta',
      };

      mockSuratService.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockSuratService.findOne).toHaveBeenCalledWith(dto.surat_id);
    });

    it('should throw BadRequestException if surat status not DISETUJUI', async () => {
      const dto: CreateEkspedisiDto = {
        surat_id: mockSurat.id,
        nomor_resi: 'RESI-2025-001',
        kurir: 'JNE',
        tujuan: 'Jakarta',
      };

      const suratDraft = { ...mockSurat, status: StatusSurat.DRAFT };
      mockSuratService.findOne.mockResolvedValue(suratDraft);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if nomor_resi already exists', async () => {
      const dto: CreateEkspedisiDto = {
        surat_id: mockSurat.id,
        nomor_resi: 'RESI-2025-001',
        kurir: 'JNE',
        tujuan: 'Jakarta',
      };

      mockSuratService.findOne.mockResolvedValue(mockSurat);
      mockRepository.findOne.mockResolvedValue(mockEkspedisi);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated ekspedisi list', async () => {
      const page = 1;
      const limit = 20;

      mockRepository.findAndCount.mockResolvedValue([[mockEkspedisi], 1]);

      const result = await service.findAll(page, limit);

      expect(result.data).toEqual([mockEkspedisi]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.total_pages).toBe(1);
      expect(result.meta.has_next).toBe(false);
      expect(result.meta.has_prev).toBe(false);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        order: { created_at: 'DESC' },
        relations: ['surat'],
      });
    });

    it('should handle pagination correctly', async () => {
      const page = 2;
      const limit = 10;

      mockRepository.findAndCount.mockResolvedValue([[mockEkspedisi], 25]);

      const result = await service.findAll(page, limit);

      expect(result.meta.total).toBe(25);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total_pages).toBe(3);
      expect(result.meta.has_next).toBe(true);
      expect(result.meta.has_prev).toBe(true);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        order: { created_at: 'DESC' },
        relations: ['surat'],
      });
    });
  });

  describe('findOne', () => {
    it('should return ekspedisi by id', async () => {
      const id = 'ekspedisi-uuid-456';

      mockRepository.findOne.mockResolvedValue(mockEkspedisi);

      const result = await service.findOne(id);

      expect(result).toEqual(mockEkspedisi);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['surat'],
      });
    });

    it('should throw NotFoundException if ekspedisi not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update ekspedisi successfully', async () => {
      const id = mockEkspedisi.id;
      const dto: UpdateEkspedisiDto = {
        kurir: 'POS Indonesia',
        tujuan: 'Bandung',
      };

      // ✅ Create fresh copy for this test
      const freshEkspedisi = { ...mockEkspedisi };
      mockRepository.findOne.mockResolvedValue(freshEkspedisi);

      const updated = { ...freshEkspedisi, ...dto };
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(id, dto);

      expect(result.kurir).toBe(dto.kurir);
      expect(result.tujuan).toBe(dto.tujuan);
      expect(mockRepository.save).toHaveBeenCalled();

      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.EKSPEDISI_UPDATED,
        }),
      );
    });

    it('should throw ConflictException if updating to existing nomor_resi', async () => {
      const id = mockEkspedisi.id;
      const dto: UpdateEkspedisiDto = {
        nomor_resi: 'RESI-DUPLICATE',
      };

      const freshEkspedisi = { ...mockEkspedisi };
      mockRepository.findOne
        .mockResolvedValueOnce(freshEkspedisi)
        .mockResolvedValueOnce({ id: 'another-id' });

      await expect(service.update(id, dto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if ekspedisi not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status from DALAM_PERJALANAN to TERKIRIM', async () => {
      const id = mockEkspedisi.id;
      const newStatus = StatusEkspedisi.TERKIRIM;

      // ✅ Create fresh copy with DALAM_PERJALANAN status
      const freshEkspedisi = { ...mockEkspedisi, status: StatusEkspedisi.DALAM_PERJALANAN };
      mockRepository.findOne.mockResolvedValue(freshEkspedisi);
      mockRepository.save.mockResolvedValue({
        ...freshEkspedisi,
        status: newStatus,
      });

      const result = await service.updateStatus(id, newStatus);

      expect(result.status).toBe(newStatus);
      expect(mockRepository.save).toHaveBeenCalled();

      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.EKSPEDISI_STATUS_CHANGED,
          payload: expect.objectContaining({
            oldStatus: StatusEkspedisi.DALAM_PERJALANAN,
            newStatus: StatusEkspedisi.TERKIRIM,
          }),
        }),
      );

      expect(mockSuratService.updateStatus).toHaveBeenCalledWith(
        freshEkspedisi.surat_id,
        { status: StatusSurat.TERKIRIM },
      );
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const id = mockEkspedisi.id;

      // ✅ Fresh copy with TERKIRIM status
      const terkirimEkspedisi = {
        ...mockEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
      };

      mockRepository.findOne.mockResolvedValue(terkirimEkspedisi);

      await expect(
        service.updateStatus(id, StatusEkspedisi.DALAM_PERJALANAN),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow DIKEMBALIKAN to retry as DALAM_PERJALANAN', async () => {
      const id = mockEkspedisi.id;

      // ✅ Fresh copy with DIKEMBALIKAN status
      const dikembalikanEkspedisi = {
        ...mockEkspedisi,
        status: StatusEkspedisi.DIKEMBALIKAN,
      };

      mockRepository.findOne.mockResolvedValue(dikembalikanEkspedisi);
      mockRepository.save.mockResolvedValue({
        ...dikembalikanEkspedisi,
        status: StatusEkspedisi.DALAM_PERJALANAN,
      });

      const result = await service.updateStatus(
        id,
        StatusEkspedisi.DALAM_PERJALANAN,
        'Retry pengiriman setelah dikembalikan',
      );

      expect(result.status).toBe(StatusEkspedisi.DALAM_PERJALANAN);
      expect(mockEventsService.publishEvent).toHaveBeenCalled();
    });

    it('should include catatan in status update', async () => {
      const id = mockEkspedisi.id;
      const catatan = 'Paket telah sampai di tujuan';

      // ✅ Fresh copy with DALAM_PERJALANAN status
      const freshEkspedisi = { ...mockEkspedisi, status: StatusEkspedisi.DALAM_PERJALANAN };
      mockRepository.findOne.mockResolvedValue(freshEkspedisi);
      mockRepository.save.mockResolvedValue({
        ...freshEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
        catatan,
      });

      const result = await service.updateStatus(
        id,
        StatusEkspedisi.TERKIRIM,
        catatan,
      );

      expect(result.status).toBe(StatusEkspedisi.TERKIRIM);
      expect(result.catatan).toBe(catatan);
    });
  });

  describe('uploadBuktiTerima', () => {
    it('should upload bukti terima and update status to TERKIRIM', async () => {
      const id = mockEkspedisi.id;
      const file = {
        filename: 'bukti-123.jpg',
        path: '/uploads/bukti-terima/bukti-123.jpg',
      } as Express.Multer.File;
      const namaPenerima = 'John Doe';

      // ✅ Fresh copy with DALAM_PERJALANAN status
      const freshEkspedisi = { ...mockEkspedisi, status: StatusEkspedisi.DALAM_PERJALANAN };
      mockRepository.findOne.mockResolvedValue(freshEkspedisi);
      mockRepository.save.mockResolvedValue({
        ...freshEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
        bukti_terima_path: `/uploads/bukti-terima/${file.filename}`,
        nama_penerima: namaPenerima,
        tanggal_terima: expect.any(Date),
      });

      const result = await service.uploadBuktiTerima(id, file, namaPenerima);

      expect(result.status).toBe(StatusEkspedisi.TERKIRIM);
      expect(result.nama_penerima).toBe(namaPenerima);
      expect(result.bukti_terima_path).toContain(file.filename);

      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.EKSPEDISI_DELIVERED,
        }),
      );

      expect(mockSuratService.updateStatus).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already TERKIRIM', async () => {
      const id = mockEkspedisi.id;
      const file = { filename: 'bukti.jpg' } as Express.Multer.File;

      const terkirimEkspedisi = {
        ...mockEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
      };

      mockRepository.findOne.mockResolvedValue(terkirimEkspedisi);

      await expect(
        service.uploadBuktiTerima(id, file, 'John Doe'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow upload bukti when status is DALAM_PERJALANAN', async () => {
      const id = mockEkspedisi.id;
      const file = {
        filename: 'bukti-456.jpg',
        path: '/uploads/bukti-terima/bukti-456.jpg',
      } as Express.Multer.File;
      const namaPenerima = 'Jane Smith';

      const dalamPerjalananEkspedisi = {
        ...mockEkspedisi,
        status: StatusEkspedisi.DALAM_PERJALANAN,
      };

      mockRepository.findOne.mockResolvedValue(dalamPerjalananEkspedisi);
      mockRepository.save.mockResolvedValue({
        ...dalamPerjalananEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
        bukti_terima_path: `/uploads/bukti-terima/${file.filename}`,
        nama_penerima: namaPenerima,
        tanggal_terima: expect.any(Date),
      });

      const result = await service.uploadBuktiTerima(id, file, namaPenerima);

      expect(result.status).toBe(StatusEkspedisi.TERKIRIM);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if ekspedisi not found', async () => {
      const id = 'non-existent-id';
      const file = { filename: 'bukti.jpg' } as Express.Multer.File;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.uploadBuktiTerima(id, file, 'John Doe'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete ekspedisi when status is DALAM_PERJALANAN', async () => {
      const id = mockEkspedisi.id;

      // ✅ Fresh copy with DALAM_PERJALANAN status
      const freshEkspedisi = { ...mockEkspedisi, status: StatusEkspedisi.DALAM_PERJALANAN };
      mockRepository.findOne.mockResolvedValue(freshEkspedisi);
      mockRepository.remove.mockResolvedValue(freshEkspedisi);

      const result = await service.remove(id);

      expect(result.deleted).toBe(true);
      expect(mockRepository.remove).toHaveBeenCalledWith(freshEkspedisi);

      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.EKSPEDISI_DELETED,
        }),
      );
    });

    it('should throw BadRequestException if status is TERKIRIM', async () => {
      const id = mockEkspedisi.id;

      const terkirimEkspedisi = {
        ...mockEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
      };

      mockRepository.findOne.mockResolvedValue(terkirimEkspedisi);

      await expect(service.remove(id)).rejects.toThrow(BadRequestException);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if ekspedisi not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('State Machine Validation', () => {
    it('should allow DALAM_PERJALANAN → TERKIRIM', async () => {
      const id = mockEkspedisi.id;

      // ✅ Fresh copy with DALAM_PERJALANAN
      const freshEkspedisi = { ...mockEkspedisi, status: StatusEkspedisi.DALAM_PERJALANAN };
      mockRepository.findOne.mockResolvedValue(freshEkspedisi);
      mockRepository.save.mockResolvedValue({
        ...freshEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
      });

      await expect(
        service.updateStatus(id, StatusEkspedisi.TERKIRIM),
      ).resolves.toBeDefined();
    });

    it('should allow DALAM_PERJALANAN → GAGAL', async () => {
      const id = mockEkspedisi.id;

      // ✅ Fresh copy with DALAM_PERJALANAN
      const freshEkspedisi = { ...mockEkspedisi, status: StatusEkspedisi.DALAM_PERJALANAN };
      mockRepository.findOne.mockResolvedValue(freshEkspedisi);
      mockRepository.save.mockResolvedValue({
        ...freshEkspedisi,
        status: StatusEkspedisi.GAGAL,
      });

      await expect(
        service.updateStatus(id, StatusEkspedisi.GAGAL),
      ).resolves.toBeDefined();
    });

    it('should NOT allow TERKIRIM → any status', async () => {
      const id = mockEkspedisi.id;

      const terkirimEkspedisi = {
        ...mockEkspedisi,
        status: StatusEkspedisi.TERKIRIM,
      };

      mockRepository.findOne.mockResolvedValue(terkirimEkspedisi);

      await expect(
        service.updateStatus(id, StatusEkspedisi.GAGAL),
      ).rejects.toThrow(BadRequestException);
    });
  });
});