import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'OPERATOR' },
        }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'ADMIN' },
        }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'OPERATOR' },
        }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    expect(guard.canActivate(mockContext)).toBe(false);
  });
});