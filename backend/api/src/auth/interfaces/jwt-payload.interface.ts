export interface JwtPayload extends Record<string, any> {
  sub: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload extends Record<string, any> {
  sub: number;
  tokenId: string;
  iat?: number;
  exp?: number;
}
