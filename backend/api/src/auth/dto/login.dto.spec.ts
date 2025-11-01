import { validate } from 'class-validator';
import { LoginDto } from './login.dto';
import { ValidationMessage } from '../../common/enums/validation-msg.enum';

describe('LoginDto', () => {
  describe('Valid Data', () => {
    it('should pass validation with valid username and password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = 'admin123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with minimum password length (6 characters)', async () => {
      const dto = new LoginDto();
      dto.username = 'user';
      dto.password = '123456';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with long username and password', async () => {
      const dto = new LoginDto();
      dto.username = 'verylongusername123';
      dto.password = 'verylongpassword123456';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with special characters in password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = 'P@ssw0rd!2024';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Username Validation', () => {
    it('should fail validation with empty username', async () => {
      const dto = new LoginDto();
      dto.username = '';
      dto.password = 'admin123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with undefined username', async () => {
      const dto = new LoginDto();
      dto.password = 'admin123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const usernameError = errors.find((e) => e.property === 'username');
      expect(usernameError).toBeDefined();
    });

    it('should fail validation with null username', async () => {
      const dto = new LoginDto();
      dto.username = null as any;
      dto.password = 'admin123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const usernameError = errors.find((e) => e.property === 'username');
      expect(usernameError).toBeDefined();
    });

    it('should fail validation with whitespace-only username', async () => {
      const dto = new LoginDto();
      dto.username = '   ';
      dto.password = 'admin123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should show correct error message for empty username', async () => {
      const dto = new LoginDto();
      dto.username = '';
      dto.password = 'admin123';

      const errors = await validate(dto);
      const usernameError = errors.find((e) => e.property === 'username');

      expect(usernameError?.constraints?.isNotEmpty).toBe(
        ValidationMessage.USERNAME_REQUIRED,
      );
    });
  });

  describe('Password Validation', () => {
    it('should fail validation with empty password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
    });

    it('should fail validation with password less than 6 characters', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = '12345';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError?.property).toBe('password');
      expect(passwordError?.constraints).toHaveProperty('minLength');
    });

    it('should fail validation with undefined password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
    });

    it('should fail validation with null password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = null as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
    });

    it('should show correct error message for empty password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = '';

      const errors = await validate(dto);
      const passwordError = errors.find((e) => e.property === 'password');

      expect(passwordError?.constraints?.isNotEmpty).toBe(
        ValidationMessage.PASSWORD_REQUIRED,
      );
    });

    it('should show correct error message for short password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = '123';

      const errors = await validate(dto);
      const passwordError = errors.find((e) => e.property === 'password');

      expect(passwordError?.constraints?.minLength).toBe(
        ValidationMessage.PASSWORD_MIN,
      );
    });
  });

  describe('Multiple Field Validation', () => {
    it('should fail with both username and password empty', async () => {
      const dto = new LoginDto();
      dto.username = '';
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(2);

      const usernameError = errors.find((e) => e.property === 'username');
      const passwordError = errors.find((e) => e.property === 'password');

      expect(usernameError).toBeDefined();
      expect(passwordError).toBeDefined();
    });

    it('should fail with both fields undefined', async () => {
      const dto = new LoginDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should fail with username empty and password too short', async () => {
      const dto = new LoginDto();
      dto.username = '';
      dto.password = '12';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Type Validation', () => {
    it('should fail with non-string username', async () => {
      const dto = new LoginDto();
      dto.username = 123 as any;
      dto.password = 'admin123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const usernameError = errors.find((e) => e.property === 'username');
      expect(usernameError?.constraints).toHaveProperty('isString');
    });

    it('should fail with non-string password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = 123456 as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError?.constraints).toHaveProperty('isString');
    });

    it('should fail with object as username', async () => {
      const dto = new LoginDto();
      dto.username = { name: 'admin' } as any;
      dto.password = 'admin123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with array as password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = ['a', 'b', 'c'] as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters in password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = 'pässwörd123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle emojis in password', async () => {
      const dto = new LoginDto();
      dto.username = 'admin';
      dto.password = 'pass🔒word';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});