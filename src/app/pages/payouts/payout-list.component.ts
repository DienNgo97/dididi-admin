import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../api/wallet.service';
import { Payout } from '../../core/wallet-models';
import { PagedResponse } from '../../core/admin-models';

/**
 * Admin GIÁM SÁT rút tiền ví vendor (VW6): dev/demo mock ngân hàng tự chi nên chỉ đọc;
 * prod (mock tắt) đây là hàng đợi admin dùng để chuyển khoản tay rồi đối chiếu.
 */
@Component({
  selector: 'app-payout-list',
  templateUrl: './payout-list.component.html'
})
export class PayoutListComponent implements OnInit {
  data?: PagedResponse<Payout>;
  page = 0;
  size = 20;
  status = '';
  q = '';
  loading = false;
  error = '';
  statuses = ['', 'REQUESTED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'];

  constructor(private wallet: WalletService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.wallet.adminList(this.page, this.size, this.status || undefined).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 0; this.load(); }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  /** Lọc client trong trang hiện tại theo email/tên vendor/mã GD (bổ trợ cho lọc status server). */
  get rows(): Payout[] {
    const list = this.data?.content || [];
    const q = this.q.trim().toLowerCase();
    if (!q) { return list; }
    return list.filter((p) =>
      (p.vendorEmail || '').toLowerCase().includes(q)
      || (p.vendorName || '').toLowerCase().includes(q)
      || (p.transactionRef || '').toLowerCase().includes(q));
  }

  vnd(n?: number | null): string { return n == null ? '' : Number(n).toLocaleString('vi-VN'); }

  statusLabel(s: string): string {
    switch (s) {
      case 'REQUESTED': return 'Đang chờ';
      case 'PROCESSING': return 'Đang xử lý';
      case 'PAID': return 'Đã chi';
      case 'FAILED': return 'Thất bại';
      case 'CANCELLED': return 'Đã huỷ';
      default: return s;
    }
  }
}
