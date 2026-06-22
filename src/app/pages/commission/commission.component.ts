import { Component, OnInit } from '@angular/core';
import { CommissionService } from '../../api/commission.service';
import { UserService } from '../../api/user.service';
import { CommissionConfig, VendorCommission, CommissionReport, CommissionReportRow, AdminUser } from '../../core/admin-models';

@Component({
  selector: 'app-commission',
  templateUrl: './commission.component.html'
})
export class CommissionComponent implements OnInit {
  config?: CommissionConfig;
  defaultPercent = 0;
  vendors: VendorCommission[] = [];
  report?: CommissionReport;
  reportRows: CommissionReportRow[] = [];   // dòng của trang hiện tại (báo cáo hoa hồng)
  reportPage = 0;
  readonly reportPageSize = 20;
  vendorOptions: AdminUser[] = [];
  selVendorId: number | null = null;
  selVendorPercent: number | null = null;
  error = '';
  msg = '';
  savingDefault = false;

  constructor(private commission: CommissionService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadAll();
    this.userService.list(0, 200, 'VENDOR').subscribe({ next: (p) => { this.vendorOptions = p.content; } });
  }

  loadAll(): void {
    this.commission.config().subscribe({
      next: (c) => { this.config = c; this.defaultPercent = this.pct(c.defaultRate); },
      error: (e) => { this.error = e?.error?.message || 'Không tải được cấu hình'; }
    });
    this.commission.vendors().subscribe({ next: (v) => { this.vendors = v; } });
    this.commission.report().subscribe({
      next: (r) => { this.report = r; this.reportPage = 0; this.applyReportPage(); }
    });
  }

  // ---- Phân trang client-side cho bảng "Báo cáo hoa hồng" (20 vendor/trang) ----
  get reportTotalPages(): number {
    const n = this.report?.rows.length ?? 0;
    return Math.max(1, Math.ceil(n / this.reportPageSize));
  }

  private applyReportPage(): void {
    const rows = this.report?.rows ?? [];
    const maxPage = this.reportTotalPages - 1;
    if (this.reportPage > maxPage) { this.reportPage = maxPage; }
    const start = this.reportPage * this.reportPageSize;
    this.reportRows = rows.slice(start, start + this.reportPageSize);
  }

  reportPrev(): void { if (this.reportPage > 0) { this.reportPage--; this.applyReportPage(); } }
  reportNext(): void { if (this.reportPage + 1 < this.reportTotalPages) { this.reportPage++; this.applyReportPage(); } }

  saveDefault(): void {
    this.error = ''; this.msg = '';
    this.savingDefault = true;
    this.commission.setConfig((this.defaultPercent || 0) / 100).subscribe({
      next: () => { this.savingDefault = false; this.msg = 'Đã lưu hoa hồng mặc định'; this.loadAll(); },
      error: (e) => { this.savingDefault = false; this.error = e?.error?.message || 'Lưu thất bại'; }
    });
  }

  addVendor(): void {
    if (!this.selVendorId || this.selVendorPercent == null) { return; }
    this.commission.setVendor(this.selVendorId, this.selVendorPercent / 100).subscribe({
      next: () => { this.selVendorId = null; this.selVendorPercent = null; this.loadAll(); },
      error: (e) => (window as any).appAlert(e?.error?.message || 'Đặt thất bại')
    });
  }

  async removeVendor(v: VendorCommission): Promise<void> {
    if (!await (window as any).appConfirm('Gỡ hoa hồng riêng của vendor này (về dùng mặc định)?')) { return; }
    this.commission.removeVendor(v.vendorId).subscribe({
      next: () => this.loadAll(),
      error: (e) => (window as any).appAlert(e?.error?.message || 'Gỡ thất bại')
    });
  }

  pct(rate: number): number { return Math.round((rate || 0) * 10000) / 100; }
}
