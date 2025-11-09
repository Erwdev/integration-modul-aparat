import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

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

    const savedKey = await this.apiKeyRepository.save(key);
    return { id: savedKey.id, api_key: apiKey };
  }

  async validateApiKey(apiKey: string, ip: string): Promise<boolean> {
    const allKeys = await this.apiKeyRepository.find();

    if (allKeys.length === 0) {
      this.logger.warn('No API keys exist in database');
      return false;
    }

    for (const key of allKeys) {
      try {
        // ✅ Compare hashed key
        const isMatch = await bcrypt.compare(apiKey, key.key_hash);

        if (isMatch) {
          this.logger.log(`API key matched for owner: ${key.owner}`);

          // ✅ Check IP whitelist
          if (key.ip_allowlist && key.ip_allowlist.length > 0) {
            const isIpAllowed = this.isIpInWhitelist(ip, key.ip_allowlist);
            
            if (isIpAllowed) {
              this.logger.log(`IP ${ip} is in whitelist for owner: ${key.owner}`);
              return true;
            } else {
              this.logger.warn(`IP ${ip} NOT in whitelist for owner: ${key.owner}. Allowed: ${key.ip_allowlist.join(', ')}`);
              return false;
            }
          }

          // ✅ No IP whitelist - allow all IPs
          this.logger.log(`No IP whitelist configured for owner: ${key.owner}. Allowing IP: ${ip}`);
          return true;
        }
      } catch (error) {
        this.logger.error(`Error validating API key: ${error.message}`);
        continue;
      }
    }
    this.logger.warn(`No matching API key found for IP: ${ip}`);
    return false;
    
  }

  /**
   * Check if IP is in whitelist (supports IPv4 and IPv6)
   */
  private isIpInWhitelist(clientIp: string, whitelist: string[]): boolean {
    // Normalize client IP
    const normalizedClientIp = this.normalizeIp(clientIp);

    // Check if IP is in whitelist
    for (const allowedIp of whitelist) {
      const normalizedAllowedIp = this.normalizeIp(allowedIp);
      
      if (normalizedClientIp === normalizedAllowedIp) {
        return true;
      }
    }

    return false;
  }

  private normalizeIp(ip: string): string {
    // Remove IPv6 prefix if present
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }
}
