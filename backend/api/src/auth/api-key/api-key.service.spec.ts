import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from './api-key.entity';
import * as bcrypt from 'bcrypt';

// ✅ Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repository: Repository<ApiKey>;

  const mockApiKeyRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeyRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('generateApiKey', () => {
    it('should generate API key successfully with ip_allowlist', async () => {
      const owner = 'test-user';
      const ipAllowlist = ['192.168.1.1', '10.0.0.1'];

      // ✅ Mock bcrypt.hash
      mockedBcrypt.hash.mockResolvedValue('$2b$10$hashedKey123' as never);

      const mockCreatedKey = {
        id: 1,
        key_hash: '$2b$10$hashedKey123',
        owner,
        ip_allowlist: ipAllowlist,
      };

      mockApiKeyRepository.create.mockReturnValue(mockCreatedKey);
      mockApiKeyRepository.save.mockResolvedValue(mockCreatedKey);

      const result = await service.generateApiKey(owner, ipAllowlist);

      // ✅ Verify repository.create was called with correct structure
      expect(repository.create).toHaveBeenCalledWith({
        key_hash: expect.any(String), // ✅ Hashed key
        owner,
        ip_allowlist: ipAllowlist,
      });

      expect(repository.save).toHaveBeenCalledWith(mockCreatedKey);

      // ✅ Service returns { id, api_key }
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('api_key');
      expect(result.id).toBe(1);
      expect(result.api_key).toBeTruthy();
      expect(typeof result.api_key).toBe('string');
      expect(result.api_key.length).toBe(64); // ✅ 32 bytes = 64 hex chars
    });

    it('should generate API key without ip_allowlist (defaults to empty array)', async () => {
      const owner = 'test-user';

      mockedBcrypt.hash.mockResolvedValue('$2b$10$hashedKey456' as never);

      const mockCreatedKey = {
        id: 2,
        key_hash: '$2b$10$hashedKey456',
        owner,
        ip_allowlist: [], // ✅ Defaults to empty array
      };

      mockApiKeyRepository.create.mockReturnValue(mockCreatedKey);
      mockApiKeyRepository.save.mockResolvedValue(mockCreatedKey);

      const result = await service.generateApiKey(owner);

      expect(repository.create).toHaveBeenCalledWith({
        key_hash: expect.any(String),
        owner,
        ip_allowlist: [], // ✅ Default value
      });

      expect(result).toHaveProperty('id', 2);
      expect(result).toHaveProperty('api_key');
    });

    it('should generate unique API keys on multiple calls', async () => {
      const owner = 'test-user';

      // ✅ Mock different hashes
      mockedBcrypt.hash
        .mockResolvedValueOnce('$2b$10$hash1' as never)
        .mockResolvedValueOnce('$2b$10$hash2' as never);

      mockApiKeyRepository.create
        .mockReturnValueOnce({ id: 1, key_hash: '$2b$10$hash1', owner, ip_allowlist: [] })
        .mockReturnValueOnce({ id: 2, key_hash: '$2b$10$hash2', owner, ip_allowlist: [] });

      mockApiKeyRepository.save
        .mockResolvedValueOnce({ id: 1, key_hash: '$2b$10$hash1', owner, ip_allowlist: [] })
        .mockResolvedValueOnce({ id: 2, key_hash: '$2b$10$hash2', owner, ip_allowlist: [] });

      const result1 = await service.generateApiKey(owner);
      const result2 = await service.generateApiKey(owner);

      // ✅ API keys should be different
      expect(result1.api_key).not.toEqual(result2.api_key);
      expect(result1.id).not.toEqual(result2.id);
    });

    it('should hash the API key before saving', async () => {
      const owner = 'test-user';

      mockedBcrypt.hash.mockResolvedValue('$2b$10$hashedValue' as never);

      mockApiKeyRepository.create.mockReturnValue({
        id: 1,
        key_hash: '$2b$10$hashedValue',
        owner,
        ip_allowlist: [],
      });

      mockApiKeyRepository.save.mockResolvedValue({
        id: 1,
        key_hash: '$2b$10$hashedValue',
        owner,
        ip_allowlist: [],
      });

      await service.generateApiKey(owner);

      // ✅ bcrypt.hash should be called with raw API key and salt rounds
      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
    });
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key with matching IP', async () => {
      const apiKey = '64charHexString123456789abcdef0123456789abcdef0123456789abcdef012345';
      const ip = '192.168.1.1';

      const mockKeys = [
        {
          id: 1,
          key_hash: '$2b$10$validHash',
          owner: 'test-user',
          ip_allowlist: ['192.168.1.1', '10.0.0.1'],
        },
      ];

      mockApiKeyRepository.find.mockResolvedValue(mockKeys);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateApiKey(apiKey, ip);

      expect(repository.find).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(apiKey, '$2b$10$validHash');
      expect(result).toBe(true);
    });

    it('should return true for valid API key with no IP restriction', async () => {
      const apiKey = 'someValidKey123';
      const ip = '192.168.1.100';

      const mockKeys = [
        {
          id: 2,
          key_hash: '$2b$10$anotherHash',
          owner: 'test-user',
          ip_allowlist: null, // ✅ No IP restriction
        },
      ];

      mockApiKeyRepository.find.mockResolvedValue(mockKeys);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateApiKey(apiKey, ip);

      expect(result).toBe(true);
    });

    it('should return false for valid key but IP not in allowlist', async () => {
      const apiKey = 'validKey456';
      const ip = '192.168.1.100'; // ✅ Not in allowlist

      const mockKeys = [
        {
          id: 3,
          key_hash: '$2b$10$restrictedHash',
          owner: 'test-user',
          ip_allowlist: ['192.168.1.1', '10.0.0.1'],
        },
      ];

      mockApiKeyRepository.find.mockResolvedValue(mockKeys);
      mockedBcrypt.compare.mockResolvedValue(true as never); // ✅ Key matches but IP doesn't

      const result = await service.validateApiKey(apiKey, ip);

      expect(result).toBe(false);
    });

    it('should return false for invalid API key', async () => {
      const apiKey = 'invalidKey789';
      const ip = '192.168.1.1';

      const mockKeys = [
        {
          id: 4,
          key_hash: '$2b$10$someHash',
          owner: 'test-user',
          ip_allowlist: ['192.168.1.1'],
        },
      ];

      mockApiKeyRepository.find.mockResolvedValue(mockKeys);
      mockedBcrypt.compare.mockResolvedValue(false as never); // ✅ Key doesn't match

      const result = await service.validateApiKey(apiKey, ip);

      expect(result).toBe(false);
    });

    it('should return false if no keys exist', async () => {
      const apiKey = 'anyKey';
      const ip = '192.168.1.1';

      mockApiKeyRepository.find.mockResolvedValue([]); // ✅ No keys in DB

      const result = await service.validateApiKey(apiKey, ip);

      expect(result).toBe(false);
    });

    it('should check all keys if first key does not match', async () => {
      const apiKey = 'matchingKey';
      const ip = '192.168.1.1';

      const mockKeys = [
        {
          id: 1,
          key_hash: '$2b$10$wrongHash',
          owner: 'user1',
          ip_allowlist: ['192.168.1.1'],
        },
        {
          id: 2,
          key_hash: '$2b$10$correctHash',
          owner: 'user2',
          ip_allowlist: ['192.168.1.1'],
        },
      ];

      mockApiKeyRepository.find.mockResolvedValue(mockKeys);
      mockedBcrypt.compare
        .mockResolvedValueOnce(false as never) // ✅ First key fails
        .mockResolvedValueOnce(true as never);  // ✅ Second key matches

      const result = await service.validateApiKey(apiKey, ip);

      expect(bcrypt.compare).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });
  });
});