import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuditLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Audit');

  use(req: any, res: any, next: () => void) {
    const user = req.user?.id || 'anonymous';
    const ip = req.ip;
    const action = `${req.method} ${req.originalUrl}`;
    this.logger.log(`User=${user} IP=${ip} Action=${action}`);
    next();
  }
}
