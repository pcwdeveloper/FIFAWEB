import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { VenueService } from '../../../core/services/venue.service';
import { StatsService } from '../../../core/services/stats.service';
import { Venue, VenueRequest } from '../../../core/models/venue.model';
import { OwnerStats } from '../../../core/models/stats.model';
import { VenueFormDialog } from '../venue-form-dialog/venue-form-dialog';
import { StatTile } from '../../../shared/stat-tile/stat-tile';
import { formatCompactCurrency, formatCompactNumber } from '../../../core/utils/format.util';

@Component({
  selector: 'app-owner-dashboard',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, StatTile],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.scss',
})
export class OwnerDashboard implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly venueService = inject(VenueService);
  private readonly statsService = inject(StatsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);
  readonly stats = signal<OwnerStats | null>(null);

  ngOnInit(): void {
    this.loadVenues();
    this.statsService.getOwnerStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  formatNumber(value: number): string {
    return formatCompactNumber(value);
  }

  formatCurrency(value: number): string {
    return formatCompactCurrency(value);
  }

  loadVenues(): void {
    this.loading.set(true);
    this.venueService.listMine().subscribe({
      next: (venues) => {
        this.venues.set(venues);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load venues', 'Dismiss', { duration: 4000 });
      },
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(VenueFormDialog, { data: null });
    ref.afterClosed().subscribe((request: VenueRequest | undefined) => {
      if (!request) return;
      this.venueService.create(request).subscribe({
        next: () => {
          this.snackBar.open('Venue created — pending admin approval', 'Dismiss', { duration: 4000 });
          this.loadVenues();
        },
        error: () => this.snackBar.open('Failed to create venue', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  openEditDialog(venue: Venue): void {
    const ref = this.dialog.open(VenueFormDialog, { data: venue });
    ref.afterClosed().subscribe((request: VenueRequest | undefined) => {
      if (!request) return;
      this.venueService.update(venue.id, request).subscribe({
        next: () => {
          this.snackBar.open('Venue updated', 'Dismiss', { duration: 4000 });
          this.loadVenues();
        },
        error: () => this.snackBar.open('Failed to update venue', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  deleteVenue(venue: Venue): void {
    if (!confirm(`Delete venue "${venue.name}"? This cannot be undone.`)) return;

    this.venueService.delete(venue.id).subscribe({
      next: () => {
        this.snackBar.open('Venue deleted', 'Dismiss', { duration: 4000 });
        this.loadVenues();
      },
      error: () => this.snackBar.open('Failed to delete venue', 'Dismiss', { duration: 4000 }),
    });
  }

  viewCourts(venue: Venue): void {
    this.router.navigate(['/owner/venues', venue.id]);
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
