import { BookingStatus } from './booking.model';

export interface OwnerBooking {
  id: number;
  venueId: number;
  venueName: string;
  courtName: string;
  sportName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: BookingStatus;
  playerName: string;
  playerEmail: string;
  playerPhone: string | null;
  createdAt: string;
}
