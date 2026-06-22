import { Component, OnInit } from '@angular/core';
import { VendorReportService } from '../../api/vendor-report.service';
import { RevenueReport, GroupPreference } from '../../core/vendor-report-models';

@Component({
  selector: 'app-vendor-revenue',
  templateUrl: './vendor-revenue.component.html'
})
export class VendorRevenueComponent implements OnInit {
  tabs = [
    { key: 'TOTAL', label: 'Tổng' },
    { key: 'WEEK', label: 'Theo tuần' },
    { key: 'MONTH', label: 'Theo tháng' },
    { key: 'YEAR', label: 'Theo năm' }
  ];
  active = 'TOTAL';
  groupMode: 'TIER' | 'SEGMENT' = 'TIER';
  data?: RevenueReport;
  loading = false;
  error = '';

  constructor(private reportService: VendorReportService) {}

  ngOnInit(): void { this.select('TOTAL'); }

  select(key: string): void {
    this.active = key;
    this.loading = true;
    this.error = '';
    this.reportService.revenue(key).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 404
          ? 'Tài khoản chưa gắn khách sạn nào.'
          : (err?.error?.message || 'Không tải được báo cáo');
      }
    });
  }

  get pref(): GroupPreference | undefined {
    if (!this.data) { return undefined; }
    return this.groupMode === 'TIER' ? this.data.byTier : this.data.bySegment;
  }

  get revChart(): { label: string; value: number }[] {
    return (this.data?.series || []).map((s) => ({ label: s.label, value: s.revenue }));
  }

  get roomChart(): { label: string; value: number }[] {
    return (this.data?.byRoomType || []).map((r) => ({ label: r.name, value: r.revenue }));
  }
}
