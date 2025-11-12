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

import { Repository } from 'typeorm/repository/Repository';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

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

  @Public()
  @Post('refresh')
  async refresh(
    @Headers('authorization') authHeader?: string,
    @Body() body?: RefreshTokenDto,
  ): Promise<RefreshResponseDto> {
    // ✅ ADD DEBUG LOGGING
    console.log('🔍 REFRESH CONTROLLER DEBUG:');
    console.log('Authorization Header:', authHeader);
    console.log('Body:', body);

    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    console.log(
      'Token from Header:',
      tokenFromHeader?.substring(0, 20) + '...',
    );
    console.log(
      'Token from Body:',
      body?.refreshToken?.substring(0, 20) + '...',
    );

    const refreshToken = tokenFromHeader ?? body?.refreshToken;

    console.log('Final Token Used:', refreshToken?.substring(0, 20) + '...');

    if (!refreshToken) {
      throw new BadRequestException('Refresh token tidak ditemukan');
    }

    return this.authService.refresh({ refreshToken });
  }

  @Get('profile')
  async getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<ProfileResponseDto> {
    console.log('Current User:', user);
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
