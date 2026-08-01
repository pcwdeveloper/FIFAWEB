import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Court, CourtRequest } from '../../../core/models/court.model';
import { Sport } from '../../../core/models/sport.model';
import { sportIcon } from '../../../core/utils/sport-icon.util';

export interface CourtFormDialogData {
  court: Court | null;
  sport: Sport;
}

@Component({
  selector: 'app-court-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './court-form-dialog.html',
  styleUrl: './court-form-dialog.scss',
})
export class CourtFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DialogRef<CourtRequest | undefined, CourtFormDialog>);
  protected readonly data = inject<CourtFormDialogData>(DIALOG_DATA);

  readonly isEdit = !!this.data.court;
  readonly sport = this.data.sport;
  readonly sportIconName = sportIcon(this.data.sport.name);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.court?.name ?? '', [Validators.required]],
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
      sportId: this.sport.id,
      pricePerSlot: raw.pricePerSlot!,
    };
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
