import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/services/toast.service';
import { BulkSlotBlockRequest } from '../../../core/models/slot.model';

const INTERVAL_OPTIONS = [30, 60];
const MINUTES_PER_DAY = 24 * 60;

interface TimeOption {
  value: string;
  label: string;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-bulk-slot-block-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './bulk-slot-block-dialog.html',
  styleUrl: './bulk-slot-block-dialog.scss',
})
export class BulkSlotBlockDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DialogRef<BulkSlotBlockRequest | undefined, BulkSlotBlockDialog>);
  private readonly snackBar = inject(ToastService);

  readonly intervalOptions = INTERVAL_OPTIONS;

  readonly form = this.fb.group({
    startDate: this.fb.nonNullable.control(toIsoDate(new Date()), [Validators.required]),
    endDate: this.fb.nonNullable.control(toIsoDate(this.addDays(new Date(), 7)), [Validators.required]),
    intervalMinutes: this.fb.nonNullable.control(60, [Validators.required]),
    startTime: this.fb.control<string | null>('00:00'),
    endTime: this.fb.control<string | null>('23:59'),
  });

  readonly timeOptions = signal(this.buildTimeOptions(60));

  constructor() {
    this.form.controls.intervalMinutes.valueChanges.subscribe((minutes) => {
      this.timeOptions.set(this.buildTimeOptions(minutes));
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.endDate < raw.startDate) {
      this.snackBar.open('End date must not be before start date', 'Dismiss', { duration: 4000 });
      return;
    }
    if (!raw.startTime || !raw.endTime) {
      this.snackBar.open('Select a start and end time', 'Dismiss', { duration: 4000 });
      return;
    }
    if (raw.endTime <= raw.startTime) {
      this.snackBar.open('End time must be after start time', 'Dismiss', { duration: 4000 });
      return;
    }

    const request: BulkSlotBlockRequest = {
      startDate: raw.startDate,
      endDate: raw.endDate,
      startTime: this.appendSeconds(raw.startTime),
      endTime: this.appendSeconds(raw.endTime),
    };
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private appendSeconds(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  /** Time choices aligned to the chosen interval, e.g. 30 min -> 00:00, 00:30, 01:00, ...
   *  Includes a final "24:00" entry (stored as 23:59) so the range can reach the end of the day. */
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
}
