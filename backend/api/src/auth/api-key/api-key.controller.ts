import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Controller('api/v1/auth/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async create(@Body() body: { owner: string; ip_allowlist?: string[] }) {
    if (!body.owner || body.owner.trim() === '') {
      throw new BadRequestException('Owner field is required');
    }

    return this.apiKeyService.generateApiKey(body.owner, body.ip_allowlist);
  }
}
