import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BulkSlotBlockRequest,
  BulkSlotBlockResponse,
  BulkSlotCreateResponse,
  BulkSlotDeleteRequest,
  BulkSlotDeleteResponse,
  BulkSlotRequest,
  Slot,
  SlotStatusUpdateRequest,
} from '../models/slot.model';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  listByCourtForOwner(courtId: number): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.apiUrl}/courts/${courtId}/slots`);
  }

  createBulk(courtId: number, request: BulkSlotRequest): Observable<BulkSlotCreateResponse> {
    return this.http.post<BulkSlotCreateResponse>(`${this.apiUrl}/courts/${courtId}/slots/bulk`, request);
  }

  deleteBulk(courtId: number, request: BulkSlotDeleteRequest): Observable<BulkSlotDeleteResponse> {
    return this.http.post<BulkSlotDeleteResponse>(`${this.apiUrl}/courts/${courtId}/slots/bulk-delete`, request);
  }

  blockBulk(courtId: number, request: BulkSlotBlockRequest): Observable<BulkSlotBlockResponse> {
    return this.http.post<BulkSlotBlockResponse>(`${this.apiUrl}/courts/${courtId}/slots/bulk-block`, request);
  }

  listAvailablePublic(courtId: number, date: string): Observable<Slot[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Slot[]>(`${this.apiUrl}/courts/${courtId}/slots/public`, { params });
  }

  updateStatus(slotId: number, request: SlotStatusUpdateRequest): Observable<Slot> {
    return this.http.patch<Slot>(`${this.apiUrl}/slots/${slotId}/status`, request);
  }

  delete(slotId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/slots/${slotId}`);
  }
}
