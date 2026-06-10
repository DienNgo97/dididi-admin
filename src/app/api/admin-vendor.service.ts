import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { VendorAccount } from '../core/vendor-models';

export interface CreateVendorReq {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  hotelName: string;
  city?: string;
  address?: string;
  starRating?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminVendorService {
  private base = `${API_BASE}/api/admin/v1/vendors`;
  constructor(private http: HttpClient) {}

  list(): Observable<VendorAccount[]> {
    return this.http.get<ApiResponse<VendorAccount[]>>(this.base).pipe(map((r) => r.data));
  }

  pending(): Observable<VendorAccount[]> {
    return this.http.get<ApiResponse<VendorAccount[]>>(`${this.base}/pending`).pipe(map((r) => r.data));
  }

  approve(userId: number): Observable<VendorAccount> {
    return this.http.post<ApiResponse<VendorAccount>>(`${this.base}/${userId}/approve`, {}).pipe(map((r) => r.data));
  }

  reject(userId: number): Observable<VendorAccount> {
    return this.http.post<ApiResponse<VendorAccount>>(`${this.base}/${userId}/reject`, {}).pipe(map((r) => r.data));
  }

  ban(userId: number, reason?: string): Observable<VendorAccount> {
    return this.http
      .post<ApiResponse<VendorAccount>>(`${this.base}/${userId}/ban`, { reason: reason || '' })
      .pipe(map((r) => r.data));
  }

  unban(userId: number): Observable<VendorAccount> {
    return this.http.post<ApiResponse<VendorAccount>>(`${this.base}/${userId}/unban`, {}).pipe(map((r) => r.data));
  }

  create(req: CreateVendorReq): Observable<VendorAccount> {
    return this.http.post<ApiResponse<VendorAccount>>(this.base, req).pipe(map((r) => r.data));
  }
}
