import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
type CategoryKey = (typeof CATEGORY_KEYS)[number];

const TIME_OF_DAY_BY_KEY: Record<CategoryKey, TimeOfDay> = {
  morning: 'MORNING',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
  night: 'NIGHT',
};

const INTERVAL_OPTIONS = [30, 60];
const MINUTES_PER_DAY = 24 * 60;

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

interface TimeOption {
  value: string;
  label: string;
}

interface MinuteRange {
  start: number;
  end: number;
}

/** Each category is hard-locked to its own conventional window — e.g. Morning can never
 *  offer a time past 12:00, even if Afternoon is disabled and that time is otherwise free. */
const CATEGORY_WINDOWS: Record<CategoryKey, MinuteRange> = {
  morning: { start: 0, end: 12 * 60 },
  afternoon: { start: 12 * 60, end: 17 * 60 },
  evening: { start: 17 * 60, end: 21 * 60 },
  night: { start: 21 * 60, end: 24 * 60 },
};

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
    MatIconModule,
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
    intervalMinutes: this.fb.nonNullable.control(60, [Validators.required]),
    morning: this.categoryGroup(true, 'MORNING', 500),
    afternoon: this.categoryGroup(true, 'AFTERNOON', 500),
    evening: this.categoryGroup(true, 'EVENING', 700),
    night: this.categoryGroup(false, 'NIGHT', 900),
  });

  // Each category's Start/End dropdowns only ever offer times that don't conflict with the
  // OTHER enabled categories' current ranges — recomputed on every form change so picking a
  // conflicting time simply isn't possible through the dropdown.
  readonly startOptionsByKey = signal<Record<CategoryKey, TimeOption[]>>(this.emptyOptionsMap());
  readonly endOptionsByKey = signal<Record<CategoryKey, TimeOption[]>>(this.emptyOptionsMap());

  constructor() {
    this.form.valueChanges.subscribe(() => this.recomputeOptions());
    this.recomputeOptions();
  }

  categoryLabel(key: CategoryKey): string {
    return this.timeOfDayInfo[TIME_OF_DAY_BY_KEY[key]].label;
  }

  categoryIcon(key: CategoryKey): string {
    return this.timeOfDayInfo[TIME_OF_DAY_BY_KEY[key]].icon;
  }

  isEnabled(key: CategoryKey): boolean {
    return this.form.controls[key].controls.enabled.value;
  }

  submit(): void {
    if (this.form.controls.month.invalid || this.form.controls.year.invalid || this.form.controls.intervalMinutes.invalid) {
      this.form.controls.month.markAsTouched();
      this.form.controls.year.markAsTouched();
      this.form.controls.intervalMinutes.markAsTouched();
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
      if (config.price === null || config.price === undefined || config.price < 0) {
        this.snackBar.open(`Enter a valid price for ${this.categoryLabel(key)}`, 'Dismiss', {
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
      startTime: config.startTime ? this.appendSeconds(config.startTime) : config.startTime,
      endTime: config.endTime ? this.appendSeconds(config.endTime) : config.endTime,
    });
    const request: BulkSlotRequest = {
      year: raw.year,
      month: raw.month,
      intervalMinutes: raw.intervalMinutes,
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

  private appendSeconds(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private categoryGroup(enabled: boolean, timeOfDay: TimeOfDay, price: number) {
    const defaults = TIME_OF_DAY_DEFAULTS[timeOfDay];
    return this.fb.group({
      enabled: this.fb.nonNullable.control(enabled),
      startTime: this.fb.control<string | null>(defaults.startTime),
      endTime: this.fb.control<string | null>(defaults.endTime),
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

  /** Time choices aligned to the chosen interval, e.g. 30 min -> 00:00, 00:30, 01:00, ...
   *  Includes a final "24:00" entry (stored as 23:59) so a range can reach the end of the day. */
  private buildTimeOptions(intervalMinutes: number): TimeOption[] {
    const options: TimeOption[] = [];
    for (let minutes = 0; minutes < MINUTES_PER_DAY; minutes += intervalMinutes) {
      const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
      const mm = String(minutes % 60).padStart(2, '0');
      options.push({ value: `${hh}:${mm}`, label: `${hh}:${mm}` });
    }
    options.push({ value: '23:59', label: '24:00' });
    return options;
  }

  private parseMinutes(value: string): number {
    if (value === '23:59') return MINUTES_PER_DAY;
    const [hh, mm] = value.split(':').map(Number);
    return hh * 60 + mm;
  }

  /** Complement of the given occupied ranges across a full day, i.e. the time left over
   *  that another category is still free to use. */
  private freeGaps(occupied: MinuteRange[]): MinuteRange[] {
    const sorted = [...occupied].sort((a, b) => a.start - b.start);
    const gaps: MinuteRange[] = [];
    let cursor = 0;
    for (const range of sorted) {
      if (range.start > cursor) {
        gaps.push({ start: cursor, end: range.start });
      }
      cursor = Math.max(cursor, range.end);
    }
    if (cursor < MINUTES_PER_DAY) {
      gaps.push({ start: cursor, end: MINUTES_PER_DAY });
    }
    return gaps;
  }

  private intersect(a: MinuteRange, b: MinuteRange): MinuteRange | null {
    const start = Math.max(a.start, b.start);
    const end = Math.min(a.end, b.end);
    return start < end ? { start, end } : null;
  }

  private emptyOptionsMap(): Record<CategoryKey, TimeOption[]> {
    return { morning: [], afternoon: [], evening: [], night: [] };
  }

  private recomputeOptions(): void {
    const raw = this.form.getRawValue();
    const allOptions = this.buildTimeOptions(raw.intervalMinutes);

    const rangeByKey = new Map<CategoryKey, MinuteRange | null>();
    for (const key of this.categoryKeys) {
      const cfg = raw[key];
      rangeByKey.set(
        key,
        cfg.enabled && cfg.startTime && cfg.endTime
          ? { start: this.parseMinutes(cfg.startTime), end: this.parseMinutes(cfg.endTime) }
          : null,
      );
    }

    const newStart = this.emptyOptionsMap();
    const newEnd = this.emptyOptionsMap();

    for (const key of this.categoryKeys) {
      const others = this.categoryKeys
        .filter((other) => other !== key)
        .map((other) => rangeByKey.get(other))
        .filter((range): range is MinuteRange => range !== null);
      const gaps = this.freeGaps(others)
        .map((gap) => this.intersect(gap, CATEGORY_WINDOWS[key]))
        .filter((range): range is MinuteRange => range !== null);

      newStart[key] = allOptions.filter((option) => {
        const minutes = this.parseMinutes(option.value);
        return gaps.some((gap) => minutes >= gap.start && minutes < gap.end);
      });

      const startValue = raw[key].startTime;
      if (startValue) {
        const startMinutes = this.parseMinutes(startValue);
        const gap = gaps.find((g) => startMinutes >= g.start && startMinutes < g.end);
        newEnd[key] = gap
          ? allOptions.filter((option) => {
              const minutes = this.parseMinutes(option.value);
              return minutes > startMinutes && minutes <= gap.end;
            })
          : allOptions;
      } else {
        newEnd[key] = allOptions;
      }
    }

    this.startOptionsByKey.set(newStart);
    this.endOptionsByKey.set(newEnd);
  }
}
