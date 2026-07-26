import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Venue, VenueRequest } from '../../../core/models/venue.model';

@Component({
  selector: 'app-venue-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './venue-form-dialog.html',
  styleUrl: './venue-form-dialog.scss',
})
export class VenueFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VenueFormDialog>);
  protected readonly data = inject<Venue | null>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data;

  readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', [Validators.required]],
    address: [this.data?.address ?? '', [Validators.required]],
    city: [this.data?.city ?? '', [Validators.required]],
    description: [this.data?.description ?? ''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: VenueRequest = this.form.getRawValue();
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
