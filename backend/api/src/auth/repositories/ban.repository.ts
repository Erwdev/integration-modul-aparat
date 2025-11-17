import { EntityRepository, Repository } from 'typeorm';
import { UserBan } from '../entities/ban.entity';

@EntityRepository(UserBan)
export class BanRepository extends Repository<UserBan> {
  async findOrCreate(userId: number): Promise<UserBan> {
    let ban = await this.findOne({where:{ userId} });
    if (!ban) {
      ban = this.create({ userId });
      await this.save(ban);
    }
    return ban;
  }
}