import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { VenueService } from '../../../core/services/venue.service';
import { StatsService } from '../../../core/services/stats.service';
import { Venue } from '../../../core/models/venue.model';
import { OwnerStats } from '../../../core/models/stats.model';
import { VenueFormDialog, VenueFormResult } from '../venue-form-dialog/venue-form-dialog';
import { StatTile } from '../../../shared/stat-tile/stat-tile';
import { formatCompactCurrency, formatCompactNumber } from '../../../core/utils/format.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-owner-dashboard',
  imports: [RouterLink, StatTile, LoadingIndicator],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.scss',
})
export class OwnerDashboard implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly venueService = inject(VenueService);
  private readonly statsService = inject(StatsService);
  private readonly dialog = inject(Dialog);
  private readonly snackBar = inject(ToastService);
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

  thumbnailUrl(venue: Venue): string | null {
    return venue.thumbnailUrl;
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
    const ref = this.dialog.open<VenueFormResult>(VenueFormDialog, { data: null });
    ref.closed.subscribe((result: VenueFormResult | undefined) => {
      if (!result) return;
      const { request, thumbnailFile } = result;
      this.venueService.create(request).subscribe({
        next: (venue) => {
          this.snackBar.open('Venue created — pending admin approval', 'Dismiss', { duration: 4000 });
          if (thumbnailFile) {
            this.venueService.uploadThumbnail(venue.id, thumbnailFile).subscribe({
              next: () => this.loadVenues(),
              error: () => {
                this.snackBar.open('Venue created, but the photo failed to upload', 'Dismiss', { duration: 4000 });
                this.loadVenues();
              },
            });
          } else {
            this.loadVenues();
          }
        },
        error: () => this.snackBar.open('Failed to create venue', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  openEditDialog(venue: Venue): void {
    const ref = this.dialog.open<VenueFormResult>(VenueFormDialog, { data: venue });
    ref.closed.subscribe((result: VenueFormResult | undefined) => {
      if (!result) return;
      const { request, thumbnailFile } = result;
      this.venueService.update(venue.id, request).subscribe({
        next: () => {
          this.snackBar.open('Venue updated', 'Dismiss', { duration: 4000 });
          if (thumbnailFile) {
            this.venueService.uploadThumbnail(venue.id, thumbnailFile).subscribe({
              next: () => this.loadVenues(),
              error: () => {
                this.snackBar.open('Venue updated, but the photo failed to upload', 'Dismiss', { duration: 4000 });
                this.loadVenues();
              },
            });
          } else {
            this.loadVenues();
          }
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

  statusChipClass(status: Venue['status']): string {
    switch (status) {
      case 'APPROVED':
        return 'chip-success';
      case 'REJECTED':
        return 'chip-error';
      default:
        return 'chip-warning';
    }
  }
}
