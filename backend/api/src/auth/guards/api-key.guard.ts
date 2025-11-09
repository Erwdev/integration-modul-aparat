import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException,
  Logger 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../api-key/api-key.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ✅ Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // ✅ Extract API key from header
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey) {
      this.logger.warn(`Missing API key from IP: ${this.getClientIp(request)}`);
      throw new UnauthorizedException('API key is required. Provide X-API-Key header.');
    }

    // ✅ Extract client IP
    const clientIp = this.getClientIp(request);
    this.logger.log(`Validating API key for IP: ${clientIp}`);

    // ✅ Validate API key and IP whitelist
    const isValid = await this.apiKeyService.validateApiKey(apiKey, clientIp);

    if (!isValid) {
      this.logger.warn(`Invalid API key or IP blocked: ${clientIp}`);
      throw new UnauthorizedException(
        'Invalid API key or IP address not allowed. Check your API key and IP whitelist.'
      );
    }

    this.logger.log(`API key validated successfully for IP: ${clientIp}`);
    return true;
  }

  /**
   * Extract real client IP from request (handles proxies)
   */
  private getClientIp(request: any): string {
    // ✅ Try X-Forwarded-For (nginx/load balancer)
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = forwarded.split(',').map((ip: string) => ip.trim());
      return ips[0]; // First IP is the real client
    }

    // ✅ Try X-Real-IP (nginx)
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    // ✅ Fallback to direct connection IP
    let ip = request.ip || request.connection?.remoteAddress || request.socket?.remoteAddress;

    // ✅ Handle IPv6-mapped IPv4 (::ffff:172.18.0.1 → 172.18.0.1)
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    return ip || 'unknown';
  }
}