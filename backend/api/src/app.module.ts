import { MiddlewareConsumer, NestModule,Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AparatModule } from './aparat/aparat.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApiKeyModule } from './auth/api-key/api-key.module';
import { AuthModule } from './auth/auth.module';
import { SuratModule } from './surat/surat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { EkspedisiModule } from './ekspedisi/ekspedisi.module';
import { EventsModule } from './events/events.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'aparat', 'uploads'),
      serveRoot: '/uploads/signatures',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
      
        type: 'postgres',
        host: cs.get<string>('DB_HOST', 'db'),
        port: cs.get<number>('DB_PORT', 5432),
        username: cs.get<string>('DB_USERNAME', 'postgres'),
        password: cs.get<string>('DB_PASSWORD', 'postgres'),
        database: cs.get<string>('DB_DATABASE', 'aparat'),
        autoLoadEntities: true,
        synchronize: false,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: process.env.NODE_ENV === 'development',
        ssl:
          cs.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false, 
      }),
    }),

    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule,
    AparatModule,
    ApiKeyModule,
    EkspedisiModule,
    AuthModule,
    EventsModule,
    SuratModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
