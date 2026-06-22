import { Component, OnInit } from '@angular/core';
import { AdminReportService } from '../../api/admin-report.service';
import { AuthService } from '../../core/auth.service';
import { AdminReport, AdminReportPoint } from '../../core/admin-report-models';

@Component({
  selector: 'app-admin-report',
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.css']
})
export class AdminReportComponent implements OnInit {
  metrics: { key: string; label: string }[] = [
    { key: 'HOTEL_REVENUE', label: 'Doanh thu khách sạn' },
    { key: 'FLIGHT_REVENUE', label: 'Doanh thu chuyến bay' },
    { key: 'NEW_USERS', label: 'Người dùng mới tham gia' },
    { key: 'NEW_VENDORS', label: 'Vendors mới tham gia' }
  ];
  grans: { key: string; label: string }[] = [
    { key: 'WEEK', label: 'Theo tuần' },
    { key: 'MONTH', label: 'Theo tháng' },
    { key: 'QUARTER', label: 'Theo quý' },
    { key: 'YEAR', label: 'Theo năm' }
  ];

  metric = 'HOTEL_REVENUE';
  gran = 'MONTH';

  data: AdminReport | null = null;
  loading = false;
  error = '';

  constructor(private reportService: AdminReportService, private auth: AuthService) {}

  ngOnInit(): void {
    // Báo cáo hoa hồng chỉ dành cho Super Admin.
    if (this.auth.role === 'SUPER_ADMIN') {
      this.metrics = [...this.metrics, { key: 'COMMISSION', label: 'Hoa hồng (Super Admin)' }];
    }
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.reportService.report(this.metric, this.gran).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được báo cáo'; this.loading = false; }
    });
  }

  get isRevenue(): boolean { return this.data?.kind === 'REVENUE'; }

  get totalLabel(): string {
    if (this.metric === 'COMMISSION') { return 'Tổng hoa hồng'; }
    if (this.isRevenue) { return 'Tổng doanh thu'; }
    return this.metric === 'NEW_VENDORS' ? 'Tổng vendor mới' : 'Tổng người dùng mới';
  }

  valueOf(p: AdminReportPoint): number {
    return this.isRevenue ? (p.revenue || 0) : p.count;
  }

  get maxValue(): number {
    if (!this.data || !this.data.series.length) { return 0; }
    return Math.max(0, ...this.data.series.map((p) => this.valueOf(p)));
  }

  pct(p: AdminReportPoint): number {
    const max = this.maxValue;
    return max > 0 ? (this.valueOf(p) / max) * 100 : 0;
  }

  barTitle(p: AdminReportPoint): string {
    if (this.isRevenue) {
      return p.label + ': ' + (p.revenue || 0).toLocaleString('vi-VN') + ' ₫ · ' + p.count + ' đơn';
    }
    return p.label + ': ' + p.count;
  }
}
