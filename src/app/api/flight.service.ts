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

  list(page = 0, size = 20): Observable<PagedResponse<AdminFlight>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PagedResponse<AdminFlight>>>(this.base, { params })
      .pipe(map((r) => r.data));
  }
}
