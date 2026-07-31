export type VenueStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: VenueStatus;
  ownerId: number;
  ownerName: string;
  createdAt: string;
}

export interface VenueRequest {
  name: string;
  address: string;
  city: string;
  description?: string;
}

export interface VenueStatusUpdateRequest {
  status: Extract<VenueStatus, 'APPROVED' | 'REJECTED'>;
}
