import { Component, OnInit } from '@angular/core';
import { VendorReportService } from '../../api/vendor-report.service';
import { VendorDashboard } from '../../core/vendor-report-models';

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.component.html'
})
export class VendorDashboardComponent implements OnInit {
  data?: VendorDashboard;
  loading = false;
  error = '';

  constructor(private reportService: VendorReportService) {}

  ngOnInit(): void {
    this.loading = true;
    this.reportService.dashboard().subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 404
          ? 'Tài khoản chưa gắn khách sạn nào.'
          : (err?.error?.message || 'Không tải được dữ liệu');
      }
    });
  }

  get revChart(): { label: string; value: number }[] {
    return (this.data?.last30Days || []).map((s) => ({ label: s.label, value: s.revenue }));
  }
}
