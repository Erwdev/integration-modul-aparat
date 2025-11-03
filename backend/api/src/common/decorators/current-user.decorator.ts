import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 1. Ekstrak logika Anda ke dalam fungsi yang diekspor (exported)
export const getCurrentUserFromContext = (
  data: string | undefined,
  ctx: ExecutionContext,
) => {
  const request = ctx.switchToHttp().getRequest<{ user?: unknown }>();
  const user = request.user;

  return data ? (user as Record<string, unknown>)?.[data] : user;
};

// 2. Gunakan fungsi yang sudah diekspor tersebut di decorator Anda
export const CurrentUser = createParamDecorator(getCurrentUserFromContext);
