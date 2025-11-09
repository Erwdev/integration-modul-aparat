import { Test, TestingModule } from '@nestjs/testing';
import { AparatController } from '../aparat.controller';
import { AparatService } from '../aparat.service';
import { CreateAparatDto } from '../dto/create-aparat.dto';
import { StatusAparat } from '../enums/status-aparat.enum';
import { Response, Request } from 'express';
import { Aparat } from '../entities/aparat.entity';

describe('AparatController', () => {
  let controller: AparatController;
  let service: AparatService;

  // Mock data
  const mockAparat: Aparat = {
    id_aparat: 'uuid-123',
    nama: 'Tes Aparat',
    nik: '3301010101010001',
    nip: '199001012020011001',
    jenis_kelamin: 'L', // <- pastikan literal
    tempat_lahir: 'Yogyakarta',
    tanggal_lahir: new Date('1990-01-01'),
    jabatan: 'Lurah',
    status: StatusAparat.AKTIF,
    nomor_urut: 1,
    version: 1,
    created_at: new Date(),
    updated_at: new Date(),
  } as Aparat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AparatController],
      providers: [
        {
          provide: AparatService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAparat),
            findAll: jest.fn().mockResolvedValue({
              data: [mockAparat],
              total: 1,
              page: 1,
              limit: 10,
            }),
            findOne: jest.fn().mockResolvedValue(mockAparat),
            update: jest.fn().mockResolvedValue({
              ...mockAparat,
              nama: 'Updated Aparat',
              status: StatusAparat.NONAKTIF,
            }),
            patchStatus: jest.fn().mockResolvedValue({
              ...mockAparat,
              status: StatusAparat.NONAKTIF,
            }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<AparatController>(AparatController);
    service = module.get<AparatService>(AparatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create aparat', async () => {
      const dto: CreateAparatDto = {
        nama: 'Tes Aparat',
        nik: '3301010101010001',
        jabatan: 'Lurah',
        jenis_kelamin: 'L',
        tempat_lahir: 'Yogyakarta',
        tanggal_lahir: '1990-01-01',
        status: StatusAparat.AKTIF,
      };

      const result = await controller.create(dto);
      expect(result.nama).toBe('Tes Aparat');
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('uploadSignature', () => {
    it('should return signature URL', () => {
      const mockFile = { filename: 'test-signature.png', originalname: 'signature.png' };
      const result = controller.uploadSignature(mockFile as any);
      expect(result).toHaveProperty('tanda_tangan_url');
      expect(result.tanda_tangan_url).toContain('test-signature.png');
    });
  });

  describe('findAll', () => {
    it('should get list of aparat', async () => {
      const result = await controller.findAll({});
      expect(result.data.length).toBe(1);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
      mockReq = { headers: {} };
      mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      };
    });

    it('should return aparat with ETag header', async () => {
      await controller.findOne('uuid-123', mockReq as Request, mockRes as Response);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=86400',
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockAparat);
    });
  });

  describe('update', () => {
    it('should update aparat', async () => {
      const dto = { nama: 'Updated Aparat' };
      const result = await controller.update('uuid-123', dto);
      expect(result.nama).toBe('Updated Aparat');
    });
  });

  describe('patchStatus', () => {
    it('should update status', async () => {
      const result = await controller.patchStatus('uuid-123', StatusAparat.NONAKTIF);
      expect(result.status).toBe(StatusAparat.NONAKTIF);
    });
  });

  describe('remove', () => {
    it('should remove aparat', async () => {
      await controller.remove('uuid-123');
      expect(service.remove).toHaveBeenCalledWith('uuid-123');
    });
  });
});
