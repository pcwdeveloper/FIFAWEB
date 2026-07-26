import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Court, CourtRequest } from '../models/court.model';

@Injectable({ providedIn: 'root' })
export class CourtService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  listByVenue(venueId: number): Observable<Court[]> {
    return this.http.get<Court[]>(`${this.apiUrl}/venues/${venueId}/courts`);
  }

  create(venueId: number, request: CourtRequest): Observable<Court> {
    return this.http.post<Court>(`${this.apiUrl}/venues/${venueId}/courts`, request);
  }

  update(courtId: number, request: CourtRequest): Observable<Court> {
    return this.http.put<Court>(`${this.apiUrl}/courts/${courtId}`, request);
  }

  delete(courtId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courts/${courtId}`);
  }

  listPublicByVenue(venueId: number): Observable<Court[]> {
    return this.http.get<Court[]>(`${this.apiUrl}/venues/${venueId}/courts/public`);
  }
}
