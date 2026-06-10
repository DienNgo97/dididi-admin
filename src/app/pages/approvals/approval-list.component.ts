import { Component, OnInit } from '@angular/core';
import { ApprovalService } from '../../api/approval.service';
import { ApprovalRequest } from '../../core/admin-models';

@Component({
  selector: 'app-approval-list',
  templateUrl: './approval-list.component.html'
})
export class ApprovalListComponent implements OnInit {
  items: ApprovalRequest[] = [];
  loading = false;
  error = '';
  msg = '';
  busyId: number | null = null;

  constructor(private approvalService: ApprovalService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.approvalService.pending().subscribe({
      next: (d) => { this.items = d; this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  approve(r: ApprovalRequest): void {
    if (!confirm('Duyệt đơn ' + (r.bookingCode || '') + '? Ngân sách công ty sẽ bị trừ và đơn được xác nhận.')) { return; }
    this.busyId = r.id; this.msg = ''; this.error = '';
    this.approvalService.approve(r.id).subscribe({
      next: () => { this.busyId = null; this.msg = 'Đã duyệt và xác nhận đơn ' + (r.bookingCode || ''); this.load(); },
      error: (e) => { this.busyId = null; this.error = e?.error?.message || 'Duyệt thất bại'; }
    });
  }

  reject(r: ApprovalRequest): void {
    const note = prompt('Lý do từ chối (tuỳ chọn):');
    if (note === null) { return; } // bấm Huỷ
    this.busyId = r.id; this.msg = ''; this.error = '';
    this.approvalService.reject(r.id, note || undefined).subscribe({
      next: () => { this.busyId = null; this.msg = 'Đã từ chối yêu cầu (đơn vẫn ở trạng thái chờ thanh toán)'; this.load(); },
      error: (e) => { this.busyId = null; this.error = e?.error?.message || 'Từ chối thất bại'; }
    });
  }
}
