import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VenueService } from '../../../core/services/venue.service';
import { Venue, VenueStatus } from '../../../core/models/venue.model';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

const TABS: (VenueStatus | 'ALL')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

@Component({
  selector: 'app-venue-approval',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatChipsModule, MatTabsModule, MatIconModule, LoadingIndicator],
  templateUrl: './venue-approval.html',
  styleUrl: './venue-approval.scss',
})
export class VenueApproval implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly snackBar = inject(MatSnackBar);

  readonly tabs = TABS;
  readonly selectedTabIndex = signal(0);
  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadVenues();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    this.loadVenues();
  }

  loadVenues(): void {
    const status = this.tabs[this.selectedTabIndex()];
    this.loading.set(true);
    this.venueService.listAll(status === 'ALL' ? undefined : status).subscribe({
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

  approve(venue: Venue): void {
    this.venueService.updateStatus(venue.id, { status: 'APPROVED' }).subscribe({
      next: () => {
        this.snackBar.open(`${venue.name} approved`, 'Dismiss', { duration: 4000 });
        this.loadVenues();
      },
      error: () => this.snackBar.open('Failed to approve venue', 'Dismiss', { duration: 4000 }),
    });
  }

  reject(venue: Venue): void {
    this.venueService.updateStatus(venue.id, { status: 'REJECTED' }).subscribe({
      next: () => {
        this.snackBar.open(`${venue.name} rejected`, 'Dismiss', { duration: 4000 });
        this.loadVenues();
      },
      error: () => this.snackBar.open('Failed to reject venue', 'Dismiss', { duration: 4000 }),
    });
  }

  thumbnailUrl(venue: Venue): string | null {
    return venue.thumbnailUrl;
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
