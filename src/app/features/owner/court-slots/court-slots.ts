import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/services/toast.service';
import { SlotService } from '../../../core/services/slot.service';
import { CourtService } from '../../../core/services/court.service';
import {
  BulkSlotBlockRequest,
  BulkSlotDeleteRequest,
  BulkSlotRequest,
  Slot,
  TimeOfDay,
  TIME_OF_DAY_INFO,
} from '../../../core/models/slot.model';
import { Court } from '../../../core/models/court.model';
import { BulkSlotFormDialog } from '../bulk-slot-form-dialog/bulk-slot-form-dialog';
import { BulkSlotDeleteDialog } from '../bulk-slot-delete-dialog/bulk-slot-delete-dialog';
import { BulkSlotBlockDialog } from '../bulk-slot-block-dialog/bulk-slot-block-dialog';
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
  imports: [RouterLink, LoadingIndicator],
  templateUrl: './court-slots.html',
  styleUrl: './court-slots.scss',
})
export class CourtSlots implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly slotService = inject(SlotService);
  private readonly courtService = inject(CourtService);
  private readonly dialog = inject(Dialog);
  private readonly snackBar = inject(ToastService);

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

  readonly selectedSlotIds = signal<Set<number>>(new Set());
  readonly selectedCount = computed(() => this.selectedSlotIds().size);

  readonly allVisibleSelected = computed(() => {
    const visible = this.slotsForSelectedDate();
    if (visible.length === 0) return false;
    const selected = this.selectedSlotIds();
    return visible.every((s) => selected.has(s.id));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.venueId = Number(params.get('venueId'));
      this.courtId = Number(params.get('courtId'));
      this.clearSelection();
      this.loadAll();
    });
  }

  loadAll(): void {
    this.loading.set(true);
    this.courtService.listByVenue(this.venueId).subscribe({
      next: (courts) => {
        const current = courts.find((c) => c.id === this.courtId) ?? null;
        this.court.set(current);
        // Only offer courts of the same sport in the switcher — this page is reached via a
        // specific sport's "Manage courts" list, so switching sports here would be surprising.
        this.venueCourts.set(current ? courts.filter((c) => c.sportId === current.sportId) : courts);
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
    this.clearSelection();
  }

  isSelected(slot: Slot): boolean {
    return this.selectedSlotIds().has(slot.id);
  }

  toggleSelect(slot: Slot): void {
    const next = new Set(this.selectedSlotIds());
    if (next.has(slot.id)) {
      next.delete(slot.id);
    } else {
      next.add(slot.id);
    }
    this.selectedSlotIds.set(next);
  }

  toggleSelectAllVisible(): void {
    const visible = this.slotsForSelectedDate();
    const next = new Set(this.selectedSlotIds());
    if (this.allVisibleSelected()) {
      visible.forEach((s) => next.delete(s.id));
    } else {
      visible.forEach((s) => next.add(s.id));
    }
    this.selectedSlotIds.set(next);
  }

  clearSelection(): void {
    this.selectedSlotIds.set(new Set());
  }

  bulkBlockSelected(): void {
    const ids = this.selectedSlotIds();
    const targets = this.slots().filter((s) => ids.has(s.id) && s.status !== 'BOOKED');
    const skipped = ids.size - targets.length;
    if (targets.length === 0) {
      this.snackBar.open('Selected slots cannot be blocked (already booked)', 'Dismiss', { duration: 4000 });
      return;
    }

    forkJoin(targets.map((s) => this.slotService.updateStatus(s.id, { status: 'BLOCKED' }))).subscribe({
      next: () => {
        const skippedMessage = skipped > 0 ? `, skipped ${skipped} booked slot(s)` : '';
        this.snackBar.open(`Blocked ${targets.length} slot(s)${skippedMessage}`, 'Dismiss', { duration: 5000 });
        this.clearSelection();
        this.loadAll();
      },
      error: () => {
        this.snackBar.open('Failed to block some slots', 'Dismiss', { duration: 4000 });
        this.loadAll();
      },
    });
  }

  bulkUnblockSelected(): void {
    const ids = this.selectedSlotIds();
    const targets = this.slots().filter((s) => ids.has(s.id) && s.status !== 'BOOKED');
    const skipped = ids.size - targets.length;
    if (targets.length === 0) {
      this.snackBar.open('Selected slots cannot be unblocked (already booked)', 'Dismiss', { duration: 4000 });
      return;
    }

    forkJoin(targets.map((s) => this.slotService.updateStatus(s.id, { status: 'AVAILABLE' }))).subscribe({
      next: () => {
        const skippedMessage = skipped > 0 ? `, skipped ${skipped} booked slot(s)` : '';
        this.snackBar.open(`Unblocked ${targets.length} slot(s)${skippedMessage}`, 'Dismiss', { duration: 5000 });
        this.clearSelection();
        this.loadAll();
      },
      error: () => {
        this.snackBar.open('Failed to unblock some slots', 'Dismiss', { duration: 4000 });
        this.loadAll();
      },
    });
  }

  bulkDeleteSelected(): void {
    const ids = this.selectedSlotIds();
    const targets = this.slots().filter((s) => ids.has(s.id) && s.status !== 'BOOKED');
    const skipped = ids.size - targets.length;
    if (targets.length === 0) {
      this.snackBar.open('Selected slots cannot be deleted (already booked)', 'Dismiss', { duration: 4000 });
      return;
    }
    if (!confirm(`Delete ${targets.length} selected slot(s)?`)) return;

    forkJoin(targets.map((s) => this.slotService.delete(s.id))).subscribe({
      next: () => {
        const skippedMessage = skipped > 0 ? `, skipped ${skipped} booked slot(s)` : '';
        this.snackBar.open(`Deleted ${targets.length} slot(s)${skippedMessage}`, 'Dismiss', { duration: 5000 });
        this.clearSelection();
        this.loadAll();
      },
      error: () => {
        this.snackBar.open('Failed to delete some slots', 'Dismiss', { duration: 4000 });
        this.loadAll();
      },
    });
  }

  switchCourt(court: Court): void {
    if (court.id === this.courtId) return;
    this.router.navigate(['/owner/venues', this.venueId, 'courts', court.id, 'slots']);
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
    const ref = this.dialog.open<BulkSlotRequest>(BulkSlotFormDialog, { width: '580px', maxWidth: '95vw' });
    ref.closed.subscribe((request: BulkSlotRequest | undefined) => {
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

  openBulkDeleteDialog(): void {
    const ref = this.dialog.open<BulkSlotDeleteRequest>(BulkSlotDeleteDialog);
    ref.closed.subscribe((request: BulkSlotDeleteRequest | undefined) => {
      if (!request) return;
      this.slotService.deleteBulk(this.courtId, request).subscribe({
        next: (result) => {
          const skippedMessage = result.skippedCount > 0 ? `, skipped ${result.skippedCount} booked slot(s)` : '';
          this.snackBar.open(`Deleted ${result.deletedCount} slot(s)${skippedMessage}`, 'Dismiss', {
            duration: 5000,
          });
          this.clearSelection();
          this.loadAll();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to delete slots';
          this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        },
      });
    });
  }

  openBulkBlockDialog(): void {
    const ref = this.dialog.open<BulkSlotBlockRequest>(BulkSlotBlockDialog);
    ref.closed.subscribe((request: BulkSlotBlockRequest | undefined) => {
      if (!request) return;
      this.slotService.blockBulk(this.courtId, request).subscribe({
        next: (result) => {
          const skippedMessage = result.skippedCount > 0 ? `, skipped ${result.skippedCount} booked slot(s)` : '';
          this.snackBar.open(`Blocked ${result.blockedCount} slot(s)${skippedMessage}`, 'Dismiss', {
            duration: 5000,
          });
          this.clearSelection();
          this.loadAll();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to block slots';
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

  statusChipClass(status: Slot['status']): string {
    switch (status) {
      case 'AVAILABLE':
        return 'chip-success';
      case 'BLOCKED':
        return 'chip-error';
      default:
        return 'chip-primary';
    }
  }
}
