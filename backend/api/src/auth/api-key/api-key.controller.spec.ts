import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyController', () => {
  let controller: ApiKeyController;
  let service: ApiKeyService;

  // ✅ Mock ApiKeyService - ONLY methods that exist
  const mockApiKeyService = {
    generateApiKey: jest.fn(),
    validateApiKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeyController],
      providers: [
        {
          provide: ApiKeyService,
          useValue: mockApiKeyService,
        },
      ],
    }).compile();

    controller = module.get<ApiKeyController>(ApiKeyController);
    service = module.get<ApiKeyService>(ApiKeyService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create API key successfully with ip_allowlist', async () => {
      // ✅ Use correct DTO structure (owner + ip_allowlist)
      const createDto = {
        owner: 'test-user',
        ip_allowlist: ['192.168.1.1', '10.0.0.1'],
      };

      // ✅ Service returns { id, api_key }
      const mockResponse = {
        id: 1,
        api_key: '64charHexString123456789abcdef0123456789abcdef0123456789abcdef012345',
      };

      mockApiKeyService.generateApiKey.mockResolvedValue(mockResponse);

      const result = await controller.create(createDto);

      expect(service.generateApiKey).toHaveBeenCalledWith(
        'test-user',
        ['192.168.1.1', '10.0.0.1'],
      );
      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('api_key');
    });

    it('should create API key without ip_allowlist', async () => {
      const createDto = {
        owner: 'test-user',
      };

      const mockResponse = {
        id: 2,
        api_key: 'anotherHexString456789abcdef0123456789abcdef0123456789abcdef0123456789',
      };

      mockApiKeyService.generateApiKey.mockResolvedValue(mockResponse);

      const result = await controller.create(createDto);

      // ✅ ip_allowlist will be undefined, service defaults to []
      expect(service.generateApiKey).toHaveBeenCalledWith('test-user', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if owner is empty string', async () => {
      const createDto = {
        owner: '',
      };

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(controller.create(createDto)).rejects.toThrow('Owner field is required');
      
      // ✅ Service should NOT be called
      expect(service.generateApiKey).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if owner is only whitespace', async () => {
      const createDto = {
        owner: '   ',
      };

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
      expect(service.generateApiKey).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if owner is missing', async () => {
      const createDto = {} as any;

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
      expect(service.generateApiKey).not.toHaveBeenCalled();
    });

    it('should pass empty array if ip_allowlist is empty', async () => {
      const createDto = {
        owner: 'test-user',
        ip_allowlist: [],
      };

      const mockResponse = {
        id: 3,
        api_key: 'hexKey789',
      };

      mockApiKeyService.generateApiKey.mockResolvedValue(mockResponse);

      await controller.create(createDto);

      expect(service.generateApiKey).toHaveBeenCalledWith('test-user', []);
    });
  });
});