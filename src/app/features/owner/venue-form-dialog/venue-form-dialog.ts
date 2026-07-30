import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Venue, VenueRequest } from '../../../core/models/venue.model';
import { resolveVenueThumbnailUrl } from '../../../core/utils/asset-url.util';

export interface VenueFormResult {
  request: VenueRequest;
  thumbnailFile: File | null;
}

const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-venue-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './venue-form-dialog.html',
  styleUrl: './venue-form-dialog.scss',
})
export class VenueFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VenueFormDialog>);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly data = inject<Venue | null>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data;
  readonly thumbnailPreviewUrl = signal<string | null>(resolveVenueThumbnailUrl(this.data?.thumbnailFileName));
  private thumbnailFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', [Validators.required]],
    address: [this.data?.address ?? '', [Validators.required]],
    city: [this.data?.city ?? '', [Validators.required]],
    description: [this.data?.description ?? ''],
  });

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.snackBar.open('Please choose a JPEG, PNG, or WEBP image', 'Dismiss', { duration: 4000 });
      input.value = '';
      return;
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      this.snackBar.open('Image is too large — maximum size is 5MB', 'Dismiss', { duration: 4000 });
      input.value = '';
      return;
    }

    this.thumbnailFile = file;
    this.thumbnailPreviewUrl.set(URL.createObjectURL(file));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: VenueRequest = this.form.getRawValue();
    const result: VenueFormResult = { request, thumbnailFile: this.thumbnailFile };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
