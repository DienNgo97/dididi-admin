import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { RevenueReport, InventoryReport, VendorDashboard } from '../core/vendor-report-models';

@Injectable({ providedIn: 'root' })
export class VendorReportService {
  private base = `${API_BASE}/api/vendor/v1/reports`;
  constructor(private http: HttpClient) {}

  revenue(granularity: string): Observable<RevenueReport> {
    const params = new HttpParams().set('granularity', granularity);
    return this.http
      .get<ApiResponse<RevenueReport>>(`${this.base}/revenue`, { params })
      .pipe(map((r) => r.data));
  }

  inventory(from?: string, to?: string): Observable<InventoryReport> {
    let params = new HttpParams();
    if (from) { params = params.set('from', from); }
    if (to) { params = params.set('to', to); }
    return this.http
      .get<ApiResponse<InventoryReport>>(`${this.base}/inventory`, { params })
      .pipe(map((r) => r.data));
  }

  dashboard(): Observable<VendorDashboard> {
    return this.http
      .get<ApiResponse<VendorDashboard>>(`${this.base}/dashboard`)
      .pipe(map((r) => r.data));
  }
}
