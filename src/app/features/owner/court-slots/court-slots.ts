import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlotService } from '../../../core/services/slot.service';
import { CourtService } from '../../../core/services/court.service';
import { BulkSlotRequest, Slot, SlotRequest, TimeOfDay, TIME_OF_DAY_INFO } from '../../../core/models/slot.model';
import { Court } from '../../../core/models/court.model';
import { SlotFormDialog } from '../slot-form-dialog/slot-form-dialog';
import { BulkSlotFormDialog } from '../bulk-slot-form-dialog/bulk-slot-form-dialog';
import { sportIcon } from '../../../core/utils/sport-icon.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
const DATE_STRIP_DAYS = 30;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface DateOption {
  iso: string;
  dayName: string;
  dayNumber: string;
  monthShort: string;
  isToday: boolean;
}

export interface SlotGroup {
  timeOfDay: TimeOfDay;
  label: string;
  icon: string;
  slots: Slot[];
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-court-slots',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, LoadingIndicator],
  templateUrl: './court-slots.html',
  styleUrl: './court-slots.scss',
})
export class CourtSlots implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly slotService = inject(SlotService);
  private readonly courtService = inject(CourtService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  venueId = Number(this.route.snapshot.paramMap.get('venueId'));
  courtId = Number(this.route.snapshot.paramMap.get('courtId'));

  readonly court = signal<Court | null>(null);
  readonly venueCourts = signal<Court[]>([]);
  readonly slots = signal<Slot[]>([]);
  readonly loading = signal(true);

  private readonly todayIso = toIsoDate(new Date());
  readonly selectedDate = signal(this.todayIso);

  readonly dateOptions: DateOption[] = Array.from({ length: DATE_STRIP_DAYS }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      iso: toIsoDate(date),
      dayName: DAY_NAMES[date.getDay()],
      dayNumber: String(date.getDate()).padStart(2, '0'),
      monthShort: MONTH_NAMES[date.getMonth()].slice(0, 3),
      isToday: i === 0,
    };
  });

  readonly monthLabel = computed(() => {
    const option = this.dateOptions.find((d) => d.iso === this.selectedDate());
    const date = option ? new Date(option.iso) : new Date();
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  });

  readonly slotsForSelectedDate = computed(() => this.slots().filter((s) => s.date === this.selectedDate()));

  readonly slotGroups = computed<SlotGroup[]>(() => {
    const forDate = this.slotsForSelectedDate();
    return TIME_OF_DAY_ORDER.map((timeOfDay) => ({
      timeOfDay,
      label: TIME_OF_DAY_INFO[timeOfDay].label,
      icon: TIME_OF_DAY_INFO[timeOfDay].icon,
      slots: forDate.filter((s) => s.timeOfDay === timeOfDay).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    })).filter((group) => group.slots.length > 0);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.venueId = Number(params.get('venueId'));
      this.courtId = Number(params.get('courtId'));
      this.loadAll();
    });
  }

  loadAll(): void {
    this.loading.set(true);
    this.courtService.listByVenue(this.venueId).subscribe({
      next: (courts) => {
        this.venueCourts.set(courts);
        this.court.set(courts.find((c) => c.id === this.courtId) ?? null);
      },
    });

    this.slotService.listByCourtForOwner(this.courtId).subscribe({
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

  selectDate(iso: string): void {
    this.selectedDate.set(iso);
  }

  switchCourt(court: Court): void {
    if (court.id === this.courtId) return;
    this.router.navigate(['/owner/venues', this.venueId, 'courts', court.id, 'slots']);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(SlotFormDialog);
    ref.afterClosed().subscribe((request: SlotRequest | undefined) => {
      if (!request) return;
      this.slotService.create(this.courtId, request).subscribe({
        next: () => {
          this.snackBar.open('Slot added', 'Dismiss', { duration: 4000 });
          this.loadAll();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to add slot';
          this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        },
      });
    });
  }

  toggleBlock(slot: Slot): void {
    const newStatus = slot.status === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED';
    this.slotService.updateStatus(slot.id, { status: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`Slot marked ${newStatus}`, 'Dismiss', { duration: 4000 });
        this.loadAll();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Failed to update slot';
        this.snackBar.open(message, 'Dismiss', { duration: 4000 });
      },
    });
  }

  deleteSlot(slot: Slot): void {
    if (!confirm('Delete this slot?')) return;

    this.slotService.delete(slot.id).subscribe({
      next: () => {
        this.snackBar.open('Slot deleted', 'Dismiss', { duration: 4000 });
        this.loadAll();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Failed to delete slot';
        this.snackBar.open(message, 'Dismiss', { duration: 4000 });
      },
    });
  }

  openBulkCreateDialog(): void {
    const ref = this.dialog.open(BulkSlotFormDialog, { width: '760px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((request: BulkSlotRequest | undefined) => {
      if (!request) return;
      this.slotService.createBulk(this.courtId, request).subscribe({
        next: (result) => {
          const skippedMessage = result.skippedCount > 0 ? `, skipped ${result.skippedCount} conflicting slot(s)` : '';
          this.snackBar.open(`Created ${result.created.length} slots${skippedMessage}`, 'Dismiss', {
            duration: 5000,
          });
          this.loadAll();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to generate slots';
          this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        },
      });
    });
  }

  icon(sportName: string): string {
    return sportIcon(sportName);
  }

  isOngoing(slot: Slot): boolean {
    if (slot.date !== this.todayIso) return false;
    const now = new Date().toTimeString().slice(0, 8);
    return slot.startTime <= now && now < slot.endTime;
  }

  statusColor(status: Slot['status']): string {
    switch (status) {
      case 'AVAILABLE':
        return 'primary';
      case 'BLOCKED':
        return 'warn';
      default:
        return '';
    }
  }
}
