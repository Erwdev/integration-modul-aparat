import { ValidationMessage } from './validation-msg.enum';

describe('ValidationMessage Enum', () => {
  it('should have username validation messages', () => {
    expect(ValidationMessage.USERNAME_REQUIRED).toBeDefined();
    expect(ValidationMessage.USERNAME_MIN).toBeDefined();
    expect(ValidationMessage.USERNAME_MAX).toBeDefined();
  });

  it('should have password validation messages', () => {
    expect(ValidationMessage.PASSWORD_REQUIRED).toBeDefined();
    expect(ValidationMessage.PASSWORD_MIN).toBeDefined();
  });

  it('should have refresh token validation message', () => {
    expect(ValidationMessage.REFRESH_EMPTY).toBeDefined();
  });

  it('should have correct username required message', () => {
    expect(ValidationMessage.USERNAME_REQUIRED).toBe(
      'Username tidak boleh kosong',
    );
  });

  it('should have correct password required message', () => {
    expect(ValidationMessage.PASSWORD_REQUIRED).toBe(
      'Password tidak boleh kosong',
    );
  });

  it('should have correct password min length message', () => {
    expect(ValidationMessage.PASSWORD_MIN).toBe('Password minimal 6 karakter');
  });

  it('should have correct username min length message', () => {
    expect(ValidationMessage.USERNAME_MIN).toBe('Username minimal 3 karakter');
  });

  it('should have correct username max length message', () => {
    expect(ValidationMessage.USERNAME_MAX).toBe(
      'Username maksimal 50 karakter',
    );
  });

  it('should have correct refresh token message', () => {
    expect(ValidationMessage.REFRESH_EMPTY).toBe(
      'Refresh token tidak boleh kosong',
    );
  });

  it('should be an enum', () => {
    expect(typeof ValidationMessage).toBe('object');
  });

  it('should have exactly 6 properties', () => {
    const keys = Object.keys(ValidationMessage);
    expect(keys.length).toBe(6);
  });
});
