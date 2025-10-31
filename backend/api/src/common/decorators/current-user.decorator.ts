import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: unknown }>();
    const user = request.user;

    return data ? (user as Record<string, unknown>)?.[data] : user;
  },
);
// entar tinggal panggil decorator ini buat ambil req.user di controller
