import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { Voucher, VoucherUpsert } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private base = `${API_BASE}/api/admin/v1/vouchers`;
  constructor(private http: HttpClient) {}

  list(): Observable<Voucher[]> {
    return this.http.get<ApiResponse<Voucher[]>>(this.base).pipe(map((r) => r.data));
  }

  get(id: number): Observable<Voucher> {
    return this.http.get<ApiResponse<Voucher>>(`${this.base}/${id}`).pipe(map((r) => r.data));
  }

  create(req: VoucherUpsert): Observable<Voucher> {
    return this.http.post<ApiResponse<Voucher>>(this.base, req).pipe(map((r) => r.data));
  }

  update(id: number, req: VoucherUpsert): Observable<Voucher> {
    return this.http.put<ApiResponse<Voucher>>(`${this.base}/${id}`, req).pipe(map((r) => r.data));
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`);
  }
}
