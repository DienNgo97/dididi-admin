import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { AdminReport } from '../core/admin-report-models';

@Injectable({ providedIn: 'root' })
export class AdminReportService {
  private base = `${API_BASE}/api/admin/v1/reports`;
  constructor(private http: HttpClient) {}

  /** metric: HOTEL_REVENUE | FLIGHT_REVENUE | COMMISSION (chỉ SUPER_ADMIN) | NEW_USERS | NEW_VENDORS
   *  granularity: WEEK | MONTH | QUARTER | YEAR */
  report(metric: string, granularity: string): Observable<AdminReport> {
    const params = new HttpParams().set('metric', metric).set('granularity', granularity);
    return this.http.get<ApiResponse<AdminReport>>(this.base, { params }).pipe(map((r) => r.data));
  }
}
