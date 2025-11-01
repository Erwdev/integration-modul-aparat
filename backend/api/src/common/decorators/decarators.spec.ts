import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// 🔽 UBAH IMPORT INI: Impor fungsi logika, bukan decorator-nya
import { getCurrentUserFromContext } from './current-user.decorator';
import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Decorators', () => {
  describe('CurrentUser Decorator', () => {
    it('should extract user from request', () => {
      const mockUser = {
        id: 'test-id',
        username: 'testuser',
        role: 'OPERATOR',
      };
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as ExecutionContext;

      // 🔽 UBAH INI: Panggil fungsi logika secara langsung
      const result = getCurrentUserFromContext(undefined, mockExecutionContext);

      expect(result).toEqual(mockUser);
    });

    it('should extract specific user property', () => {
      const mockUser = {
        id: 'test-id',
        username: 'testuser',
        role: 'OPERATOR',
      };
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as ExecutionContext;

      // 🔽 UBAH INI: Panggil fungsi logika secara langsung
      const result = getCurrentUserFromContext(
        'username',
        mockExecutionContext,
      );

      expect(result).toBe('testuser');
    });

    it('should return undefined if user not in request', () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      // 🔽 UBAH INI: Panggil fungsi logika secara langsung
      const result = getCurrentUserFromContext(undefined, mockExecutionContext);

      expect(result).toBeUndefined();
    });
  });

  // Tes untuk 'Public Decorator' sudah benar, biarkan saja.
  describe('Public Decorator', () => {
    // ... (tidak ada perubahan di sini)
  });
});
