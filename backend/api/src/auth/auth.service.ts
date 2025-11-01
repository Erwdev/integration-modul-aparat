// ...existing code...
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private parseExpiresIn(expiresIn: string): number {
    const matches = expiresIn.match(/^(\d+)([smhd])$/);
    if (!matches) return 900; // default 15 minutes

    const [, value, unit] = matches;
    const num = parseInt(value, 10);

    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return num * (multipliers[unit as keyof typeof multipliers] || 60);
  }

  private generateAccessToken(payload: JwtPayload): string {
    // JwtModule configured with secret; sign using JwtService
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: JwtPayload): string {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn =
      this.configService.get<number>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    return this.jwtService.sign(payload as Record<string, any>, {
      secret: refreshSecret, // ✅ Gunakan JWT_REFRESH_SECRET yang sama
      expiresIn: refreshExpiresIn,
    });
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    // JwtPayload.sub is string (standard). convert to number for DB lookup.
    const userId = payload.sub;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }
    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const access_token = this.generateAccessToken(payload);
    const refresh_token = this.generateRefreshToken(payload);

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '30m');
    const expiresInSeconds = this.parseExpiresIn(expiresIn);

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: expiresInSeconds,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(
        refreshTokenDto.refreshToken,
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ??
            'refresh-secret-dev',
        },
      );

      // decoded.sub is string; convert to number for DB lookup
      const userId = decoded.sub;
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User tidak ditemukan');
      }

      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      const access_token = this.generateAccessToken(payload);
      const refresh_token = this.generateRefreshToken(payload);

      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '30m');
      const expiresInSeconds = this.parseExpiresIn(expiresIn);

      return {
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: expiresInSeconds,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          nama_lengkap: user.nama_lengkap,
        },
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token sudah kadaluarsa');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
