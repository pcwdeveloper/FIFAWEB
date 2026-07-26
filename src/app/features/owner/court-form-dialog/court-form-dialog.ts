import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Court, CourtRequest } from '../../../core/models/court.model';
import { Sport } from '../../../core/models/sport.model';

export interface CourtFormDialogData {
  court: Court | null;
  sports: Sport[];
}

@Component({
  selector: 'app-court-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './court-form-dialog.html',
  styleUrl: './court-form-dialog.scss',
})
export class CourtFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CourtFormDialog>);
  protected readonly data = inject<CourtFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.court;
  readonly sports = this.data.sports;

  readonly form = this.fb.nonNullable.group({
    name: [this.data.court?.name ?? '', [Validators.required]],
    sportId: [this.data.court?.sportId ?? null as number | null, [Validators.required]],
    pricePerSlot: [this.data.court?.pricePerSlot ?? null as number | null, [Validators.required, Validators.min(0)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: CourtRequest = {
      name: raw.name,
      sportId: raw.sportId!,
      pricePerSlot: raw.pricePerSlot!,
    };
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
