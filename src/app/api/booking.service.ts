import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { AdminBooking, PagedResponse, Refund } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private base = `${API_BASE}/api/admin/v1/bookings`;
  constructor(private http: HttpClient) {}

  list(page = 0, size = 20, status?: string, cancelStatus?: string): Observable<PagedResponse<AdminBooking>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    if (cancelStatus) { params = params.set('cancelStatus', cancelStatus); }
    return this.http
      .get<ApiResponse<PagedResponse<AdminBooking>>>(this.base, { params })
      .pipe(map((r) => r.data));
  }

  cancel(id: number): Observable<AdminBooking> {
    return this.http
      .post<ApiResponse<AdminBooking>>(`${this.base}/${id}/cancel`, {})
      .pipe(map((r) => r.data));
  }

  refund(id: number, reason?: string): Observable<AdminBooking> {
    return this.http
      .post<ApiResponse<AdminBooking>>(`${this.base}/${id}/refund`, { reason: reason || '' })
      .pipe(map((r) => r.data));
  }

  approveCancel(id: number, reason: string): Observable<AdminBooking> {
    return this.http
      .post<ApiResponse<AdminBooking>>(`${this.base}/${id}/cancel-request/approve`, { reason })
      .pipe(map((r) => r.data));
  }

  rejectCancel(id: number, reason: string): Observable<AdminBooking> {
    return this.http
      .post<ApiResponse<AdminBooking>>(`${this.base}/${id}/cancel-request/reject`, { reason })
      .pipe(map((r) => r.data));
  }

  refundHistory(): Observable<Refund[]> {
    return this.http
      .get<ApiResponse<Refund[]>>(`${this.base}/refunds`)
      .pipe(map((r) => r.data));
  }
}
