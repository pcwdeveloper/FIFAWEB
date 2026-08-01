import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { VenueService } from '../../../core/services/venue.service';
import { Venue } from '../../../core/models/venue.model';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-player-dashboard',
  imports: [RouterLink, FormsModule, LoadingIndicator],
  templateUrl: './player-dashboard.html',
  styleUrl: './player-dashboard.scss',
})
export class PlayerDashboard implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(ToastService);

  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);
  cityFilter = '';

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.venueService.listPublic(this.cityFilter || undefined).subscribe({
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

  viewCourts(venue: Venue): void {
    this.router.navigate(['/player/venues', venue.id]);
  }

  thumbnailUrl(venue: Venue): string | null {
    return venue.thumbnailUrl;
  }
}
