import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST', 'db'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_DATABASE', 'aparat'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // ⚠️ Set false di production
  migrationsRun: true, // ✅ Auto-run migrations saat startup
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(typeOrmConfig);