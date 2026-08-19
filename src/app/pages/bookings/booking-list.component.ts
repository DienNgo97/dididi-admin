import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from '../../api/booking.service';
import { AdminBooking, PagedResponse, Refund } from '../../core/admin-models';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html'
})
export class BookingListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  data?: PagedResponse<AdminBooking>;
  page = 0;
  size = 20;
  status = '';
  q = '';
  private qTimer?: ReturnType<typeof setTimeout>;
  tab: 'all' | 'cancel' = 'all';
  pendingCancelCount = 0;
  loading = false;
  error = '';
  statuses = ['', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'FAILED'];
  refunding = 0;
  showHistory = false;
  refunds: Refund[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void { this.load(); this.loadPendingCount(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const req = this.tab === 'cancel'
      ? this.bookingService.list(this.page, this.size, undefined, 'REQUESTED', this.q || undefined)
      : this.bookingService.list(this.page, this.size, this.status || undefined, undefined, this.q || undefined);
    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  loadPendingCount(): void {
    this.bookingService.list(0, 1, undefined, 'REQUESTED').pipe(takeUntil(this.destroy$)).subscribe({
      next: (d) => { this.pendingCancelCount = d.totalElements; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được số yêu cầu huỷ chờ duyệt'; }
    });
  }

  setTab(t: 'all' | 'cancel'): void {
    if (this.tab === t) { return; }
    this.tab = t;
    this.page = 0;
    this.load();
  }

  onFilterChange(): void { this.page = 0; this.load(); }

  /** Thanh tìm kiếm: debounce 350ms rồi tải lại từ trang 0 (tìm phía server). */
  onSearch(): void {
    clearTimeout(this.qTimer);
    this.qTimer = setTimeout(() => { this.page = 0; this.load(); }, 350);
  }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  async cancel(b: AdminBooking): Promise<void> {
    if (!await window.appConfirm('Huỷ đơn ' + b.publicCode + '?')) { return; }
    this.bookingService.cancel(b.id).subscribe({
      next: () => this.load(),
      error: (err) => window.appAlert(err?.error?.message || 'Huỷ thất bại')
    });
  }

  /** Số tiền có phân tách hàng nghìn theo locale Việt (vd 1.500.000 VND). */
  private fmtAmount(b: AdminBooking): string {
    return (b.amount ?? 0).toLocaleString('vi-VN') + ' ' + (b.currency || '');
  }

  async refund(b: AdminBooking): Promise<void> {
    if (b.status !== 'CONFIRMED') { return; }
    const reason = await window.appPrompt(
      'Hoàn tiền đơn ' + b.publicCode + ' (' + this.fmtAmount(b) + ')?\nLý do:',
      'Khách đổi lịch'
    );
    if (reason === null) { return; }            // bấm Cancel
    this.refunding = b.id;
    this.bookingService.refund(b.id, reason).subscribe({
      next: () => {
        this.refunding = 0;
        this.load();
        if (this.showHistory) { this.loadHistory(); }
      },
      error: (err) => { this.refunding = 0; window.appAlert(err?.error?.message || 'Hoàn tiền thất bại'); }
    });
  }

  async approveCancel(b: AdminBooking): Promise<void> {
    const reason = await window.appPrompt(
      'DUYỆT huỷ đơn ' + b.publicCode + ' (hoàn ' + this.fmtAmount(b) + ').\nLý do duyệt:',
      'Yêu cầu hợp lệ'
    );
    if (reason === null || !reason.trim()) { return; }
    this.bookingService.approveCancel(b.id, reason.trim()).subscribe({
      next: () => { this.load(); this.loadPendingCount(); if (this.showHistory) { this.loadHistory(); } },
      error: (err) => window.appAlert(err?.error?.message || 'Duyệt thất bại')
    });
  }

  async rejectCancel(b: AdminBooking): Promise<void> {
    const reason = await window.appPrompt('TỪ CHỐI huỷ đơn ' + b.publicCode + '.\nLý do từ chối:', '');
    if (reason === null || !reason.trim()) { return; }
    this.bookingService.rejectCancel(b.id, reason.trim()).subscribe({
      next: () => { this.load(); this.loadPendingCount(); },
      error: (err) => window.appAlert(err?.error?.message || 'Từ chối thất bại')
    });
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) { this.loadHistory(); }
  }

  loadHistory(): void {
    this.bookingService.refundHistory().pipe(takeUntil(this.destroy$)).subscribe({
      next: (rs) => (this.refunds = rs),
      error: (err) => { this.error = err?.error?.message || 'Không tải được lịch sử hoàn tiền'; }
    });
  }
}
