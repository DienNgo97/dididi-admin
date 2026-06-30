import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { AdminReview, PagedResponse } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private adminBase = `${API_BASE}/api/admin/v1/reviews`;
  private vendorBase = `${API_BASE}/api/vendor/v1/reviews`;
  constructor(private http: HttpClient) {}

  // ---- Admin kiểm duyệt ----
  adminList(page = 0, size = 20, status?: string): Observable<PagedResponse<AdminReview>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    return this.http
      .get<ApiResponse<PagedResponse<AdminReview>>>(this.adminBase, { params })
      .pipe(map((r) => r.data));
  }

  publish(id: number): Observable<AdminReview> {
    return this.http
      .post<ApiResponse<AdminReview>>(`${this.adminBase}/${id}/publish`, {})
      .pipe(map((r) => r.data));
  }

  hide(id: number): Observable<AdminReview> {
    return this.http
      .post<ApiResponse<AdminReview>>(`${this.adminBase}/${id}/hide`, {})
      .pipe(map((r) => r.data));
  }

  remove(id: number): Observable<void> {
    // Backend co the tra 204 No Content (body rong) -> dung delete<void>, khong unwrap r.data.
    return this.http.delete<void>(`${this.adminBase}/${id}`);
  }

  // ---- Vendor trả lời ----
  vendorList(page = 0, size = 20): Observable<PagedResponse<AdminReview>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PagedResponse<AdminReview>>>(this.vendorBase, { params })
      .pipe(map((r) => r.data));
  }

  reply(id: number, text: string, files?: File[]): Observable<unknown> {
    const fd = new FormData();
    fd.append('reply', text);
    (files || []).forEach((f) => fd.append('images', f));
    return this.http
      .post<ApiResponse<unknown>>(`${this.vendorBase}/${id}/reply`, fd)
      .pipe(map((r) => r.data));
  }
}
