import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new LoginDto();
    dto.username = 'admin';
    dto.password = 'admin123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty username', async () => {
    const dto = new LoginDto();
    dto.username = '';
    dto.password = 'admin123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('username');
  });

  it('should fail validation with short password', async () => {
    const dto = new LoginDto();
    dto.username = 'admin';
    dto.password = '123'; // Too short

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
