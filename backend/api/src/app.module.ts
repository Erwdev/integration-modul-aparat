import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ApiKeyModule } from './auth/api-key/api-key.module';
import { AuthModule } from './auth/auth.module'; 
import { SuratModule } from './surat/surat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core/constants';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'db'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        synchronize: false,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    ApiKeyModule, 
    AuthModule, EventsModule, 
    SuratModule

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Apply globally
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Apply globally after JwtAuthGuard
    },
  ],
})
export class AppModule {}
