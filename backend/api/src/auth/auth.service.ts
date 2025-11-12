
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { LoginDto, RegisterDto, LogoutDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from '../auth/dto/login.dto';
import {
  AuthResponseDto,
  ProfileResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

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
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    return this.jwtService.sign(
      {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      },
    );
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const newUser = await this.usersService.createUser({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      nama_lengkap: registerDto.nama_lengkap,
    });

    const payload: JwtPayload = {
      sub: newUser.id,
      username: newUser.username,
      role: newUser.role,
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
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        nama_lengkap: newUser.nama_lengkap,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    console.log('🔍 LOGIN DEBUG:');
    console.log('Username:', loginDto.username);
    console.log('Plain Password:', loginDto.password);
    console.log('Hashed Password:', user.password);
    console.log('Password exists:', !!user.password);
    console.log('Password length:', user.password?.length);

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );
    console.log('Password Valid:', isPasswordValid);
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
        email: user.email || '',
        username: user.username,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    try {
      console.log('🔄 REFRESH DEBUG:');
      console.log(
        'Token received:',
        refreshTokenDto.refreshToken?.substring(0, 30) + '...',
      );

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

      if (decoded.role !== user.role) {
        throw new UnauthorizedException('Role berubah silahkan login kembali');
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
      };
    } catch (error) {
      console.error('❌ REFRESH ERROR:', error);
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token sudah kadaluarsa');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }

  async getProfile(user_id: number): Promise<ProfileResponseDto> {
    const user = await this.usersService.findById(user_id);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      nama_lengkap: user.nama_lengkap,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.usersService.logout(userId);
    return { message: 'Logout successful' };
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validate new password matches confirmation
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'Password baru tidak cocok dengan konfirmasi',
      );
    }

    // Check if new password is same as old
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'Password baru harus berbeda dengan password lama',
      );
    }

    // Get user with password for validation
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // Get user with password included (using findByUsername)
    const userWithPassword = await this.usersService.findByUsername(
      user.username,
    );
    if (!userWithPassword) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // Validate old password
    const isOldPasswordValid = await this.usersService.validatePassword(
      oldPassword,
      userWithPassword.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Password lama tidak sesuai');
    }

    // Update password
    await this.usersService.updatePassword(userId, newPassword);

    return { message: 'Password berhasil diubah' };
  }
}
