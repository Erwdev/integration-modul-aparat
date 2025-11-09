import { Test, TestingModule } from '@nestjs/testing';
import { EkspedisiService } from '../ekspedisi.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ekspedisi } from '../entities/ekspedisi.entity';
import { Repository } from 'typeorm';
import { CreateEkspedisiDto } from '../dto/create-ekspedisi.dto';
import { UpdateEkspedisiDto } from '../dto/update-ekspedisi.dto';

describe('EkspedisiService', () => {
  let service: EkspedisiService;
  let repo: Repository<Ekspedisi>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EkspedisiService,
        {
          provide: getRepositoryToken(Ekspedisi),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EkspedisiService>(EkspedisiService);
    repo = module.get<Repository<Ekspedisi>>(getRepositoryToken(Ekspedisi));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new ekspedisi', async () => {
      const dto: CreateEkspedisiDto = {
        suratId: 1,
        kurir: 'JNE',
        tanggalKirim: '2025-11-07T10:00:00Z',
      };
      const result = { id: 1, ...dto };
      jest.spyOn(repo, 'save').mockResolvedValue(result as any);

      expect(await service.create(dto)).toBe(result);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all ekspedisi', async () => {
      const ekspedisiList = [
        { id: 1, kurir: 'JNE', status: 'DALAM_PERJALANAN' },
        { id: 2, kurir: 'POS', status: 'DITERIMA' },
      ];
      jest.spyOn(repo, 'find').mockResolvedValue(ekspedisiList as any);

      expect(await service.findAll({})).toBe(ekspedisiList);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one ekspedisi', async () => {
      const ekspedisi = { id: 1, kurir: 'JNE' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(ekspedisi as any);

      expect(await service.findOne(1)).toBe(ekspedisi);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update ekspedisi', async () => {
      const dto: UpdateEkspedisiDto = { status: 'DITERIMA' };
      const updated = { id: 1, kurir: 'JNE', status: 'DITERIMA' };
      jest.spyOn(repo, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(repo, 'findOne').mockResolvedValue(updated as any);

      expect(await service.update(1, dto)).toBe(updated);
    });
  });

  describe('remove', () => {
    it('should delete ekspedisi', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 1 } as any);
      expect(await service.remove(1)).toEqual({ deleted: true });
    });
  });
});
