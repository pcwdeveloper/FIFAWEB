export interface Court {
  id: number;
  name: string;
  venueId: number;
  sportId: number;
  sportName: string;
  pricePerSlot: number;
  active: boolean;
}

export interface CourtRequest {
  name: string;
  sportId: number;
  pricePerSlot: number;
}
