import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { BanRepository } from './repositories/ban.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([BanRepository]),
    ConfigModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        if (
          !secret ||
          secret === 'change-me-in-production' ||
          secret.length < 32
        ) {
          throw new Error(
            'JWT_SECRET must be set to a strong secret (min 32 characters) in production. ' +
              'Generate one with: openssl rand -base64 32',
          );
        }

        const expiresIn = configService.get<number>('JWT_EXPIRES_IN') ?? '30m';

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
