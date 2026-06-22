import { Component, OnInit } from '@angular/core';
import { VendorReportService } from '../../api/vendor-report.service';
import { InventoryReport } from '../../core/vendor-report-models';

@Component({
  selector: 'app-vendor-inventory-report',
  templateUrl: './vendor-inventory-report.component.html'
})
export class VendorInventoryReportComponent implements OnInit {
  data?: InventoryReport;
  loading = false;
  error = '';
  from = '';
  to = '';

  constructor(private reportService: VendorReportService) {}

  ngOnInit(): void {
    const today = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 29);
    this.from = this.iso(today);
    this.to = this.iso(end);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.reportService.inventory(this.from, this.to).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 404
          ? 'Tài khoản chưa gắn khách sạn nào.'
          : (err?.error?.message || 'Không tải được báo cáo');
      }
    });
  }

  get occChart(): { label: string; value: number }[] {
    return (this.data?.rooms || []).map((r) => ({ label: r.name, value: r.occupancyPct }));
  }

  anyLow(): boolean {
    return (this.data?.rooms || []).some((r) => r.lowDays && r.lowDays.length > 0);
  }

  private iso(d: Date): string {
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
