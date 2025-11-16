import { Injectable, Logger } from '@nestjs/common';
import { AparatSeeder } from './aparat.seeder';
// Import seeder lain di sini kalau ada
// import { UsersSeeder } from './users.seeder';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    private readonly aparatSeeder: AparatSeeder,
    // private readonly usersSeeder: UsersSeeder,
  ) {}

  async seedAll(): Promise<void> {
    this.logger.log('🌱 Starting database seeding...');

    try {
      // Seed dalam urutan yang benar (respek foreign keys)
      // await this.usersSeeder.seed();
      await this.aparatSeeder.seed();
      
      this.logger.log('✅ All seeders completed successfully');
    } catch (error) {
      this.logger.error('❌ Seeding failed', error.stack);
      throw error;
    }
  }

  async rollbackAll(): Promise<void> {
    this.logger.log('🔄 Rolling back all seeders...');

    try {
      // Rollback dalam urutan terbalik
      await this.aparatSeeder.rollback();
      // await this.usersSeeder.rollback();
      
      this.logger.log('✅ All rollbacks completed');
    } catch (error) {
      this.logger.error('❌ Rollback failed', error.stack);
      throw error;
    }
  }
}