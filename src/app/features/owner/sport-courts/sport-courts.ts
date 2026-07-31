import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourtService } from '../../../core/services/court.service';
import { SportService } from '../../../core/services/sport.service';
import { Court, CourtRequest } from '../../../core/models/court.model';
import { Sport } from '../../../core/models/sport.model';
import { CourtFormDialog } from '../court-form-dialog/court-form-dialog';
import { sportIcon } from '../../../core/utils/sport-icon.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-sport-courts',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, LoadingIndicator],
  templateUrl: './sport-courts.html',
  styleUrl: './sport-courts.scss',
})
export class SportCourts implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courtService = inject(CourtService);
  private readonly sportService = inject(SportService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly venueId = Number(this.route.snapshot.paramMap.get('venueId'));
  readonly sportId = Number(this.route.snapshot.paramMap.get('sportId'));

  readonly sport = signal<Sport | null>(null);
  readonly courts = signal<Court[]>([]);
  readonly loading = signal(true);

  readonly displayedColumns = ['name', 'pricePerSlot', 'active', 'actions'];

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    forkJoin({
      sports: this.sportService.list(),
      courts: this.courtService.listByVenueAndSport(this.venueId, this.sportId),
    }).subscribe({
      next: ({ sports, courts }) => {
        this.sport.set(sports.find((s) => s.id === this.sportId) ?? null);
        this.courts.set(courts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load courts', 'Dismiss', { duration: 4000 });
      },
    });
  }

  openCreateCourtDialog(): void {
    const sport = this.sport();
    if (!sport) return;

    const ref = this.dialog.open(CourtFormDialog, { data: { court: null, sport } });
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
    const sport = this.sport();
    if (!sport) return;

    const ref = this.dialog.open(CourtFormDialog, { data: { court, sport } });
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

  icon(sportName: string): string {
    return sportIcon(sportName);
  }
}
