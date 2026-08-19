import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { AdminFlight, PagedResponse } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private base = `${API_BASE}/api/admin/v1/flights`;
  constructor(private http: HttpClient) {}

  list(page = 0, size = 20, q?: string): Observable<PagedResponse<AdminFlight>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) { params = params.set('q', q); }
    return this.http
      .get<ApiResponse<PagedResponse<AdminFlight>>>(this.base, { params })
      .pipe(map((r) => r.data));
  }
}
