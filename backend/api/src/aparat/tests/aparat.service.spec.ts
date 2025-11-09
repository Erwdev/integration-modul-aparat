import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AparatService } from '../aparat.service';
import { Aparat } from '../entities/aparat.entity';
import { EventsService } from '../../events/events.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StatusAparat } from '../enums/status-aparat.enum';
import { EventTopic, SourceModule } from '../../events/enums/event-status.enum';

describe('AparatService', () => {
  let service: AparatService;
  let repository: Repository<Aparat>;
  let eventsService: EventsService;
  let eventEmitter: EventEmitter2;

  // ✅ Base mock data (immutable)
  const mockAparatBase: Partial<Aparat> = {
    id_aparat: '123e4567-e89b-12d3-a456-426614174000',
    nip: '196801011990031001',
    nik: '3201011234567890',
    nama: 'John Doe',
    jabatan: 'Kepala Desa',
    pangkat_golongan: 'Pembina (IV/a)',
    nomor_urut: 1,
    status: StatusAparat.AKTIF,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    version: 1,
  };

  // ✅ Fresh copy created in beforeEach
  let mockAparat: Partial<Aparat>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEventsService = {
    publishEvent: jest.fn().mockResolvedValue(undefined),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  // ✅ Helper to create QueryBuilder mock
  const createMockQueryBuilder = () => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getOne: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  });

  beforeEach(async () => {
    // ✅ Reset to fresh copy
    mockAparat = { ...mockAparatBase };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AparatService,
        {
          provide: getRepositoryToken(Aparat),
          useValue: mockRepository,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AparatService>(AparatService);
    repository = module.get<Repository<Aparat>>(getRepositoryToken(Aparat));
    eventsService = module.get<EventsService>(EventsService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // ✅ Reset QueryBuilder mock
    mockRepository.createQueryBuilder.mockReturnValue(createMockQueryBuilder());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new aparat successfully', async () => {
      const dto = {
        nip: mockAparat.nip,
        nik: mockAparat.nik,
        nama: mockAparat.nama,
        jabatan: mockAparat.jabatan,
        pangkat_golongan: mockAparat.pangkat_golongan,
      };

      // ✅ Mock unique check (no existing)
      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null); // No duplicate NIK/NIP
      qb.getRawOne.mockResolvedValue({ max: 0 }); // Max nomor_urut
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      // ✅ Mock create and save
      mockRepository.create.mockReturnValue(mockAparat);
      mockRepository.save.mockResolvedValue(mockAparat);

      const result = await service.create(dto as any);

      expect(result).toEqual(mockAparat);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        nomor_urut: 1,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      
      // ✅ Verify event published
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.APARAT_CREATED,
          payload: expect.objectContaining({
            id: mockAparat.id_aparat,
            nip: mockAparat.nip,
            nama: mockAparat.nama,
          }),
          source_module: SourceModule.APARAT,
          idempotency_key: expect.stringContaining('aparat-create-'),
        }),
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('aparat.created', {
        id: mockAparat.id_aparat,
        nip: mockAparat.nip,
      });
    });

    it('should throw ConflictException if NIK already exists', async () => {
      const dto = {
        nip: '196801011990031002',
        nik: mockAparat.nik, // Same NIK
        nama: 'Jane Doe',
        jabatan: 'Sekretaris Desa',
        pangkat_golongan: 'Penata (III/c)',
      };

      // ✅ Mock existing NIK
      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValueOnce({ ...mockAparat }); // NIK exists
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if NIP already exists', async () => {
      const dto = {
        nip: mockAparat.nip, // Same NIP
        nik: '3201011234567891',
        nama: 'Jane Doe',
        jabatan: 'Sekretaris Desa',
        pangkat_golongan: 'Penata (III/c)',
      };

      // ✅ Mock unique checks
      const qb = createMockQueryBuilder();
      qb.getOne
        .mockResolvedValueOnce(null) // NIK check OK
        .mockResolvedValueOnce({ ...mockAparat }); // NIP exists
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle database unique constraint violation', async () => {
      const dto = {
        nip: '196801011990031002',
        nik: '3201011234567891',
        nama: 'Jane Doe',
        jabatan: 'Sekretaris',
        pangkat_golongan: 'Penata (III/c)',
      };

      // ✅ Mock checks pass
      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      qb.getRawOne.mockResolvedValue({ max: 0 });
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      mockRepository.create.mockReturnValue(mockAparat);

      // ✅ Mock database error
      const dbError: any = new Error('Duplicate');
      dbError.code = '23505';
      dbError.detail = 'Key (nip)=(196801011990031002) already exists.';
      mockRepository.save.mockRejectedValue(dbError);

      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle database foreign key violation', async () => {
      const dto = {
        nip: '196801011990031002',
        nik: '3201011234567891',
        nama: 'Jane Doe',
        jabatan: 'Invalid Jabatan',
        pangkat_golongan: 'Penata (III/c)',
      };

      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      qb.getRawOne.mockResolvedValue({ max: 0 });
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      mockRepository.create.mockReturnValue(mockAparat);

      // ✅ Mock foreign key error
      const dbError: any = new Error('FK violation');
      dbError.code = '23503';
      dbError.detail = 'Key (jabatan_id)=(999) is not present in table "jabatan".';
      mockRepository.save.mockRejectedValue(dbError);

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should auto-increment nomor_urut', async () => {
      const dto = {
        nip: '196801011990031002',
        nik: '3201011234567891',
        nama: 'Jane Doe',
        jabatan: 'Sekretaris',
        pangkat_golongan: 'Penata (III/c)',
      };

      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      qb.getRawOne.mockResolvedValue({ max: 5 }); // ✅ Max is 5
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const created = { ...mockAparat, nomor_urut: 6 };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      await service.create(dto as any);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        nomor_urut: 6, // ✅ Should be 6
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockData = [
        mockAparat,
        { ...mockAparat, id_aparat: 'another-id' },
      ];

      const qb = createMockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([mockData, 2]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        page: 1,
        limit: 20,
      });

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.total_pages).toBe(1);
      expect(result.meta.has_next).toBe(false);
      expect(result.meta.has_prev).toBe(false);
    });

    it('should apply filters correctly', async () => {
      const qb = createMockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[mockAparat], 1]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        nama: 'John',
        status: 'aktif',
        jabatan: 'Kepala Desa',
        page: 1,
        limit: 20,
      });

      expect(qb.andWhere).toHaveBeenCalledWith('a.nama ILIKE :nama', {
        nama: '%John%',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('a.status = :status', {
        status: 'aktif',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('a.jabatan IN (:...jabatan)', {
        jabatan: ['Kepala Desa'],
      });
    });

    it('should handle pagination correctly', async () => {
      const mockData = Array(5)
        .fill(null)
        .map((_, i) => ({ ...mockAparat, id_aparat: `id-${i}` }));

      const qb = createMockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([mockData, 25]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        page: 2,
        limit: 10,
      });

      expect(result.meta.total).toBe(25);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total_pages).toBe(3);
      expect(result.meta.has_next).toBe(true);
      expect(result.meta.has_prev).toBe(true);

      expect(qb.skip).toHaveBeenCalledWith(10); // (page-1) * limit
      expect(qb.take).toHaveBeenCalledWith(10);
    });

    it('should apply sorting correctly', async () => {
      const qb = createMockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[mockAparat], 1]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        sortBy: 'nama',
        order: 'ASC',
      });

      expect(qb.orderBy).toHaveBeenCalledWith('a.nama', 'ASC');
    });

    it('should default to page 1 and limit 20', async () => {
      const qb = createMockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[mockAparat], 1]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(20);
    });

    it('should handle multiple jabatan filters', async () => {
      const qb = createMockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[mockAparat], 1]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        jabatan: 'Kepala Desa, Sekretaris Desa, Bendahara',
      });

      expect(qb.andWhere).toHaveBeenCalledWith('a.jabatan IN (:...jabatan)', {
        jabatan: ['Kepala Desa', 'Sekretaris Desa', 'Bendahara'],
      });
    });

    it('should use default sorting if not specified', async () => {
      const qb = createMockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[mockAparat], 1]);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({});

      expect(qb.orderBy).toHaveBeenCalledWith('a.updated_at', 'DESC');
    });
  });

  describe('findOne', () => {
    it('should return aparat by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockAparat);

      const result = await service.findOne(mockAparat.id_aparat);

      expect(result).toEqual(mockAparat);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id_aparat: mockAparat.id_aparat },
      });
    });

    it('should throw NotFoundException if aparat not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update aparat successfully', async () => {
      const dto = {
        nama: 'John Doe Updated',
        jabatan: 'Sekretaris Desa',
      };

      const updated = { ...mockAparat, ...dto, version: 2 };

      // ✅ Mock findOne
      mockRepository.findOne.mockResolvedValue(mockAparat);

      // ✅ Mock unique checks
      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      // ✅ Mock save
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(mockAparat.id_aparat as string, dto as any);

      expect(result.nama).toBe(dto.nama);
      expect(result.jabatan).toBe(dto.jabatan);
      expect(result.version).toBe(2);
      
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.APARAT_UPDATED,
          payload: expect.objectContaining({
            id: mockAparat.id_aparat,
            changes: dto,
            oldValues: expect.objectContaining({
              nama: mockAparat.nama,
              jabatan: mockAparat.jabatan,
            }),
          }),
        }),
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('aparat.updated', {
        id: mockAparat.id_aparat,
        updated_at: updated.updated_at,
      });
    });

    it('should throw ConflictException if updating to existing NIK', async () => {
      const dto = {
        nik: '3201011234567891',
      };

      // ✅ Mock findOne
      mockRepository.findOne.mockResolvedValue(mockAparat);

      // ✅ Mock existing NIK
      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue({ ...mockAparat, id_aparat: 'another-id' });
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.update(mockAparat.id_aparat as string, dto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if updating to existing NIP', async () => {
      const dto = {
        nip: '196801011990031002',
      };

      mockRepository.findOne.mockResolvedValue(mockAparat);

      const qb = createMockQueryBuilder();
      qb.getOne
        .mockResolvedValueOnce(null) // NIK check (no NIK in dto)
        .mockResolvedValueOnce({ ...mockAparat, id_aparat: 'another-id' }); // NIP exists
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.update(mockAparat.id_aparat as string, dto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if aparat not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow updating with same NIK/NIP', async () => {
      const dto = {
        nama: 'John Doe Updated',
        nik: mockAparat.nik, // Same NIK
        nip: mockAparat.nip, // Same NIP
      };

      const updated = { ...mockAparat, ...dto, version: 2 };

      mockRepository.findOne.mockResolvedValue(mockAparat);

      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null); // No conflict (same aparat)
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(mockAparat.id_aparat as string, dto as any);

      expect(result.nama).toBe(dto.nama);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('patchStatus', () => {
    it('should update status successfully', async () => {
      const newStatus = StatusAparat.NONAKTIF;
      const updated = { ...mockAparat, status: newStatus, version: 2 };

      mockRepository.findOne.mockResolvedValue(mockAparat);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.patchStatus(mockAparat.id_aparat as string, newStatus);

      expect(result.status).toBe(newStatus);
      expect(result.version).toBe(2);
      
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.APARAT_STATUS_CHANGED,
          payload: expect.objectContaining({
            id: mockAparat.id_aparat,
            oldStatus: StatusAparat.AKTIF,
            newStatus: StatusAparat.NONAKTIF,
          }),
        }),
      );
    });

    it('should throw NotFoundException if aparat not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.patchStatus('non-existent-id', StatusAparat.NONAKTIF),
      ).rejects.toThrow(NotFoundException);
    });

    it('should increment version on status change', async () => {
      const newStatus = StatusAparat.CUTI;
      const updated = { ...mockAparat, status: newStatus, version: 3 };

      mockRepository.findOne.mockResolvedValue({ ...mockAparat, version: 2 });
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.patchStatus(mockAparat.id_aparat as string, newStatus);

      expect(result.version).toBe(3);
    });
  });

  describe('remove', () => {
    it('should remove aparat successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAparat);
      mockRepository.remove.mockResolvedValue(mockAparat);

      await service.remove(mockAparat.id_aparat as string);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAparat);
      
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.APARAT_DELETED,
          payload: expect.objectContaining({
            id: mockAparat.id_aparat,
            nip: mockAparat.nip,
            nik: mockAparat.nik,
            nama: mockAparat.nama,
          }),
          source_module: SourceModule.APARAT,
          idempotency_key: expect.stringContaining('aparat-delete-'),
        }),
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('aparat.deleted', {
        id: mockAparat.id_aparat,
      });
    });

    it('should throw NotFoundException if aparat not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not throw if remove fails after findOne succeeds', async () => {
      mockRepository.findOne.mockResolvedValue(mockAparat);
      mockRepository.remove.mockRejectedValue(new Error('Database error'));

      await expect(service.remove(mockAparat.id_aparat as string)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('generateIdempotencyKey (private method)', () => {
    it('should generate consistent hash for same data', () => {
      // ✅ Access private method via reflection
      const method = (service as any).generateIdempotencyKey;

      const data = { id: '123', timestamp: '2024-01-01' };
      const key1 = method.call(service, 'test', data);
      const key2 = method.call(service, 'test', data);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^test-[a-f0-9]{16}$/);
    });

    it('should generate different hash for different data', () => {
      const method = (service as any).generateIdempotencyKey;

      const key1 = method.call(service, 'test', { id: '123' });
      const key2 = method.call(service, 'test', { id: '456' });

      expect(key1).not.toBe(key2);
    });

    it('should generate different hash for different prefix', () => {
      const method = (service as any).generateIdempotencyKey;

      const data = { id: '123' };
      const key1 = method.call(service, 'create', data);
      const key2 = method.call(service, 'update', data);

      expect(key1).not.toBe(key2);
      expect(key1).toMatch(/^create-/);
      expect(key2).toMatch(/^update-/);
    });
  });

  describe('Error Handling', () => {
    it('should handle generic errors in create', async () => {
      const dto = {
        nip: '196801011990031001',
        nik: '3201011234567890',
        nama: 'John Doe',
        jabatan: 'Kepala Desa',
        pangkat_golongan: 'Pembina (IV/a)',
      };

      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      qb.getRawOne.mockResolvedValue({ max: 0 });
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      mockRepository.create.mockReturnValue(mockAparat);
      mockRepository.save.mockRejectedValue(new Error('Network error'));

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle generic errors in update', async () => {
      const dto = { nama: 'Updated Name' };

      mockRepository.findOne.mockResolvedValue(mockAparat);

      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      mockRepository.save.mockRejectedValue(new Error('Network error'));

      await expect(
        service.update(mockAparat.id_aparat as string, dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle generic errors in patchStatus', async () => {
      mockRepository.findOne.mockResolvedValue(mockAparat);
      mockRepository.save.mockRejectedValue(new Error('Network error'));

      await expect(
        service.patchStatus(mockAparat.id_aparat as string, StatusAparat.NONAKTIF),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Event Publishing', () => {
    it('should publish create event with all required fields', async () => {
      const dto = {
        nip: mockAparat.nip,
        nik: mockAparat.nik,
        nama: mockAparat.nama,
        jabatan: mockAparat.jabatan,
        pangkat_golongan: mockAparat.pangkat_golongan,
      };

      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      qb.getRawOne.mockResolvedValue({ max: 0 });
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      mockRepository.create.mockReturnValue(mockAparat);
      mockRepository.save.mockResolvedValue(mockAparat);

      await service.create(dto as any);

      expect(mockEventsService.publishEvent).toHaveBeenCalledWith({
        topic: EventTopic.APARAT_CREATED,
        payload: {
          id: mockAparat.id_aparat,
          nip: mockAparat.nip,
          nik: mockAparat.nik,
          nama: mockAparat.nama,
          jabatan: mockAparat.jabatan,
          pangkat_golongan: mockAparat.pangkat_golongan,
          nomor_urut: mockAparat.nomor_urut,
          createdAt: mockAparat.created_at,
        },
        source_module: SourceModule.APARAT,
        idempotency_key: `aparat-create-${mockAparat.id_aparat}`,
      });
    });

    it('should publish update event with old and new values', async () => {
      const dto = { nama: 'Updated Name', jabatan: 'New Jabatan' };
      const updated = { ...mockAparat, ...dto, version: 2 };

      mockRepository.findOne.mockResolvedValue(mockAparat);

      const qb = createMockQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      mockRepository.save.mockResolvedValue(updated);

      await service.update(mockAparat.id_aparat as string, dto as any);

      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.APARAT_UPDATED,
          payload: expect.objectContaining({
            changes: dto,
            oldValues: expect.objectContaining({
              nama: mockAparat.nama,
              jabatan: mockAparat.jabatan,
            }),
          }),
        }),
      );
    });
  });
});