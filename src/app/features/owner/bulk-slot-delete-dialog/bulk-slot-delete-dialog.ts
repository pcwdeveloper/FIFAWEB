import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/services/toast.service';
import { BulkSlotDeleteRequest, TIME_OF_DAY_INFO, TimeOfDay } from '../../../core/models/slot.model';

const CATEGORY_KEYS: TimeOfDay[] = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-bulk-slot-delete-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './bulk-slot-delete-dialog.html',
  styleUrl: './bulk-slot-delete-dialog.scss',
})
export class BulkSlotDeleteDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DialogRef<BulkSlotDeleteRequest | undefined, BulkSlotDeleteDialog>);
  private readonly snackBar = inject(ToastService);

  readonly categoryKeys = CATEGORY_KEYS;
  readonly monthNames = MONTH_NAMES;
  readonly yearOptions = this.buildYearOptions();
  readonly timeOfDayInfo = TIME_OF_DAY_INFO;

  readonly form = this.fb.group({
    month: this.fb.nonNullable.control(new Date().getMonth() + 1, [Validators.required]),
    year: this.fb.nonNullable.control(new Date().getFullYear(), [Validators.required]),
    MORNING: this.fb.nonNullable.control(false),
    AFTERNOON: this.fb.nonNullable.control(false),
    EVENING: this.fb.nonNullable.control(false),
    NIGHT: this.fb.nonNullable.control(false),
  });

  categoryLabel(key: TimeOfDay): string {
    return this.timeOfDayInfo[key].label;
  }

  submit(): void {
    const raw = this.form.getRawValue();
    const categories = this.categoryKeys.filter((key) => raw[key]);

    if (categories.length === 0) {
      this.snackBar.open('Select at least one time-of-day category to delete', 'Dismiss', { duration: 4000 });
      return;
    }

    const request: BulkSlotDeleteRequest = {
      year: raw.year,
      month: raw.month,
      categories,
    };
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private buildYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  }
}
