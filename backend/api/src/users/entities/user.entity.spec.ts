import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    jest.clearAllMocks();
  });

  describe('Entity Structure', () => {
    it('should create user instance', () => {
      expect(user).toBeDefined();
      expect(user).toBeInstanceOf(User);
    });

    it('should have correct properties', () => {
      user.id = 'test-id';
      user.username = 'testuser';
      user.password = 'hashedpassword';
      user.role = 'ADMIN';
      user.nama_lengkap = 'Test User';

      expect(user.id).toBe('test-id');
      expect(user.username).toBe('testuser');
      expect(user.password).toBe('hashedpassword');
      expect(user.role).toBe('ADMIN');
      expect(user.nama_lengkap).toBe('Test User');
    });
  });

  describe('hashPassword', () => {
    it('should hash password before insert', async () => {
      const plainPassword = 'password123';
      const hashedPassword = '$2b$10$hashedpassword';

      user.password = plainPassword;

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await user.hashPassword();

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(user.password).toBe(hashedPassword);
    });

    it('should hash password before update', async () => {
      const plainPassword = 'newpassword456';
      const hashedPassword = '$2b$10$newhashedpassword';

      user.password = plainPassword;

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await user.hashPassword();

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(user.password).toBe(hashedPassword);
    });

    it('should not hash if password is undefined', async () => {
      user.password = undefined as any;

      await user.hashPassword();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not hash if password is null', async () => {
      user.password = null as any;

      await user.hashPassword();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not hash if password is empty string', async () => {
      user.password = '';

      await user.hashPassword();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should use salt rounds of 10', async () => {
      user.password = 'testpassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed');

      await user.hashPassword();

      expect(bcrypt.hash).toHaveBeenCalledWith('testpassword', 10);
    });

    it('should handle bcrypt errors gracefully', async () => {
      user.password = 'testpassword';

      const error = new Error('Bcrypt error');
      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(user.hashPassword()).rejects.toThrow('Bcrypt error');
    });
  });

  describe('validatePassword', () => {
    beforeEach(() => {
      user.password = '$2b$10$hashedpassword';
    });

    it('should return true for correct password', async () => {
      const plainPassword = 'correctpassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await user.validatePassword(plainPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        user.password,
      );
    });

    it('should return false for incorrect password', async () => {
      const plainPassword = 'wrongpassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await user.validatePassword(plainPassword);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        user.password,
      );
    });

    it('should handle empty password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await user.validatePassword('');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('', user.password);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'p@$$w0rd!#123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await user.validatePassword(specialPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        specialPassword,
        user.password,
      );
    });

    it('should handle unicode characters', async () => {
      const unicodePassword = 'pässwörd123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await user.validatePassword(unicodePassword);

      expect(result).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(100);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await user.validatePassword(longPassword);

      expect(result).toBe(true);
    });

    it('should handle bcrypt compare errors', async () => {
      const error = new Error('Bcrypt compare error');
      (bcrypt.compare as jest.Mock).mockRejectedValue(error);

      await expect(user.validatePassword('test')).rejects.toThrow(
        'Bcrypt compare error',
      );
    });
  });

  describe('Timestamp Fields', () => {
    it('should have created_at field', () => {
      const now = new Date();
      user.created_at = now;

      expect(user.created_at).toEqual(now);
    });

    it('should have updated_at field', () => {
      const now = new Date();
      user.updated_at = now;

      expect(user.updated_at).toEqual(now);
    });
  });

  describe('Role Field', () => {
    it('should accept ADMIN role', () => {
      user.role = 'ADMIN';
      expect(user.role).toBe('ADMIN');
    });

    it('should accept OPERATOR role', () => {
      user.role = 'OPERATOR';
      expect(user.role).toBe('OPERATOR');
    });

    it('should accept VIEWER role', () => {
      user.role = 'VIEWER';
      expect(user.role).toBe('VIEWER');
    });
  });

  describe('Integration Tests', () => {
    it('should hash and validate password correctly', async () => {
      const plainPassword = 'testpassword123';
      const hashedPassword = '$2b$10$actualhashedpassword';

      user.password = plainPassword;

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await user.hashPassword();
      expect(user.password).toBe(hashedPassword);

      const isValid = await user.validatePassword(plainPassword);
      expect(isValid).toBe(true);
    });

    it('should fail validation with wrong password after hashing', async () => {
      const plainPassword = 'correctpassword';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = '$2b$10$hashedcorrectpassword';

      user.password = plainPassword;

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await user.hashPassword();
      const isValid = await user.validatePassword(wrongPassword);

      expect(isValid).toBe(false);
    });
  });
});