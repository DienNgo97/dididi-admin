import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../api/dashboard.service';
import { DashboardStats } from '../../core/admin-models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  loading = false;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.stats().subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được số liệu'; this.loading = false; }
    });
  }
}
