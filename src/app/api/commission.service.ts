import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { CommissionConfig, VendorCommission, CommissionReport } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class CommissionService {
  private base = `${API_BASE}/api/admin/v1/commission`;
  constructor(private http: HttpClient) {}

  config(): Observable<CommissionConfig> {
    return this.http.get<ApiResponse<CommissionConfig>>(`${this.base}/config`).pipe(map((r) => r.data));
  }

  setConfig(rate: number): Observable<CommissionConfig> {
    const params = new HttpParams().set('rate', rate);
    return this.http.put<ApiResponse<CommissionConfig>>(`${this.base}/config`, {}, { params }).pipe(map((r) => r.data));
  }

  vendors(): Observable<VendorCommission[]> {
    return this.http.get<ApiResponse<VendorCommission[]>>(`${this.base}/vendors`).pipe(map((r) => r.data));
  }

  setVendor(vendorId: number, rate: number): Observable<unknown> {
    const params = new HttpParams().set('rate', rate);
    return this.http
      .put<ApiResponse<unknown>>(`${this.base}/vendors/${vendorId}`, {}, { params })
      .pipe(map((r) => { if (!r.success) { throw new Error(r.message || 'Đặt hoa hồng vendor thất bại'); } return r.data; }));
  }

  removeVendor(vendorId: number): Observable<unknown> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.base}/vendors/${vendorId}`)
      .pipe(map((r) => { if (!r.success) { throw new Error(r.message || 'Gỡ hoa hồng vendor thất bại'); } return r.data; }));
  }

  report(): Observable<CommissionReport> {
    return this.http.get<ApiResponse<CommissionReport>>(`${this.base}/report`).pipe(map((r) => r.data));
  }
}
