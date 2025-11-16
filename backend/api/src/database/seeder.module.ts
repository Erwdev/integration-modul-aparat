import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Aparat } from '../aparat/entities/aparat.entity';
import { AparatSeeder } from './seeds/aparat.seeder';
import { DatabaseSeeder } from './seeds';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'aparat',
      entities: [Aparat],
      synchronize: false, // ✅ Jangan auto-sync di seeder
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false, // ✅ Disable warning untuk seeding
    }),
    TypeOrmModule.forFeature([Aparat]),
    EventsModule, // ✅ Kalau seeder butuh emit events
  ],
  providers: [AparatSeeder, DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class SeedersModule {}