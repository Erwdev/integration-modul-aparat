import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  AuthResponseDto,
  ProfileResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm/repository/Repository';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Logger } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.authService.logout(user.sub);
    return { message: 'Logout successful' };
  }

  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @Public()
  @Post('refresh')
  async refresh(
    @Headers('authorization') authHeader?: string,
    @Body() body?: RefreshTokenDto,
  ): Promise<RefreshResponseDto> {
    // ✅ ADD DEBUG LOGGING
    this.logger.debug('🔍 REFRESH CONTROLLER DEBUG:');
    this.logger.debug(`Authorization Header: ${authHeader ? '[REDACTED]' : 'None'}`);
    this.logger.debug(`Body: ${body ? '[REDACTED]' : 'None'}`);

    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    this.logger.debug(`Token from Header: ${tokenFromHeader ? '[REDACTED]' : 'None'}`);
    this.logger.debug(`Token from Body: ${body?.refreshToken ? '[REDACTED]' : 'None'}`);

    const refreshToken = tokenFromHeader ?? body?.refreshToken;

    this.logger.debug(`Final Token Used: ${refreshToken ? '[REDACTED]' : 'None'}`);

    if (!refreshToken) {
      throw new BadRequestException('Refresh token tidak ditemukan');
    }

    return this.authService.refresh({ refreshToken });
  }

  @Get('profile')
  async getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<ProfileResponseDto> {
    this.logger.debug(`Current User: ${user ? '[REDACTED]' : 'None'}`);
    return this.authService.getProfile(user.sub);
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, changePasswordDto);
  }
}
