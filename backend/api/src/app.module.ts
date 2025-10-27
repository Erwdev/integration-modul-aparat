import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env','.env.local']
    }),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'db'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        entities: [],
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
  ], 
  controllers: [AppController],
  providers: [AppService]
})export class AppModule {}
