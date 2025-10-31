export class AuthResponseDto {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number; // seconds
  user: {
    id: number;
    username: string;
    role: string;
    nama_lengkap: string;
  };
}

export class TokenPayloadDto {
  sub: number; // user id (standard JWT claim)
  username: string;
  role: string;
  iat?: number; // issued at
  exp?: number; // expiration
}
