import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommissionService } from '../../api/commission.service';
import { UserService } from '../../api/user.service';
import { CommissionConfig, VendorCommission, CommissionReport, CommissionReportRow, AdminUser } from '../../core/admin-models';

@Component({
  selector: 'app-commission',
  templateUrl: './commission.component.html'
})
export class CommissionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  config?: CommissionConfig;
  defaultPercent = 0;
  vendors: VendorCommission[] = [];
  report?: CommissionReport;
  reportRows: CommissionReportRow[] = [];   // dòng của trang hiện tại (báo cáo hoa hồng)
  reportPage = 0;
  readonly reportPageSize = 20;
  reportQ = '';           // thanh tìm kiếm bảng báo cáo (tên vendor, không dấu)
  vendorOptions: AdminUser[] = [];
  selVendorId: number | null = null;
  selVendorPercent: number | null = null;
  error = '';
  msg = '';
  savingDefault = false;

  constructor(private commission: CommissionService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadAll();
    this.userService.list(0, 200, 'VENDOR').pipe(takeUntil(this.destroy$)).subscribe({
      next: (p) => { this.vendorOptions = p.content; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được danh sách vendor'; }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAll(): void {
    this.commission.config().pipe(takeUntil(this.destroy$)).subscribe({
      next: (c) => { this.config = c; this.defaultPercent = this.pct(c.defaultRate); },
      error: (e) => { this.error = e?.error?.message || 'Không tải được cấu hình'; }
    });
    this.commission.vendors().pipe(takeUntil(this.destroy$)).subscribe({
      next: (v) => { this.vendors = v; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được hoa hồng vendor'; }
    });
    this.commission.report().pipe(takeUntil(this.destroy$)).subscribe({
      next: (r) => { this.report = r; this.reportPage = 0; this.applyReportPage(); },
      error: (e) => { this.error = e?.error?.message || 'Không tải được báo cáo hoa hồng'; }
    });
  }

  // ---- Phân trang client-side cho bảng "Báo cáo hoa hồng" (20 vendor/trang) ----
  /** Bỏ dấu tiếng Việt để tìm không dấu. */
  private strip(s?: string | null): string {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  private reportFiltered(): CommissionReportRow[] {
    const q = this.strip(this.reportQ);
    const rows = this.report?.rows ?? [];
    return !q ? rows : rows.filter((r) => this.strip(r.vendorName).includes(q));
  }

  onReportSearch(): void { this.reportPage = 0; this.applyReportPage(); }

  get reportTotalPages(): number {
    const n = this.reportFiltered().length;
    return Math.max(1, Math.ceil(n / this.reportPageSize));
  }

  private applyReportPage(): void {
    const rows = this.reportFiltered();
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
    this.commission.setConfig((this.defaultPercent || 0) / 100).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.savingDefault = false; this.msg = 'Đã lưu hoa hồng mặc định'; this.loadAll(); },
      error: (e) => { this.savingDefault = false; this.error = e?.error?.message || 'Lưu thất bại'; }
    });
  }

  addVendor(): void {
    if (!this.selVendorId || this.selVendorPercent == null) { return; }
    this.commission.setVendor(this.selVendorId, this.selVendorPercent / 100).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.selVendorId = null; this.selVendorPercent = null; this.loadAll(); },
      error: (e) => window.appAlert(e?.error?.message || e?.message || 'Đặt thất bại')
    });
  }

  async removeVendor(v: VendorCommission): Promise<void> {
    if (!await window.appConfirm('Gỡ hoa hồng riêng của vendor này (về dùng mặc định)?')) { return; }
    this.commission.removeVendor(v.vendorId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadAll(),
      error: (e) => window.appAlert(e?.error?.message || e?.message || 'Gỡ thất bại')
    });
  }

  pct(rate: number): number { return Math.round((rate || 0) * 10000) / 100; }
}
