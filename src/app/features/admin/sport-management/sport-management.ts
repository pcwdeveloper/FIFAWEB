import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { SportService } from '../../../core/services/sport.service';
import { Sport } from '../../../core/models/sport.model';
import { sportIcon } from '../../../core/utils/sport-icon.util';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-sport-management',
  imports: [RouterLink, ReactiveFormsModule, LoadingIndicator],
  templateUrl: './sport-management.html',
  styleUrl: './sport-management.scss',
})
export class SportManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sportService = inject(SportService);
  private readonly snackBar = inject(ToastService);

  readonly sports = signal<Sport[]>([]);
  readonly loading = signal(true);
  readonly editingSport = signal<Sport | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadSports();
  }

  loadSports(): void {
    this.loading.set(true);
    this.sportService.list().subscribe({
      next: (sports) => {
        this.sports.set(sports);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load sports', 'Dismiss', { duration: 4000 });
      },
    });
  }

  startEdit(sport: Sport): void {
    this.editingSport.set(sport);
    this.form.setValue({ name: sport.name });
  }

  cancelEdit(): void {
    this.editingSport.set(null);
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();
    const editing = this.editingSport();

    const request$ = editing ? this.sportService.update(editing.id, request) : this.sportService.create(request);

    request$.subscribe({
      next: () => {
        this.snackBar.open(editing ? 'Sport updated' : 'Sport added', 'Dismiss', { duration: 4000 });
        this.cancelEdit();
        this.loadSports();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Failed to save sport';
        this.snackBar.open(message, 'Dismiss', { duration: 4000 });
      },
    });
  }

  icon(sport: Sport): string {
    return sportIcon(sport.name);
  }

  deleteSport(sport: Sport): void {
    if (!confirm(`Delete sport "${sport.name}"? Courts using this sport must be removed first.`)) return;

    this.sportService.delete(sport.id).subscribe({
      next: () => {
        this.snackBar.open('Sport deleted', 'Dismiss', { duration: 4000 });
        this.loadSports();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Failed to delete sport';
        this.snackBar.open(message, 'Dismiss', { duration: 4000 });
      },
    });
  }
}
