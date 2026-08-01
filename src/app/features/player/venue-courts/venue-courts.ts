import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { VenueService } from '../../../core/services/venue.service';
import { CourtService } from '../../../core/services/court.service';
import { Venue } from '../../../core/models/venue.model';
import { Court } from '../../../core/models/court.model';
import { sportIcon } from '../../../core/utils/sport-icon.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-venue-courts',
  imports: [RouterLink, LoadingIndicator],
  templateUrl: './venue-courts.html',
  styleUrl: './venue-courts.scss',
})
export class VenueCourts implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(VenueService);
  private readonly courtService = inject(CourtService);
  private readonly snackBar = inject(ToastService);

  readonly venueId = Number(this.route.snapshot.paramMap.get('id'));

  readonly venue = signal<Venue | null>(null);
  readonly courts = signal<Court[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.venueService.listPublic().subscribe({
      next: (venues) => this.venue.set(venues.find((v) => v.id === this.venueId) ?? null),
    });

    this.courtService.listPublicByVenue(this.venueId).subscribe({
      next: (courts) => {
        this.courts.set(courts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load courts', 'Dismiss', { duration: 4000 });
      },
    });
  }

  viewSlots(court: Court): void {
    this.router.navigate(['/player/venues', this.venueId, 'courts', court.id]);
  }

  icon(sportName: string): string {
    return sportIcon(sportName);
  }

  thumbnailUrl(venue: Venue): string | null {
    return venue.thumbnailUrl;
  }
}
