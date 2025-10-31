import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const payload = { sub: 1, username: loginDto.username, role: 'user' };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      access_token,
      refresh_token,
      token_type: 'bearer',
      expires_in: 900,
      user: {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        nama_lengkap: 'Dummy User',
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const payload = {
        sub: decoded.sub,
        username: decoded.username,
        role: decoded.role,
      };

      const access_token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      });

      const refresh_token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      return {
        access_token,
        refresh_token,
        token_type: 'bearer',
        expires_in: 900,
        user: {
          id: payload.sub,
          username: payload.username,
          role: payload.role,
          nama_lengkap: 'Dummy User',
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
