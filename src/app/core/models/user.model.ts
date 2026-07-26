export type Role = 'PLAYER' | 'VENUE_OWNER' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
}
