import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VenueService } from '../../../core/services/venue.service';
import { Venue } from '../../../core/models/venue.model';

@Component({
  selector: 'app-player-dashboard',
  imports: [RouterLink, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './player-dashboard.html',
  styleUrl: './player-dashboard.scss',
})
export class PlayerDashboard implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

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
}
