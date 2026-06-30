import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../api/review.service';
import { AdminReview, PagedResponse } from '../../core/admin-models';

@Component({
  selector: 'app-review-admin',
  templateUrl: './review-admin.component.html'
})
export class ReviewAdminComponent implements OnInit {
  data?: PagedResponse<AdminReview>;
  page = 0;
  size = 20;
  status = '';
  loading = false;
  error = '';
  busy = 0;
  statuses = ['', 'PENDING', 'PUBLISHED', 'HIDDEN'];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.reviewService.adminList(this.page, this.size, this.status || undefined).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 0; this.load(); }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  publish(r: AdminReview): void {
    this.busy = r.id;
    this.reviewService.publish(r.id).subscribe({
      next: () => { this.busy = 0; this.load(); },
      error: (err) => { this.busy = 0; window.appAlert(err?.error?.message || 'Thao tác thất bại'); }
    });
  }

  hide(r: AdminReview): void {
    this.busy = r.id;
    this.reviewService.hide(r.id).subscribe({
      next: () => { this.busy = 0; this.load(); },
      error: (err) => { this.busy = 0; window.appAlert(err?.error?.message || 'Thao tác thất bại'); }
    });
  }

  async remove(r: AdminReview): Promise<void> {
    if (!await window.appConfirm('Xoá hẳn đánh giá #' + r.id + '?')) { return; }
    this.busy = r.id;
    this.reviewService.remove(r.id).subscribe({
      next: () => { this.busy = 0; this.load(); },
      error: (err) => { this.busy = 0; window.appAlert(err?.error?.message || 'Xoá thất bại'); }
    });
  }
}
