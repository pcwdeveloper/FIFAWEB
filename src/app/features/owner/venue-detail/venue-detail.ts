import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VenueService } from '../../../core/services/venue.service';
import { CourtService } from '../../../core/services/court.service';
import { SportService } from '../../../core/services/sport.service';
import { Venue } from '../../../core/models/venue.model';
import { Court } from '../../../core/models/court.model';
import { Sport } from '../../../core/models/sport.model';
import { sportIcon } from '../../../core/utils/sport-icon.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

export interface SportTile {
  sport: Sport;
  courtCount: number;
}

@Component({
  selector: 'app-venue-detail',
  imports: [RouterLink, MatCardModule, MatIconModule, MatChipsModule, LoadingIndicator],
  templateUrl: './venue-detail.html',
  styleUrl: './venue-detail.scss',
})
export class VenueDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(VenueService);
  private readonly courtService = inject(CourtService);
  private readonly sportService = inject(SportService);
  private readonly snackBar = inject(MatSnackBar);

  readonly venueId = Number(this.route.snapshot.paramMap.get('id'));

  readonly venue = signal<Venue | null>(null);
  readonly courts = signal<Court[]>([]);
  readonly sports = signal<Sport[]>([]);
  readonly loading = signal(true);

  readonly sportTiles = computed<SportTile[]>(() =>
    this.sports().map((sport) => ({
      sport,
      courtCount: this.courts().filter((court) => court.sportId === sport.id).length,
    })),
  );

  ngOnInit(): void {
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

  openSport(sport: Sport): void {
    this.router.navigate(['/owner/venues', this.venueId, 'sports', sport.id, 'courts']);
  }

  icon(sportName: string): string {
    return sportIcon(sportName);
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
