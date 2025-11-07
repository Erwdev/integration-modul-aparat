import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AparatService } from '../aparat.service';
import { Aparat } from '../entities/aparat.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AparatService', () => {
  let service: AparatService;
  let repo: Repository<Aparat>;
  let eventEmitter: EventEmitter2;

  // 🧱 Mock query builder yang mendukung chaining
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
    getRawOne: jest.fn().mockResolvedValue({ max: 0 }),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
  };

  // 🧱 Mock repository lengkap
  const mockAparatRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    create: jest.fn((dto) => dto),
    save: jest.fn(async (entity) => ({
      id_aparat: '1',
      updated_at: new Date(),
      ...entity,
    })),
    findOne: jest.fn(),
    remove: jest.fn(async (entity) => entity),
  };

  // 🧱 Mock EventEmitter2
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AparatService,
        {
          provide: getRepositoryToken(Aparat),
          useValue: mockAparatRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AparatService>(AparatService);
    repo = module.get<Repository<Aparat>>(getRepositoryToken(Aparat));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
    mockQueryBuilder.getOne.mockResolvedValue(null);
    mockQueryBuilder.getRawOne.mockResolvedValue({ max: 0 });
  });

  // ===============================================================
  // ✅ Basic existence test
  // ===============================================================
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===============================================================
  // ✅ findOne
  // ===============================================================
  describe('findOne', () => {
    it('should return aparat', async () => {
      const mockData = { id_aparat: '1', nama: 'John Doe' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockData as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockData);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id_aparat: '1' },
      });
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  // ===============================================================
  // ✅ create
  // ===============================================================
  describe('create', () => {
    it('should create aparat successfully', async () => {
      const dto = { nama: 'Jane Doe', nik: '123', nip: '456' };
      mockQueryBuilder.getOne.mockResolvedValue(null); // tidak duplikat
      mockQueryBuilder.getRawOne.mockResolvedValue({ max: 10 }); // current max nomor_urut

      const result = await service.create(dto as any);
      expect(result.nomor_urut).toBe(11);
      expect(repo.create).toHaveBeenCalledWith({ ...dto, nomor_urut: 11 });
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when NIK exists', async () => {
      const dto = { nama: 'Jane Doe', nik: '123' };
      mockQueryBuilder.getOne.mockResolvedValueOnce({ id_aparat: 'existing' }); // NIK duplikat

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  // ===============================================================
  // ✅ update
  // ===============================================================
  describe('update', () => {
    it('should update aparat successfully', async () => {
      const dto = { nama: 'Updated Aparat' };
      const mockExisting = {
        id_aparat: '1',
        nama: 'Old Aparat',
        version: 1,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockExisting as any);
      jest.spyOn(repo, 'save').mockResolvedValue({
        ...mockExisting,
        ...dto,
        version: 2,
        updated_at: new Date(),
      } as any);

      const result = await service.update('1', dto as any);
      expect(result.version).toBe(2);
      expect(eventEmitter.emit).toHaveBeenCalledWith('aparat.updated', expect.any(Object));
    });
  });

  // ===============================================================
  // ✅ patchStatus
  // ===============================================================
  describe('patchStatus', () => {
    it('should patch status successfully', async () => {
      const mockExisting = {
        id_aparat: '1',
        status: 'inactive',
        version: 1,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockExisting as any);
      jest.spyOn(repo, 'save').mockResolvedValue({
        ...mockExisting,
        status: 'active',
        version: 2,
      } as any);

      const result = await service.patchStatus('1', 'active');
      expect(result.status).toBe('active');
      expect(eventEmitter.emit).toHaveBeenCalledWith('aparat.updated', expect.any(Object));
    });
  });

  // ===============================================================
  // ✅ remove
  // ===============================================================
  describe('remove', () => {
    it('should remove aparat successfully', async () => {
      const mockExisting = { id_aparat: '1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockExisting as any);
      jest.spyOn(repo, 'remove').mockResolvedValue(mockExisting as any);

      await service.remove('1');
      expect(repo.remove).toHaveBeenCalledWith(mockExisting);
      expect(eventEmitter.emit).toHaveBeenCalledWith('aparat.deleted', { id: '1' });
    });
  });

  // ===============================================================
  // ✅ findAll
  // ===============================================================
  describe('findAll', () => {
    it('should return paginated result', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[{ id_aparat: '1' }], 1]);

      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result.total).toBe(1);
      expect(result.data[0].id_aparat).toBe('1');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });
});
