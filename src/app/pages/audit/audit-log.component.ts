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
  q = '';
  private qTimer?: ReturnType<typeof setTimeout>;
  loading = false;
  error = '';
  // Đầy đủ các action thực tế được ghi audit ở backend (xem các nơi publish AuditEvent).
  actions = [
    '', 'LOGIN',
    'APPROVE_VENDOR', 'REJECT_VENDOR', 'BAN_VENDOR', 'UNBAN_VENDOR',
    'CREATE_USER', 'CHANGE_USER_STATUS', 'CHANGE_USER_ROLE',
    'CHANGE_COMMISSION_DEFAULT', 'CHANGE_COMMISSION_VENDOR', 'REMOVE_COMMISSION_VENDOR',
    'CHANGE_PAYMENT_GATEWAY', 'REFUND',
    'APPROVE_CORP_BOOKING', 'REJECT_CORP_BOOKING'
  ];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.auditService.list(this.page, this.size, this.action || undefined, this.q || undefined).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được nhật ký'; this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 0; this.load(); }

  /** Thanh tìm kiếm: debounce 350ms rồi tải lại từ trang 0 (tìm phía server). */
  onSearch(): void {
    clearTimeout(this.qTimer);
    this.qTimer = setTimeout(() => { this.page = 0; this.load(); }, 350);
  }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }
}
