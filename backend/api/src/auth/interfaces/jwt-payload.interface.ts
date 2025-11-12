export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: number;
  tokenId: string;
  iat?: number;
  exp?: number;
}