import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VenueService } from '../../../core/services/venue.service';
import { CourtService } from '../../../core/services/court.service';
import { SportService } from '../../../core/services/sport.service';
import { Venue } from '../../../core/models/venue.model';
import { Court, CourtRequest } from '../../../core/models/court.model';
import { Sport } from '../../../core/models/sport.model';
import { CourtFormDialog } from '../court-form-dialog/court-form-dialog';

@Component({
  selector: 'app-venue-detail',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './venue-detail.html',
  styleUrl: './venue-detail.scss',
})
export class VenueDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly venueService = inject(VenueService);
  private readonly courtService = inject(CourtService);
  private readonly sportService = inject(SportService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly venueId = Number(this.route.snapshot.paramMap.get('id'));

  readonly venue = signal<Venue | null>(null);
  readonly courts = signal<Court[]>([]);
  readonly sports = signal<Sport[]>([]);
  readonly loading = signal(true);

  readonly displayedColumns = ['name', 'sportName', 'pricePerSlot', 'active', 'actions'];

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    forkJoin({
      venue: this.venueService.getMine(this.venueId),
      courts: this.courtService.listByVenue(this.venueId),
      sports: this.sportService.list(),
    }).subscribe({
      next: ({ venue, courts, sports }) => {
        this.venue.set(venue);
        this.courts.set(courts);
        this.sports.set(sports);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load venue details', 'Dismiss', { duration: 4000 });
      },
    });
  }

  openCreateCourtDialog(): void {
    if (this.sports().length === 0) {
      this.snackBar.open('No sports available yet — ask an admin to add sports first', 'Dismiss', { duration: 5000 });
      return;
    }

    const ref = this.dialog.open(CourtFormDialog, { data: { court: null, sports: this.sports() } });
    ref.afterClosed().subscribe((request: CourtRequest | undefined) => {
      if (!request) return;
      this.courtService.create(this.venueId, request).subscribe({
        next: () => {
          this.snackBar.open('Court added', 'Dismiss', { duration: 4000 });
          this.loadAll();
        },
        error: () => this.snackBar.open('Failed to add court', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  openEditCourtDialog(court: Court): void {
    const ref = this.dialog.open(CourtFormDialog, { data: { court, sports: this.sports() } });
    ref.afterClosed().subscribe((request: CourtRequest | undefined) => {
      if (!request) return;
      this.courtService.update(court.id, request).subscribe({
        next: () => {
          this.snackBar.open('Court updated', 'Dismiss', { duration: 4000 });
          this.loadAll();
        },
        error: () => this.snackBar.open('Failed to update court', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  deleteCourt(court: Court): void {
    if (!confirm(`Delete court "${court.name}"? This cannot be undone.`)) return;

    this.courtService.delete(court.id).subscribe({
      next: () => {
        this.snackBar.open('Court deleted', 'Dismiss', { duration: 4000 });
        this.loadAll();
      },
      error: () => this.snackBar.open('Failed to delete court', 'Dismiss', { duration: 4000 }),
    });
  }

  statusColor(status: Venue['status']): string {
    switch (status) {
      case 'APPROVED':
        return 'primary';
      case 'REJECTED':
        return 'warn';
      default:
        return '';
    }
  }
}
