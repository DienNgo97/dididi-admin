import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../api/booking.service';
import { AdminBooking, PagedResponse, Refund } from '../../core/admin-models';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html'
})
export class BookingListComponent implements OnInit {
  data?: PagedResponse<AdminBooking>;
  page = 0;
  size = 20;
  status = '';
  loading = false;
  error = '';
  statuses = ['', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'FAILED'];
  refunding = 0;
  showHistory = false;
  refunds: Refund[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.bookingService.list(this.page, this.size, this.status || undefined).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 0; this.load(); }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  cancel(b: AdminBooking): void {
    if (!confirm('Huỷ đơn ' + b.publicCode + '?')) { return; }
    this.bookingService.cancel(b.id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err?.error?.message || 'Huỷ thất bại')
    });
  }

  refund(b: AdminBooking): void {
    if (b.status !== 'CONFIRMED') { return; }
    const reason = prompt(
      'Hoàn tiền đơn ' + b.publicCode + ' (' + b.amount + ' ' + b.currency + ')?\nLý do:',
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
      error: (err) => { this.refunding = 0; alert(err?.error?.message || 'Hoàn tiền thất bại'); }
    });
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) { this.loadHistory(); }
  }

  loadHistory(): void {
    this.bookingService.refundHistory().subscribe({
      next: (rs) => (this.refunds = rs),
      error: () => {}
    });
  }
}
