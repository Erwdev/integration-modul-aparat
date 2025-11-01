import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    role: 'OPERATOR',
    nama_lengkap: 'Test User',
    created_at: new Date(),
    updated_at: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUsername', () => {
    it('should return user with password when found', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.username = :username',
        { username: 'testuser' },
      );
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password');
    });

    it('should return null when user not found', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1); // ✅ Correct: number

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }, // ✅ Fix: Changed from 'id' to match column name in entity
      });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999); // ✅ Fix: Changed from string to number

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 }, // ✅ Added assertion
      });
    });

    it('should handle numeric ID correctly', async () => {
      const userId = 42;
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('findAll', () => {
    it('should return array of users ordered by created_at DESC', async () => {
      const users = [mockUser];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and return new user', async () => {
      const userData = {
        username: 'newuser',
        password: 'password123',
        role: 'OPERATOR',
        nama_lengkap: 'New User',
      };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(userData);

      expect(result).toEqual(mockUser);
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('update', () => {
    it('should update and return user when found', async () => {
      const updateData = { nama_lengkap: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateData); // ✅ Already correct: number

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { nama_lengkap: 'Test' }), // ✅ Fix: Changed from 'nonexistent-id' to 999
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with correct message', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(123, { nama_lengkap: 'Test' }), // ✅ Fix: Changed from 'test-id' to 123
      ).rejects.toThrow('User with ID 123 not found');
    });

    it('should not allow password update through update method', async () => {
      const updateData = {
        nama_lengkap: 'Updated Name',
        password: 'newpassword123',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        nama_lengkap: 'Updated Name',
      });

      await service.update(1, updateData);

      // Get the saved object
      const savedUser = mockRepository.save.mock.calls[0][0];

      // Verify password was NOT changed to the new plaintext password
      expect(savedUser).not.toHaveProperty('password', 'newpassword123');

      // Verify other fields were updated
      expect(savedUser.nama_lengkap).toBe('Updated Name');
    });
  });
});
