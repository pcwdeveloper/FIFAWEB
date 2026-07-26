import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Booking,
  BookingInitResponse,
  CreateBookingRequest,
  VerifyPaymentRequest,
} from '../models/booking.model';
import { OwnerBooking } from '../models/owner-booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/bookings`;

  create(request: CreateBookingRequest): Observable<BookingInitResponse> {
    return this.http.post<BookingInitResponse>(this.apiUrl, request);
  }

  listMine(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/mine`);
  }

  verifyPayment(bookingId: number, request: VerifyPaymentRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/${bookingId}/verify-payment`, request);
  }

  cancel(bookingId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${bookingId}/cancel`, {});
  }

  listForOwner(): Observable<OwnerBooking[]> {
    return this.http.get<OwnerBooking[]>(`${environment.apiBaseUrl}/owner/bookings`);
  }
}
