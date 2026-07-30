import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlotService } from '../../../core/services/slot.service';
import { CourtService } from '../../../core/services/court.service';
import { BulkSlotRequest, Slot, SlotRequest, TIME_OF_DAY_INFO } from '../../../core/models/slot.model';
import { Court } from '../../../core/models/court.model';
import { SlotFormDialog } from '../slot-form-dialog/slot-form-dialog';
import { BulkSlotFormDialog } from '../bulk-slot-form-dialog/bulk-slot-form-dialog';
import { sportIcon } from '../../../core/utils/sport-icon.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-court-slots',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTableModule, LoadingIndicator],
  templateUrl: './court-slots.html',
  styleUrl: './court-slots.scss',
})
export class CourtSlots implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly slotService = inject(SlotService);
  private readonly courtService = inject(CourtService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly venueId = Number(this.route.snapshot.paramMap.get('venueId'));
  readonly courtId = Number(this.route.snapshot.paramMap.get('courtId'));

  readonly court = signal<Court | null>(null);
  readonly slots = signal<Slot[]>([]);
  readonly loading = signal(true);

  readonly displayedColumns = ['date', 'startTime', 'endTime', 'timeOfDay', 'price', 'status', 'actions'];

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.courtService.listByVenue(this.venueId).subscribe({
      next: (courts) => this.court.set(courts.find((c) => c.id === this.courtId) ?? null),
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

  timeOfDayLabel(slot: Slot): string {
    return slot.timeOfDay ? (TIME_OF_DAY_INFO[slot.timeOfDay]?.label ?? '—') : '—';
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
