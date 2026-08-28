import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { PagedResponse } from '../core/admin-models';
import { WalletSummary, LedgerEntry, Payout } from '../core/wallet-models';

/** Ví doanh thu vendor + giám sát rút tiền phía admin (VW6). */
@Injectable({ providedIn: 'root' })
export class WalletService {
  private base = `${API_BASE}/api/vendor/v1/wallet`;
  private adminBase = `${API_BASE}/api/admin/v1/payouts`;

  constructor(private http: HttpClient) {}

  summary(): Observable<WalletSummary> {
    return this.http.get<ApiResponse<WalletSummary>>(this.base).pipe(map((r) => r.data));
  }

  ledger(page = 0, size = 20): Observable<PagedResponse<LedgerEntry>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PagedResponse<LedgerEntry>>>(`${this.base}/ledger`, { params })
      .pipe(map((r) => r.data));
  }

  payouts(page = 0, size = 20): Observable<PagedResponse<Payout>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PagedResponse<Payout>>>(`${this.base}/payouts`, { params })
      .pipe(map((r) => r.data));
  }

  requestPayout(amount: number): Observable<Payout> {
    return this.http
      .post<ApiResponse<Payout>>(`${this.base}/payouts`, { amount })
      .pipe(map((r) => r.data));
  }

  cancelPayout(id: number): Observable<Payout> {
    return this.http
      .delete<ApiResponse<Payout>>(`${this.base}/payouts/${id}`)
      .pipe(map((r) => r.data));
  }

  updateBank(bankName: string, accountNo: string, holder: string): Observable<WalletSummary> {
    return this.http
      .put<ApiResponse<WalletSummary>>(`${this.base}/bank-account`, { bankName, accountNo, holder })
      .pipe(map((r) => r.data));
  }

  // ---- Admin ----
  /** Admin ghi nhận đã chuyển khoản cho vendor (chi tay ngoài hệ thống). */
  adminMarkPaid(id: number, transactionRef: string): Observable<Payout> {
    return this.http
      .post<ApiResponse<Payout>>(`${this.adminBase}/${id}/paid`, { transactionRef })
      .pipe(map((r) => r.data));
  }

  /** Admin từ chối — tiền nhả về số dư khả dụng của vendor. */
  adminMarkFailed(id: number, reason: string): Observable<Payout> {
    return this.http
      .post<ApiResponse<Payout>>(`${this.adminBase}/${id}/failed`, { reason })
      .pipe(map((r) => r.data));
  }

  adminList(page = 0, size = 20, status?: string): Observable<PagedResponse<Payout>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    return this.http
      .get<ApiResponse<PagedResponse<Payout>>>(this.adminBase, { params })
      .pipe(map((r) => r.data));
  }
}
