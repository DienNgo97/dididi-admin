import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../api/booking.service';
import { AdminBooking } from '../../core/admin-models';

/**
 * QA TC-C-13: màn chi tiết đơn — trước đây danh sách đơn KHÔNG có cách nào mở chi tiết
 * (backend GET /api/admin/v1/bookings/{id} có sẵn nhưng Angular chưa nối route/component).
 * Read-only: các thao tác (hoàn tiền/huỷ/duyệt huỷ) vẫn nằm ở danh sách.
 */
@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html'
})
export class BookingDetailComponent implements OnInit {
  b?: AdminBooking;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private bookingService: BookingService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.get(id).subscribe({
      next: (b) => { this.b = b; this.loading = false; },
      error: (err) => {
        this.error = err?.error?.message || 'Không tải được đơn';
        this.loading = false;
      }
    });
  }
}
