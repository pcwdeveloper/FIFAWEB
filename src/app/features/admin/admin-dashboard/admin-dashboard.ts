import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { StatsService } from '../../../core/services/stats.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminStats } from '../../../core/models/stats.model';
import { StatTile } from '../../../shared/stat-tile/stat-tile';
import { formatCompactCurrency, formatCompactNumber } from '../../../core/utils/format.util';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, MatCardModule, MatIconModule, StatTile],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly statsService = inject(StatsService);

  readonly stats = signal<AdminStats | null>(null);

  ngOnInit(): void {
    this.statsService.getAdminStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  formatNumber(value: number): string {
    return formatCompactNumber(value);
  }

  formatCurrency(value: number): string {
    return formatCompactCurrency(value);
  }
}
