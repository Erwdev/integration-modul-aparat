export class AuthResponseDto {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number; // seconds
  user: {
    id: number;
    username: string;
    email?: string;
    role: string;
    nama_lengkap: string;
  };
}

export class RefreshResponseDto {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export class ProfileResponseDto {
  id: number;
  username: string;
  email? : string
  role: string;
  nama_lengkap: string;
  created_at: Date;
  updated_at: Date;
}
