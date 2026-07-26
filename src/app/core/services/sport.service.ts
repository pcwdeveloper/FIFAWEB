import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sport, SportRequest } from '../models/sport.model';

@Injectable({ providedIn: 'root' })
export class SportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/sports`;

  list(): Observable<Sport[]> {
    return this.http.get<Sport[]>(this.apiUrl);
  }

  create(request: SportRequest): Observable<Sport> {
    return this.http.post<Sport>(this.apiUrl, request);
  }

  update(id: number, request: SportRequest): Observable<Sport> {
    return this.http.put<Sport>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
