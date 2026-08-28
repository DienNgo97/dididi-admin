import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { SettlementPeriodView } from '../core/settlement-models';

/** Đối soát công nợ B2B đối tác API (ST4). */
@Injectable({ providedIn: 'root' })
export class SettlementService {
  private base = `${API_BASE}/api/admin/v1/settlements`;

  constructor(private http: HttpClient) {}

  view(period: string): Observable<SettlementPeriodView> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<ApiResponse<SettlementPeriodView>>(this.base, { params })
      .pipe(map((r) => r.data));
  }

  close(partnerCode: string, period: string): Observable<SettlementPeriodView> {
    const params = new HttpParams().set('period', period);
    return this.http
      .post<ApiResponse<SettlementPeriodView>>(`${this.base}/${partnerCode}/close`, null, { params })
      .pipe(map((r) => r.data));
  }

  paid(partnerCode: string, period: string, paymentRef: string): Observable<SettlementPeriodView> {
    const params = new HttpParams().set('period', period);
    return this.http
      .post<ApiResponse<SettlementPeriodView>>(`${this.base}/${partnerCode}/paid`, { paymentRef }, { params })
      .pipe(map((r) => r.data));
  }

  /** URL tải file CSV (mở qua fetch + blob vì cần header Authorization). */
  exportUrl(partnerCode: string, period: string): string {
    return `${this.base}/${partnerCode}/export?period=${encodeURIComponent(period)}`;
  }
}
