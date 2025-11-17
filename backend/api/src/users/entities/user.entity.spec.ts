import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
  });

  describe('Entity Structure', () => {
    it('should create user instance', () => {
      expect(user).toBeDefined();
      expect(user).toBeInstanceOf(User);
    });

    it('should have correct properties', () => {
      user.id = 123;
      user.username = 'testuser';
      user.email = 'test@example.com';
      user.password = 'hashedpassword';
      user.role = 'ADMIN';
      user.nama_lengkap = 'Test User';

      expect(user.id).toBe(123);
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedpassword');
      expect(user.role).toBe('ADMIN');
      expect(user.nama_lengkap).toBe('Test User');
    });
  });

  describe('Email Field', () => {
    it('should accept valid email', () => {
      user.email = 'test@example.com';
      expect(user.email).toBe('test@example.com');
    });

    it('should store email as provided', () => {
      user.email = 'admin@kalurahan.id';
      expect(user.email).toBe('admin@kalurahan.id');
    });
  });

  describe('Refresh Token Field', () => {
    it('should accept refresh token', () => {
      user.refresh_token = 'some-refresh-token';
      expect(user.refresh_token).toBe('some-refresh-token');
    });

    it('should allow null refresh token', () => {
      user.refresh_token = null;
      expect(user.refresh_token).toBeNull();
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

  describe('Complete User Object', () => {
    it('should create a complete user object', () => {
      user.id = 1;
      user.username = 'testuser';
      user.email = 'test@example.com';
      user.password = '$2b$10$hashedpassword';
      user.role = 'OPERATOR';
      user.nama_lengkap = 'Test User';
      user.refresh_token = 'refresh-token-xyz';
      user.created_at = new Date();
      user.updated_at = new Date();

      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('$2b$10$hashedpassword');
      expect(user.role).toBe('OPERATOR');
      expect(user.nama_lengkap).toBe('Test User');
      expect(user.refresh_token).toBe('refresh-token-xyz');
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
    });
  });
});
