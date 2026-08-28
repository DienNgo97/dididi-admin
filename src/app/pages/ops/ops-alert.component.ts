import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE } from '../../core/api.config';
import { ApiResponse } from '../../core/models';
import { PagedResponse } from '../../core/admin-models';

/** Cảnh báo vận hành: việc hệ thống tự phát hiện và cần người xử lý (P0-3/P0-4). */
export interface OpsAlert {
  id: number;
  type: 'PAYMENT_BOOKING_MISMATCH' | 'FLIGHT_SEAT_UNCONFIRMED';
  severity: 'CRITICAL' | 'WARNING';
  status: 'OPEN' | 'RESOLVED';
  bookingId?: number | null;
  bookingCode?: string | null;
  detail: string;
  suggestedAction?: string | null;
  createdAt?: string;
  resolvedAt?: string | null;
  resolveNote?: string | null;
}

@Component({
  selector: 'app-ops-alert',
  templateUrl: './ops-alert.component.html'
})
export class OpsAlertComponent implements OnInit {
  private base = `${API_BASE}/api/admin/v1/ops/alerts`;

  data?: PagedResponse<OpsAlert>;
  page = 0;
  status = '';
  loading = false;
  error = '';
  msg = '';

  resolvingId = 0;
  note = '';
  busy = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    let params = new HttpParams().set('page', this.page).set('size', 20);
    if (this.status) { params = params.set('status', this.status); }
    this.http.get<ApiResponse<PagedResponse<OpsAlert>>>(this.base, { params })
      .pipe(map((r) => r.data))
      .subscribe({
        next: (d) => { this.data = d; this.loading = false; },
        error: (e) => { this.error = e?.error?.message || 'Không tải được cảnh báo'; this.loading = false; }
      });
  }

  onFilterChange(): void { this.page = 0; this.load(); }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  openResolve(a: OpsAlert): void { this.resolvingId = a.id; this.note = ''; }

  confirmResolve(a: OpsAlert): void {
    if (this.busy) { return; }
    this.busy = a.id;
    this.http.post<ApiResponse<OpsAlert>>(`${this.base}/${a.id}/resolve`, { note: this.note })
      .subscribe({
        next: () => { this.busy = 0; this.resolvingId = 0; this.msg = 'Đã đánh dấu xử lý.'; this.load(); },
        error: (e) => { this.busy = 0; window.appAlert(e?.error?.message || 'Thao tác thất bại'); }
      });
  }

  typeLabel(t: string): string {
    return t === 'PAYMENT_BOOKING_MISMATCH'
      ? 'Đã thu tiền nhưng đơn không sống'
      : 'Vé đã bán nhưng chưa chốt ghế với hãng';
  }
}
