import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettlementService } from '../../api/settlement.service';
import { SettlementPeriodView, SettlementRow } from '../../core/settlement-models';

/**
 * Đối soát đối tác (ST4): công nợ B2B với hotel-pms + từng hãng bay theo kỳ tháng.
 * Phương trình dòng tiền chứng minh "không lỗ hổng doanh thu":
 * Tổng kỳ = Ví vendor + Công nợ đối tác + Tự doanh nền tảng (+ Mồ côi phải = 0) — lệch là hiện đỏ.
 */
@Component({
  selector: 'app-settlement',
  templateUrl: './settlement.component.html'
})
export class SettlementComponent implements OnInit {
  period = '';
  data?: SettlementPeriodView;
  loading = false;
  error = '';
  msg = '';
  busy = '';

  // Form ghi nhận thanh toán
  payingFor = '';
  paymentRef = '';

  constructor(private svc: SettlementService, private http: HttpClient) {}

  ngOnInit(): void {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);   // mặc định: tháng trước (thường chốt được)
    this.period = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    this.load();
  }

  load(): void {
    if (!/^\d{4}-\d{2}$/.test(this.period)) { return; }
    this.loading = true;
    this.error = '';
    this.svc.view(this.period).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được số liệu'; this.loading = false; }
    });
  }

  async close(r: SettlementRow): Promise<void> {
    if (!await window.appConfirm(
      `Chốt kỳ ${this.period} cho ${r.partnerName}?\n${r.bookingCount} đơn — phải trả ${this.vnd(r.netPayable)}đ.\nSau khi chốt, số liệu là BẤT BIẾN.`)) { return; }
    this.busy = r.partnerCode;
    this.msg = '';
    this.svc.close(r.partnerCode, this.period).subscribe({
      next: (d) => { this.busy = ''; this.data = d; this.msg = `Đã chốt kỳ cho ${r.partnerName}.`; },
      error: (e) => { this.busy = ''; window.appAlert(e?.error?.message || 'Chốt kỳ thất bại'); }
    });
  }

  openPaid(r: SettlementRow): void {
    this.payingFor = r.partnerCode;
    this.paymentRef = '';
  }

  confirmPaid(r: SettlementRow): void {
    this.busy = r.partnerCode;
    this.msg = '';
    this.svc.paid(r.partnerCode, this.period, this.paymentRef).subscribe({
      next: (d) => {
        this.busy = '';
        this.payingFor = '';
        this.data = d;
        this.msg = `Đã ghi nhận thanh toán cho ${r.partnerName}.`;
      },
      error: (e) => { this.busy = ''; window.appAlert(e?.error?.message || 'Ghi nhận thất bại'); }
    });
  }

  /** Tải CSV qua HttpClient (kèm JWT) rồi lưu bằng blob. */
  exportCsv(r: SettlementRow): void {
    this.http.get(this.svc.exportUrl(r.partnerCode, this.period), { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `doi-soat-${r.partnerCode}-${this.period}.csv`;
          a.click();
          URL.revokeObjectURL(a.href);
        },
        error: () => window.appAlert('Không xuất được file')
      });
  }

  get partnerRows(): SettlementRow[] { return (this.data?.rows || []).filter((r) => r.kind === 'PARTNER'); }
  get infoRows(): SettlementRow[] { return (this.data?.rows || []).filter((r) => r.kind !== 'PARTNER'); }

  vnd(n?: number | null): string { return n == null ? '' : Number(n).toLocaleString('vi-VN'); }

  statusLabel(s: string): string {
    switch (s) {
      case 'OPEN': return 'Chưa chốt';
      case 'CLOSED': return 'Đã chốt — chờ chi';
      case 'PAID': return 'Đã thanh toán';
      default: return '—';
    }
  }
}
