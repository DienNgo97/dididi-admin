import { Component, OnInit } from '@angular/core';
import { AuditService } from '../../api/audit.service';
import { AuditLog, PagedResponse } from '../../core/admin-models';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent implements OnInit {
  data?: PagedResponse<AuditLog>;
  page = 0;
  size = 30;
  action = '';
  loading = false;
  error = '';
  actions = ['', 'REFUND', 'BAN_VENDOR', 'UNBAN_VENDOR'];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.auditService.list(this.page, this.size, this.action || undefined).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được nhật ký'; this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 0; this.load(); }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }
}
