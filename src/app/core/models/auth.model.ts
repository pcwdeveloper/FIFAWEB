import { Role, User } from './user.model';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: Extract<Role, 'PLAYER' | 'VENUE_OWNER'>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}
