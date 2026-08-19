import { Component, OnInit } from '@angular/core';
import { ApprovalService } from '../../api/approval.service';
import { ApprovalRequest } from '../../core/admin-models';

type ApprovalTab = 'PENDING' | 'APPROVED' | 'REJECTED';

@Component({
  selector: 'app-approval-list',
  templateUrl: './approval-list.component.html',
  styleUrls: ['./approval-list.component.css']
})
export class ApprovalListComponent implements OnInit {
  tabs: { key: ApprovalTab; label: string }[] = [
    { key: 'PENDING', label: 'Đang chờ duyệt' },
    { key: 'APPROVED', label: 'Đã duyệt' },
    { key: 'REJECTED', label: 'Đã từ chối' }
  ];
  activeTab: ApprovalTab = 'PENDING';

  items: ApprovalRequest[] = [];
  filtered: ApprovalRequest[] = [];
  pageItems: ApprovalRequest[] = [];
  q = '';               // thanh tìm kiếm (mã đơn / tiêu đề / công ty / người đặt, không dấu)
  loading = false;
  error = '';
  msg = '';
  busyId: number | null = null;

  // Phân trang
  page = 0;
  size = 20;

  constructor(private approvalService: ApprovalService) {}

  ngOnInit(): void { this.load(); }

  selectTab(tab: ApprovalTab): void {
    if (this.activeTab === tab) { return; }
    this.activeTab = tab;
    this.msg = '';
    this.page = 0;
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.approvalService.list(this.activeTab).subscribe({
      next: (d) => { this.items = d || []; this.recompute(); this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  /** Bỏ dấu tiếng Việt để tìm không dấu (gõ "cong ty" ra "Công ty"). */
  private strip(s?: string | null): string {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  onSearch(): void { this.page = 0; this.recompute(); }

  private recompute(): void {
    const q = this.strip(this.q);
    this.filtered = !q ? this.items : this.items.filter((r) =>
      this.strip(r.bookingCode).includes(q) || this.strip(r.bookingTitle).includes(q)
      || this.strip(r.companyName).includes(q) || this.strip(r.requestedByEmail).includes(q));
    const maxPage = Math.max(0, Math.ceil(this.filtered.length / this.size) - 1);
    if (this.page > maxPage) {
      this.page = maxPage;
    }
    const start = this.page * this.size;
    this.pageItems = this.filtered.slice(start, start + this.size);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.size));
  }

  prev(): void {
    if (this.page > 0) { this.page--; this.recompute(); }
  }

  next(): void {
    if (this.page + 1 < this.totalPages) { this.page++; this.recompute(); }
  }

  async approve(r: ApprovalRequest): Promise<void> {
    if (!await window.appConfirm('Duyệt đơn ' + (r.bookingCode || '') + '? Ngân sách công ty sẽ bị trừ và đơn được xác nhận.')) { return; }
    this.busyId = r.id; this.msg = ''; this.error = '';
    this.approvalService.approve(r.id).subscribe({
      next: () => { this.busyId = null; this.msg = 'Đã duyệt và xác nhận đơn ' + (r.bookingCode || ''); this.load(); },
      error: (e) => { this.busyId = null; this.error = e?.error?.message || 'Duyệt thất bại'; }
    });
  }

  async reject(r: ApprovalRequest): Promise<void> {
    const note = await window.appPrompt('Lý do từ chối (tuỳ chọn):');
    if (note === null) { return; } // bấm Huỷ
    this.busyId = r.id; this.msg = ''; this.error = '';
    this.approvalService.reject(r.id, note || undefined).subscribe({
      next: () => { this.busyId = null; this.msg = 'Đã từ chối yêu cầu (đơn vẫn ở trạng thái chờ thanh toán)'; this.load(); },
      error: (e) => { this.busyId = null; this.error = e?.error?.message || 'Từ chối thất bại'; }
    });
  }
}
