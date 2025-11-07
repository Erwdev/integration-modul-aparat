import { Module } from '@nestjs/common';
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
import { APP_GUARD } from '@nestjs/core/constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'aparat', 'uploads'),
      serveRoot: '/uploads/signatures',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get<string>('DB_HOST', 'db'),
        port: cs.get<number>('DB_PORT', 5432),
        username: cs.get<string>('POSTGRES_USER'),
        password: cs.get<string>('POSTGRES_PASSWORD'),
        database: cs.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    AparatModule,
    ApiKeyModule, 
    AuthModule, 
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
