import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Venue, VenueRequest, VenueStatus, VenueStatusUpdateRequest } from '../models/venue.model';

@Injectable({ providedIn: 'root' })
export class VenueService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/venues`;

  create(request: VenueRequest): Observable<Venue> {
    return this.http.post<Venue>(this.apiUrl, request);
  }

  listMine(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.apiUrl}/mine`);
  }

  getMine(id: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/${id}`);
  }

  update(id: number, request: VenueRequest): Observable<Venue> {
    return this.http.put<Venue>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listAll(status?: VenueStatus): Observable<Venue[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Venue[]>(this.apiUrl, { params });
  }

  updateStatus(id: number, request: VenueStatusUpdateRequest): Observable<Venue> {
    return this.http.patch<Venue>(`${this.apiUrl}/${id}/status`, request);
  }

  listPublic(city?: string): Observable<Venue[]> {
    let params = new HttpParams();
    if (city) {
      params = params.set('city', city);
    }
    return this.http.get<Venue[]>(`${this.apiUrl}/public`, { params });
  }

  uploadThumbnail(id: number, file: File): Observable<Venue> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Venue>(`${this.apiUrl}/${id}/thumbnail`, formData);
  }
}
