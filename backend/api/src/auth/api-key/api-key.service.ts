import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async generateApiKey(owner: string, ipAllowlist: string[] = []) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(apiKey, 10);

    const key = this.apiKeyRepository.create({
      key_hash: hashed,
      owner,
      ip_allowlist: ipAllowlist,
    });

    await this.apiKeyRepository.save(key);
    return { id: key.id, api_key: apiKey };
  }

  async validateApiKey(apiKey: string, ip: string): Promise<boolean> {
    const allKeys = await this.apiKeyRepository.find();
    for (const key of allKeys) {
      const match = await bcrypt.compare(apiKey, key.key_hash);
      if (match && (!key.ip_allowlist || key.ip_allowlist.includes(ip))) {
        return true;
      }
    }
    return false;
  }
}
