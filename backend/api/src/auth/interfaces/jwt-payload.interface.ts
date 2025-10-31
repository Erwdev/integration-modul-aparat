export interface JwtPayload {
  sub: number; // User ID (standard JWT claim)
  username: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export interface JwtRefreshPayload {
  sub: number;
  tokenId: string; // Unique ID untuk detect token reuse
  iat?: number;
  exp?: number;
}
