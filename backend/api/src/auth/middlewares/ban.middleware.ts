import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { BanRepository } from '../repositories/ban.repository';

@Injectable()
export class BanMiddleware implements NestMiddleware {
  constructor(private readonly banRepository: BanRepository) {}

  async use(req: any, res: any, next: () => void) {
    const user = req.user; // Pastikan JwtAuthGuard sudah diterapkan
    if (!user) {
      return next();
    }

    const ban = await this.banRepository.findOne({where:{ userId: user.sub }});
    if (ban?.isBanned) {
      const now = new Date();
      if (ban.banExpiresAt && now > ban.banExpiresAt) {
        // Unban user if ban has expired
        ban.isBanned = false;
        ban.violationCount = 0;
        ban.banExpiresAt = null;
        await this.banRepository.save(ban);
      } else {
        throw new UnauthorizedException('Akun Anda diblokir sementara.');
      }
    }

    next();
  }
}