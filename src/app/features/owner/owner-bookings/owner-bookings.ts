import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../../core/services/booking.service';
import { OwnerBooking } from '../../../core/models/owner-booking.model';
import { sportIcon } from '../../../core/utils/sport-icon.util';

@Component({
  selector: 'app-owner-bookings',
  imports: [RouterLink, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  templateUrl: './owner-bookings.html',
  styleUrl: './owner-bookings.scss',
})
export class OwnerBookings implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly snackBar = inject(MatSnackBar);

  readonly bookings = signal<OwnerBooking[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.bookingService.listForOwner().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load bookings', 'Dismiss', { duration: 4000 });
      },
    });
  }

  icon(sportName: string): string {
    return sportIcon(sportName);
  }

  statusColor(status: OwnerBooking['status']): string {
    switch (status) {
      case 'CONFIRMED':
        return 'primary';
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }
}
