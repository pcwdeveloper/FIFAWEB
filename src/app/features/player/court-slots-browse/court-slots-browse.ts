import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CourtService } from '../../../core/services/court.service';
import { SlotService } from '../../../core/services/slot.service';
import { BookingService } from '../../../core/services/booking.service';
import { RazorpayCheckoutService } from '../../../core/services/razorpay-checkout.service';
import { Court } from '../../../core/models/court.model';
import { Slot } from '../../../core/models/slot.model';
import { BookingInitResponse } from '../../../core/models/booking.model';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-court-slots-browse',
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './court-slots-browse.html',
  styleUrl: './court-slots-browse.scss',
})
export class CourtSlotsBrowse implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly courtService = inject(CourtService);
  private readonly slotService = inject(SlotService);
  private readonly bookingService = inject(BookingService);
  private readonly razorpayCheckout = inject(RazorpayCheckoutService);
  private readonly snackBar = inject(MatSnackBar);

  readonly venueId = Number(this.route.snapshot.paramMap.get('id'));
  readonly courtId = Number(this.route.snapshot.paramMap.get('courtId'));

  readonly court = signal<Court | null>(null);
  readonly slots = signal<Slot[]>([]);
  readonly loading = signal(true);
  readonly processingSlotId = signal<number | null>(null);
  selectedDate = today();

  ngOnInit(): void {
    this.courtService.listPublicByVenue(this.venueId).subscribe({
      next: (courts) => this.court.set(courts.find((c) => c.id === this.courtId) ?? null),
    });
    this.loadSlots();
  }

  loadSlots(): void {
    this.loading.set(true);
    this.slotService.listAvailablePublic(this.courtId, this.selectedDate).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load slots', 'Dismiss', { duration: 4000 });
      },
    });
  }

  selectSlot(slot: Slot): void {
    this.processingSlotId.set(slot.id);

    this.bookingService.create({ slotId: slot.id }).subscribe({
      next: (init) => this.openCheckout(slot, init),
      error: (err) => {
        this.processingSlotId.set(null);
        const message = err?.error?.message ?? 'Failed to start booking';
        this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        this.loadSlots();
      },
    });
  }

  private async openCheckout(slot: Slot, init: BookingInitResponse): Promise<void> {
    const court = this.court();
    const user = this.authService.currentUser();

    const response = await this.razorpayCheckout.open({
      key: init.razorpayKeyId,
      amount: init.amount,
      currency: init.currency,
      orderId: init.razorpayOrderId,
      description: court ? `${court.name} — ${slot.date} ${slot.startTime}` : undefined,
      prefillName: user?.fullName,
      prefillEmail: user?.email,
    });

    if (!response) {
      this.bookingService.cancel(init.booking.id).subscribe({
        next: () => {
          this.processingSlotId.set(null);
          this.snackBar.open('Booking cancelled', 'Dismiss', { duration: 4000 });
          this.loadSlots();
        },
        error: () => {
          this.processingSlotId.set(null);
          this.loadSlots();
        },
      });
      return;
    }

    this.bookingService
      .verifyPayment(init.booking.id, {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      })
      .subscribe({
        next: () => {
          this.processingSlotId.set(null);
          this.snackBar.open('Booking confirmed!', 'Dismiss', { duration: 5000 });
          this.router.navigate(['/player/bookings']);
        },
        error: (err) => {
          this.processingSlotId.set(null);
          const message = err?.error?.message ?? 'Payment verification failed';
          this.snackBar.open(message, 'Dismiss', { duration: 5000 });
          this.loadSlots();
        },
      });
  }
}
