import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SuratService } from './surat.service';
import { Surat } from './entities/surat.entity';
import { JenisSurat } from './enums/jenis-surat.enum';
import { StatusSurat } from './enums/status-surat.enum';
import { Repository } from 'typeorm';
import { NomorSuratGeneratorService } from './services/nomor-surat-generator.service';
import { EventsService } from '../events/events.service'; // ✅ Add import
import { EventTopic } from 'src/events/enums';

describe('SuratService', () => {
  let service: SuratService;
  let repository: Repository<Surat>;
  let nomorSuratGenerator: NomorSuratGeneratorService;
  let eventsService: EventsService; // ✅ Add this

  const mockSurat: Partial<Surat> = {
    id: 'test-uuid-1',
    nomor_surat: '001/2025/01/27',
    jenis: JenisSurat.MASUK,
    perihal: 'Test Surat',
    tanggal_surat: new Date('2025-01-27'),
    status: StatusSurat.DRAFT,
    version: 1,
    etag: 'test-etag',
    created_at: new Date(),
    updated_at: new Date(),
    canTransitionTo: jest.fn(),
    canBeModified: jest.fn(),
    canBeDeleted: jest.fn(),
  };

  // Create full mock query builder
  const createMockQueryBuilder = () => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getManyAndCount: jest.fn(),
  });

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
    merge: jest.fn(),
  };

  const mockNomorSuratGeneratorService = {
    generateNomorSurat: jest.fn(),
  };

  // ✅ Add EventsService mock
  const mockEventsService = {
    publishEvent: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuratService,
        {
          provide: getRepositoryToken(Surat),
          useValue: mockRepository,
        },
        {
          provide: NomorSuratGeneratorService,
          useValue: mockNomorSuratGeneratorService,
        },
        // ✅ Add EventsService provider
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<SuratService>(SuratService);
    repository = module.get<Repository<Surat>>(getRepositoryToken(Surat));
    nomorSuratGenerator = module.get<NomorSuratGeneratorService>(
      NomorSuratGeneratorService,
    );
    eventsService = module.get<EventsService>(EventsService); // ✅ Add this
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create surat with auto-generated nomor', async () => {
      const createDto = {
        jenis: JenisSurat.MASUK,
        perihal: 'Test Surat',
        tanggal_surat: '2025-01-27',
      };
      const expectedNomorSurat = '001/2025/01/27';

      mockNomorSuratGeneratorService.generateNomorSurat.mockResolvedValue(
        expectedNomorSurat,
      );

      const suratBaru = {
        ...mockSurat,
        ...createDto,
        nomor_surat: expectedNomorSurat,
        status: StatusSurat.DRAFT,
        created_by: 'user-1',
      };

      mockRepository.create.mockReturnValue(suratBaru);
      mockRepository.save.mockResolvedValue(suratBaru);

      const result = await service.create(createDto as any, 'user-1');

      expect(result).toEqual(suratBaru);
      expect(result.nomor_surat).toBe(expectedNomorSurat);
      expect(
        mockNomorSuratGeneratorService.generateNomorSurat,
      ).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          nomor_surat: expectedNomorSurat,
          status: StatusSurat.DRAFT,
          created_by: 'user-1',
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(suratBaru);

      // ✅ Verify event was published
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.SURAT_CREATED,
          payload: expect.objectContaining({
            id: suratBaru.id,
            nomorSurat: suratBaru.nomor_surat,
          }),
        }),
      );
    });

    it('should throw ConflictException if save fails (e.g., unique constraint)', async () => {
      const createDto = {
        jenis: JenisSurat.MASUK,
        perihal: 'Test Surat',
        tanggal_surat: '2025-01-27',
      };

      mockNomorSuratGeneratorService.generateNomorSurat.mockResolvedValue(
        '001/2025/01/27',
      );
      mockRepository.create.mockReturnValue(mockSurat);

      mockRepository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create(createDto as any, 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return surat when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockSurat);

      const result = await service.findOne('test-uuid-1');

      expect(result).toEqual(mockSurat);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-1' },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated surat list', async () => {
      const query = {
        page: 1,
        limit: 20,
        sort_by: 'created_at',
        order: 'desc' as const,
      };

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockSurat], 1]);

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(query);

      expect(result.data).toEqual([mockSurat]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(20);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'surat.created_at',
        'DESC',
      );
    });

    it('should apply jenis filter', async () => {
      const query = {
        jenis: JenisSurat.MASUK,
        page: 1,
        limit: 20,
        sort_by: 'created_at',
        order: 'desc' as const,
      };

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockSurat], 1]);
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(query as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'surat.jenis = :jenis',
        { jenis: JenisSurat.MASUK },
      );
    });

    it('should apply search filter', async () => {
      const query = {
        search: 'test',
        page: 1,
        limit: 20,
        sort_by: 'created_at',
        order: 'desc' as const,
      };

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[mockSurat], 1]);
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(query as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('surat.perihal ILIKE :search'),
        { search: '%test%' },
      );
    });
  });

  describe('update', () => {
    it('should update surat when status is DRAFT', async () => {
      const updateDto = { perihal: 'Updated Perihal' };
      const suratToUpdate = {
        ...mockSurat,
        canBeModified: jest.fn().mockReturnValue(true),
      };

      mockRepository.findOne.mockResolvedValue(suratToUpdate);
      mockRepository.merge.mockReturnValue({ ...suratToUpdate, ...updateDto });
      mockRepository.save.mockResolvedValue({
        ...suratToUpdate,
        ...updateDto,
      });

      const result = await service.update(
        'test-uuid-1',
        updateDto,
        'user-1',
        'test-etag',
      );

      expect(result.perihal).toBe('Updated Perihal');
      expect(mockRepository.save).toHaveBeenCalled();

      // ✅ Verify event published
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.SURAT_UPDATED,
        }),
      );
    });

    it('should throw BadRequestException if not DRAFT', async () => {
      const updateDto = { perihal: 'Updated Perihal' };
      const suratToUpdate = {
        ...mockSurat,
        status: StatusSurat.TERKIRIM,
        canBeModified: jest.fn().mockReturnValue(false),
      };

      mockRepository.findOne.mockResolvedValue(suratToUpdate);

      await expect(
        service.update('test-uuid-1', updateDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if ETag mismatch', async () => {
      const updateDto = { perihal: 'Updated Perihal' };
      const suratToUpdate = {
        ...mockSurat,
        etag: 'different-etag',
        canBeModified: jest.fn().mockReturnValue(true),
      };

      mockRepository.findOne.mockResolvedValue(suratToUpdate);

      await expect(
        service.update('test-uuid-1', updateDto, 'user-1', 'wrong-etag'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      const updateStatusDto = { status: StatusSurat.TERKIRIM };
      const suratToUpdate = {
        ...mockSurat,
        status: StatusSurat.DRAFT,
        canTransitionTo: jest.fn().mockReturnValue(true),
      };

      mockRepository.findOne.mockResolvedValue(suratToUpdate);
      mockRepository.save.mockResolvedValue({
        ...suratToUpdate,
        status: StatusSurat.TERKIRIM,
      });

      const result = await service.updateStatus(
        'test-uuid-1',
        updateStatusDto,
        'user-1',
      );

      expect(result.status).toBe(StatusSurat.TERKIRIM);

      // ✅ Verify status change event
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.SURAT_STATUS_CHANGED,
          payload: expect.objectContaining({
            oldStatus: StatusSurat.DRAFT,
            newStatus: StatusSurat.TERKIRIM,
          }),
        }),
      );
    });

    it('should throw BadRequestException for invalid transition', async () => {
      const updateStatusDto = { status: StatusSurat.SELESAI };
      const suratToUpdate = {
        ...mockSurat,
        status: StatusSurat.DRAFT,
        canTransitionTo: jest.fn().mockReturnValue(false),
      };

      mockRepository.findOne.mockResolvedValue(suratToUpdate);

      await expect(
        service.updateStatus('test-uuid-1', updateStatusDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete surat when status is DRAFT', async () => {
      const suratToDelete = {
        ...mockSurat,
        canBeDeleted: jest.fn().mockReturnValue(true),
      };

      mockRepository.findOne.mockResolvedValue(suratToDelete);
      mockRepository.save.mockResolvedValue(suratToDelete);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.remove('test-uuid-1', 'user-1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('test-uuid-1');
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ updated_by: 'user-1' }),
      );

      // ✅ Verify delete event
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: EventTopic.SURAT_DELETED,
        }),
      );
    });

    it('should throw BadRequestException if not DRAFT', async () => {
      const suratToDelete = {
        ...mockSurat,
        status: StatusSurat.TERKIRIM,
        canBeDeleted: jest.fn().mockReturnValue(false),
      };

      mockRepository.findOne.mockResolvedValue(suratToDelete);

      await expect(service.remove('test-uuid-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('nomorSuratExists', () => {
    it('should return true if nomor exists', async () => {
      mockRepository.count.mockResolvedValue(1);

      const result = await service.nomorSuratExists('001/2025/01/27');

      expect(result).toBe(true);
    });

    it('should return false if nomor does not exist', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.nomorSuratExists('999/2025/01/27');

      expect(result).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics by status', async () => {
      const mockStats = [
        { status: 'DRAFT', count: 5 },
        { status: 'TERKIRIM', count: 3 },
      ];

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getRawMany.mockResolvedValue(mockStats);

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getStatistics();

      expect(result).toEqual(mockStats);
    });
  });
});