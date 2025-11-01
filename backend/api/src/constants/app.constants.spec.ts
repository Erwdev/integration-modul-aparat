import { APP_CONSTANTS } from './app.constants';

describe('APP_CONSTANTS', () => {
  it('should be defined', () => {
    expect(APP_CONSTANTS).toBeDefined();
  });

  describe('Default Values', () => {
    it('should have DEFAULT_PORT', () => {
      expect(APP_CONSTANTS.DEFAULT_PORT).toBe(3000);
    });

    it('should have DEFAULT_HOST', () => {
      expect(APP_CONSTANTS.DEFAULT_HOST).toBe('localhost');
    });

    it('should have DEFAULT_DB_PORT', () => {
      expect(APP_CONSTANTS.DEFAULT_DB_PORT).toBe(5432);
    });
  });

  describe('Application Info', () => {
    it('should have APP_NAME', () => {
      expect(APP_CONSTANTS.APP_NAME).toBeDefined();
      expect(typeof APP_CONSTANTS.APP_NAME).toBe('string');
    });

    it('should have APP_VERSION', () => {
      expect(APP_CONSTANTS.APP_VERSION).toBe('1.0.0');
    });
  });

  describe('Status Constants', () => {
    it('should have STATUS object', () => {
      expect(APP_CONSTANTS.STATUS).toBeDefined();
    });

    it('should have ACTIVE status', () => {
      expect(APP_CONSTANTS.STATUS.ACTIVE).toBe('active');
    });

    it('should have INACTIVE status', () => {
      expect(APP_CONSTANTS.STATUS.INACTIVE).toBe('inactive');
    });

    it('should have MAINTENANCE status', () => {
      expect(APP_CONSTANTS.STATUS.MAINTENANCE).toBe('maintenance');
    });
  });

  describe('Roles Constants', () => {
    it('should have ROLES object', () => {
      expect(APP_CONSTANTS.ROLES).toBeDefined();
    });

    it('should have ADMIN role', () => {
      expect(APP_CONSTANTS.ROLES.ADMIN).toBe('ADMIN');
    });

    it('should have USER role', () => {
      expect(APP_CONSTANTS.ROLES.USER).toBe('USER');
    });

    it('should have MODERATOR role', () => {
      expect(APP_CONSTANTS.ROLES.MODERATOR).toBe('MODERATOR');
    });
  });

  describe('Constants Immutability', () => {
    it('should be readonly (as const)', () => {
      // TypeScript will catch this at compile time
      expect(() => {
          // @ts-expect-error - Cannot assign to 'DEFAULT_PORT'
        APP_CONSTANTS.DEFAULT_PORT = 4000;
      }).toThrow();
    });
  });

  describe('Type Checking', () => {
    it('DEFAULT_PORT should be a number', () => {
      expect(typeof APP_CONSTANTS.DEFAULT_PORT).toBe('number');
    });

    it('DEFAULT_HOST should be a string', () => {
      expect(typeof APP_CONSTANTS.DEFAULT_HOST).toBe('string');
    });

    it('STATUS should be an object', () => {
      expect(typeof APP_CONSTANTS.STATUS).toBe('object');
    });

    it('ROLES should be an object', () => {
      expect(typeof APP_CONSTANTS.ROLES).toBe('object');
    });
  });
});