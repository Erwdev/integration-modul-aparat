import { SetMetadata } from '@nestjs/common';

export const IS_API_KEY_AUTH = 'isApiKeyAuth';

/**
 * Mark route to use API Key authentication instead of JWT
 */
export const ApiKeyAuth = () => SetMetadata(IS_API_KEY_AUTH, true);