import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load .env dari root backend/api/
config({ path: join(__dirname, '..', '..', '.env') });

// Debug: Print environment variables
console.log('🔧 TypeORM Config Debug:');
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`POSTGRES_DB: ${process.env.POSTGRES_DB}`);

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'aparat_dev',
  
  // Entities
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  
  // Migrations
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'typeorm_migrations',
  
  synchronize: false,
  logging: ['error', 'schema', 'warn'],
};

const dataSource = new DataSource(typeormConfig);

export default dataSource;