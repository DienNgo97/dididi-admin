import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { DashboardStats } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = `${API_BASE}/api/admin/v1/dashboard`;
  constructor(private http: HttpClient) {}

  stats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.base}/stats`).pipe(map((r) => r.data));
  }
}
