import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// 🧠 Fallback untuk TooManyRequestsException (karena belum ada di Nest versi <11)
export class TooManyRequestsException extends HttpException {
  constructor(message?: string) {
    super(message || 'Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
  }
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; lastReset: number }>();

  use(req: Request, res: Response, next: NextFunction) {
    const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 menit
    const limit = 1000; // 1000 request per menit per IP

    // Ambil data sebelumnya, atau buat baru kalau belum ada
    let data = this.requests.get(key);
    if (!data) {
      data = { count: 1, lastReset: now };
      this.requests.set(key, data);
    } else {
      // Reset window jika sudah lewat
      if (now - data.lastReset > windowMs) {
        data.count = 1;
        data.lastReset = now;
      } else {
        data.count++;
      }
    }

    // Jika melebihi limit → lempar error 429
    if (data.count > limit) {
      throw new TooManyRequestsException(
        `Rate limit exceeded (${limit} requests/minute)`,
      );
    }

    next();
  }
}
