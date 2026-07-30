import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BulkSlotCategoryConfig,
  BulkSlotRequest,
  TIME_OF_DAY_DEFAULTS,
  TIME_OF_DAY_INFO,
  TimeOfDay,
} from '../../../core/models/slot.model';

const CATEGORY_KEYS: Extract<keyof BulkSlotRequest, 'morning' | 'afternoon' | 'evening' | 'night'>[] = [
  'morning',
  'afternoon',
  'evening',
  'night',
];

const TIME_OF_DAY_BY_KEY: Record<(typeof CATEGORY_KEYS)[number], TimeOfDay> = {
  morning: 'MORNING',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
  night: 'NIGHT',
};

const INTERVAL_OPTIONS = [30, 45, 60, 90, 120];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Component({
  selector: 'app-bulk-slot-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './bulk-slot-form-dialog.html',
  styleUrl: './bulk-slot-form-dialog.scss',
})
export class BulkSlotFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BulkSlotFormDialog>);
  private readonly snackBar = inject(MatSnackBar);

  readonly categoryKeys = CATEGORY_KEYS;
  readonly intervalOptions = INTERVAL_OPTIONS;
  readonly monthNames = MONTH_NAMES;
  readonly yearOptions = this.buildYearOptions();
  readonly timeOfDayInfo = TIME_OF_DAY_INFO;

  readonly form = this.fb.group({
    month: this.fb.nonNullable.control(this.defaultMonth().month, [Validators.required]),
    year: this.fb.nonNullable.control(this.defaultMonth().year, [Validators.required]),
    morning: this.categoryGroup(true, 'MORNING', 60, 500),
    afternoon: this.categoryGroup(true, 'AFTERNOON', 60, 500),
    evening: this.categoryGroup(true, 'EVENING', 60, 700),
    night: this.categoryGroup(false, 'NIGHT', 60, 900),
  });

  categoryLabel(key: (typeof CATEGORY_KEYS)[number]): string {
    return this.timeOfDayInfo[TIME_OF_DAY_BY_KEY[key]].label;
  }

  isEnabled(key: (typeof CATEGORY_KEYS)[number]): boolean {
    return this.form.controls[key].controls.enabled.value;
  }

  submit(): void {
    if (this.form.controls.month.invalid || this.form.controls.year.invalid) {
      this.form.controls.month.markAsTouched();
      this.form.controls.year.markAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const enabledCategories = this.categoryKeys
      .map((key) => ({ key, config: raw[key] }))
      .filter(({ config }) => config.enabled);

    if (enabledCategories.length === 0) {
      this.snackBar.open('Enable at least one time-of-day category', 'Dismiss', { duration: 4000 });
      return;
    }

    for (const { key, config } of enabledCategories) {
      if (!config.startTime || !config.endTime) {
        this.snackBar.open(`Enter a start and end time for ${this.categoryLabel(key)}`, 'Dismiss', { duration: 4000 });
        return;
      }
      if (config.endTime <= config.startTime) {
        this.snackBar.open(`${this.categoryLabel(key)}'s end time must be after its start time`, 'Dismiss', {
          duration: 4000,
        });
        return;
      }
      if (!config.intervalMinutes || config.price === null || config.price === undefined || config.price < 0) {
        this.snackBar.open(`Enter a valid interval and price for ${this.categoryLabel(key)}`, 'Dismiss', {
          duration: 4000,
        });
        return;
      }
    }

    const sorted = [...enabledCategories].sort((a, b) => a.config.startTime!.localeCompare(b.config.startTime!));
    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];
      if (current.config.startTime! < previous.config.endTime!) {
        this.snackBar.open(
          `${this.categoryLabel(previous.key)} and ${this.categoryLabel(current.key)} time ranges overlap — each one must start after the previous ends`,
          'Dismiss',
          { duration: 6000 },
        );
        return;
      }
    }

    const withSeconds = (config: BulkSlotCategoryConfig): BulkSlotCategoryConfig => ({
      ...config,
      startTime: config.startTime ? this.withSeconds(config.startTime) : config.startTime,
      endTime: config.endTime ? this.withSeconds(config.endTime) : config.endTime,
    });
    const request: BulkSlotRequest = {
      year: raw.year,
      month: raw.month,
      morning: withSeconds(raw.morning as BulkSlotCategoryConfig),
      afternoon: withSeconds(raw.afternoon as BulkSlotCategoryConfig),
      evening: withSeconds(raw.evening as BulkSlotCategoryConfig),
      night: withSeconds(raw.night as BulkSlotCategoryConfig),
    };
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private withSeconds(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private categoryGroup(enabled: boolean, timeOfDay: TimeOfDay, intervalMinutes: number, price: number) {
    const defaults = TIME_OF_DAY_DEFAULTS[timeOfDay];
    return this.fb.group({
      enabled: this.fb.nonNullable.control(enabled),
      startTime: this.fb.control<string | null>(defaults.startTime),
      endTime: this.fb.control<string | null>(defaults.endTime),
      intervalMinutes: this.fb.control<number | null>(intervalMinutes),
      price: this.fb.control<number | null>(price),
    });
  }

  /** Defaults to next calendar month, since owners generally generate slots ahead of time. */
  private defaultMonth(): { year: number; month: number } {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { year: nextMonth.getFullYear(), month: nextMonth.getMonth() + 1 };
  }

  private buildYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  }
}
