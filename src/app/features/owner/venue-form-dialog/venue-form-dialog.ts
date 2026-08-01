import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ToastService } from '../../../core/services/toast.service';
import { Venue, VenueRequest } from '../../../core/models/venue.model';

export interface VenueFormResult {
  request: VenueRequest;
  thumbnailFile: File | null;
}

const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const VENUE_CITIES = [
  'Ahmedabad',
  'Bangalore',
  'Chennai',
  'Delhi',
  'Indore',
  'Kanpur',
  'Mumbai',
  'Nashik',
  'Pune',
  'Surat',
  'Vadodara',
];

@Component({
  selector: 'app-venue-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './venue-form-dialog.html',
  styleUrl: './venue-form-dialog.scss',
})
export class VenueFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DialogRef<VenueFormResult | undefined, VenueFormDialog>);
  private readonly snackBar = inject(ToastService);
  protected readonly data = inject<Venue | null>(DIALOG_DATA);

  readonly isEdit = !!this.data;
  readonly thumbnailPreviewUrl = signal<string | null>(this.data?.thumbnailUrl ?? null);
  private thumbnailFile: File | null = null;

  // Preserve an existing venue's city even if it predates this fixed list, so editing
  // doesn't silently swap it out for the first dropdown option — inserted in sorted order.
  readonly cities =
    this.data?.city && !VENUE_CITIES.includes(this.data.city)
      ? [...VENUE_CITIES, this.data.city].sort((a, b) => a.localeCompare(b))
      : VENUE_CITIES;

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
