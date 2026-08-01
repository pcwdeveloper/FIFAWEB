import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';
import { sportIcon } from '../../../core/utils/sport-icon.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, LoadingIndicator],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookings implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly snackBar = inject(ToastService);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.bookingService.listMine().subscribe({
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

  statusChipClass(status: Booking['status']): string {
    switch (status) {
      case 'CONFIRMED':
        return 'chip-success';
      case 'CANCELLED':
        return 'chip-error';
      default:
        return 'chip-warning';
    }
  }
}
