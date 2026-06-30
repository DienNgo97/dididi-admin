import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { Company, CompanyUpsert, CompanyEmployee, CompanyBooking, CompanyInvite } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private base = `${API_BASE}/api/admin/v1/companies`;
  constructor(private http: HttpClient) {}

  list(): Observable<Company[]> {
    return this.http.get<ApiResponse<Company[]>>(this.base).pipe(map((r) => r.data));
  }

  get(id: number): Observable<Company> {
    return this.http.get<ApiResponse<Company>>(`${this.base}/${id}`).pipe(map((r) => r.data));
  }

  create(req: CompanyUpsert): Observable<Company> {
    return this.http.post<ApiResponse<Company>>(this.base, req).pipe(map((r) => r.data));
  }

  update(id: number, req: CompanyUpsert): Observable<Company> {
    return this.http.put<ApiResponse<Company>>(`${this.base}/${id}`, req).pipe(map((r) => r.data));
  }

  topup(id: number, amount: number): Observable<Company> {
    const params = new HttpParams().set('amount', amount);
    return this.http
      .post<ApiResponse<Company>>(`${this.base}/${id}/topup`, {}, { params })
      .pipe(map((r) => r.data));
  }

  employees(id: number): Observable<CompanyEmployee[]> {
    return this.http.get<ApiResponse<CompanyEmployee[]>>(`${this.base}/${id}/employees`).pipe(map((r) => r.data));
  }

  assign(id: number, userId: number): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.base}/${id}/employees/${userId}`, {})
      .pipe(map((r) => { if (!r.success) { throw new Error(r.message || 'Gán nhân viên thất bại'); } return r.data; }));
  }

  unassign(id: number, userId: number): Observable<unknown> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.base}/${id}/employees/${userId}`)
      .pipe(map((r) => { if (!r.success) { throw new Error(r.message || 'Gỡ nhân viên thất bại'); } return r.data; }));
  }

  bookings(id: number): Observable<CompanyBooking[]> {
    return this.http.get<ApiResponse<CompanyBooking[]>>(`${this.base}/${id}/bookings`).pipe(map((r) => r.data));
  }

  /** Tải hóa đơn VAT (PDF) theo mã đơn — trả Blob (AuthInterceptor tự đính Bearer). */
  invoice(code: string): Observable<Blob> {
    return this.http.get(`${API_BASE}/api/admin/v1/invoices/${code}`, { responseType: 'blob' });
  }

  // ---- Lời mời booker (B2B) ----
  invites(id: number): Observable<CompanyInvite[]> {
    return this.http.get<ApiResponse<CompanyInvite[]>>(`${this.base}/${id}/invites`).pipe(map((r) => r.data));
  }

  invite(id: number, email: string): Observable<CompanyInvite> {
    return this.http.post<ApiResponse<CompanyInvite>>(`${this.base}/${id}/invites`, { email }).pipe(map((r) => r.data));
  }

  revokeInvite(id: number, inviteId: number): Observable<unknown> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.base}/${id}/invites/${inviteId}`)
      .pipe(map((r) => { if (!r.success) { throw new Error(r.message || 'Thu hồi lời mời thất bại'); } return r.data; }));
  }
}
