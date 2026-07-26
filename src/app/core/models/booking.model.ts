export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: number;
  slotId: number;
  courtId: number;
  courtName: string;
  venueId: number;
  venueName: string;
  sportName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingRequest {
  slotId: number;
}

export interface BookingInitResponse {
  booking: Booking;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
