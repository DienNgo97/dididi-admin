import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../api/booking.service';
import { AdminBooking, PagedResponse } from '../../core/admin-models';

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
}
