import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private bucketSize: number;
  private refillRate: number;
  private refillInterval: number;
  private buckets: Map<string, Bucket> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.bucketSize = Number(this.configService.get('RATE_LIMIT_BUCKET_SIZE', 2000));
    this.refillRate = Number(this.configService.get('RATE_LIMIT_BUCKET_REFILL_RATE', 1000));
    this.refillInterval = Number(this.configService.get('RATE_LIMIT_BUCKET_REFILL_INTERVAL_MS', 2000));
  }

  use(req: any, res: any, next: () => void) {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.bucketSize, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens if needed
    const elapsed = now - bucket.lastRefill;
    if (elapsed > this.refillInterval) {
      const refillCount = Math.floor(elapsed / this.refillInterval) * this.refillRate;
      bucket.tokens = Math.min(this.bucketSize, bucket.tokens + refillCount);
      bucket.lastRefill = now;
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      next();
    } else {
      res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
  }
}