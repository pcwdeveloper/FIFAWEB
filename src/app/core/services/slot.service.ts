import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BulkSlotCreateResponse, BulkSlotRequest, Slot, SlotRequest, SlotStatusUpdateRequest } from '../models/slot.model';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  listByCourtForOwner(courtId: number): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.apiUrl}/courts/${courtId}/slots`);
  }

  create(courtId: number, request: SlotRequest): Observable<Slot> {
    return this.http.post<Slot>(`${this.apiUrl}/courts/${courtId}/slots`, request);
  }

  createBulk(courtId: number, request: BulkSlotRequest): Observable<BulkSlotCreateResponse> {
    return this.http.post<BulkSlotCreateResponse>(`${this.apiUrl}/courts/${courtId}/slots/bulk`, request);
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
