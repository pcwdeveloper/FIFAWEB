import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SlotRequest } from '../../../core/models/slot.model';

@Component({
  selector: 'app-slot-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './slot-form-dialog.html',
  styleUrl: './slot-form-dialog.scss',
})
export class SlotFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SlotFormDialog>);

  readonly form = this.fb.nonNullable.group({
    date: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: SlotRequest = {
      date: raw.date,
      startTime: this.withSeconds(raw.startTime),
      endTime: this.withSeconds(raw.endTime),
    };
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private withSeconds(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }
}
