import { User } from '../../src/users/entities/user.entity';

export class MockDataHelper {
  static createMockUser(overrides?: Partial<User>): User {
    const user = new User();
    user.id = 'test-uuid-123';
    user.username = 'testuser';
    user.password = '$2b$10$hashedpassword';
    user.role = 'OPERATOR';
    user.nama_lengkap = 'Test User';
    user.created_at = new Date('2025-01-01T00:00:00Z');
    user.updated_at = new Date('2025-01-01T00:00:00Z');
    user.hashPassword = jest.fn();
    user.validatePassword = jest.fn();

    return Object.assign(user, overrides);
  }

  static createMockAdmin(overrides?: Partial<User>): User {
    return this.createMockUser({
      username: 'admin',
      role: 'ADMIN',
      nama_lengkap: 'Administrator',
      ...overrides,
    });
  }

  static createMockUsers(count: number): User[] {
    return Array.from({ length: count }, (_, i) =>
      this.createMockUser({
        id: `test-uuid-${i}`,
        username: `user${i}`,
        nama_lengkap: `Test User ${i}`,
      }),
    );
  }

  static createMockRepository() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getManyAndCount: jest.fn(),
      })),
    };
  }

  static createMockConfigService(config: Record<string, any> = {}) {
    return {
      get: jest.fn((key: string, defaultValue?: any) => {
        return config[key] ?? defaultValue;
      }),
    };
  }

  static createMockJwtPayload(overrides?: any) {
    return {
      sub: 'test-uuid-123',
      username: 'testuser',
      role: 'OPERATOR',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 1800,
      ...overrides,
    };
  }

  static createMockRequest(overrides?: any) {
    return {
      user: this.createMockJwtPayload(),
      headers: {},
      body: {},
      query: {},
      params: {},
      ...overrides,
    };
  }

  static createMockResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
  }
}

export const TEST_DATA = {
  VALID_USERNAME: 'testuser',
  VALID_PASSWORD: 'password123',
  VALID_NIK: '3301010101010001',
  INVALID_NIK: '123',
  VALID_EMAIL: 'test@example.com',
  INVALID_EMAIL: 'invalid-email',
  BCRYPT_HASH: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
};

export class TestAssertions {
  static expectValidationError(errors: any[], field: string) {
    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((e) => e.property === field);
    expect(fieldError).toBeDefined();
    return fieldError;
  }

  static expectNoValidationErrors(errors: any[]) {
    expect(errors.length).toBe(0);
  }

  static expectToHaveBeenCalledOnceWith(
    mockFn: jest.Mock,
    ...expectedArgs: any[]
  ) {
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  }
}