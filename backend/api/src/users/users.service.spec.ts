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
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    role: 'OPERATOR',
    nama_lengkap: 'Test User',
    created_at: new Date(),
    updated_at: new Date(),
    refresh_token: null,
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
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

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
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

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return new user with hashed password', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'OPERATOR',
        nama_lengkap: 'New User',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(userData);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123',
        nama_lengkap: 'New User',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createUser(userData)).rejects.toThrow(
        'Email atau username sudah digunakan',
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'new@example.com',
        password: 'password123',
        nama_lengkap: 'New User',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createUser(userData)).rejects.toThrow(
        'Email atau username sudah digunakan',
      );
    });
  });

  describe('update', () => {
    it('should update and return user when found', async () => {
      const updateData = { nama_lengkap: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { nama_lengkap: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with correct message', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(123, { nama_lengkap: 'Test' }),
      ).rejects.toThrow('User with ID 123 not found');
    });

    it('should remove password from update data', async () => {
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

      const savedUser = mockRepository.save.mock.calls[0][0];

      // Verify password field was removed
      expect(savedUser.password).toBe('$2b$10$hashedpassword');
      expect(savedUser.nama_lengkap).toBe('Updated Name');
    });
  });

  describe('updatePassword', () => {
    it('should update password with hashed value', async () => {
      const newPassword = 'newpassword123';
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.updatePassword(1, newPassword);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user when found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      // validatePassword(plainPassword, hashedPassword)
      const hashedPassword = await require('bcrypt').hash('password123', 10);
      const result = await service.validatePassword(
        'password123',
        hashedPassword,
      );

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hashedPassword = await require('bcrypt').hash('password123', 10);
      const result = await service.validatePassword(
        'wrongpassword',
        hashedPassword,
      );

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.logout(1);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        refresh_token: null,
      });
    });

    it('should return false if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.logout(999);

      expect(result).toBe(false);
    });
  });
});
