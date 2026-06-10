import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../api/review.service';
import { AdminReview, PagedResponse } from '../../core/admin-models';

@Component({
  selector: 'app-vendor-review',
  templateUrl: './vendor-review.component.html'
})
export class VendorReviewComponent implements OnInit {
  data?: PagedResponse<AdminReview>;
  page = 0;
  size = 20;
  loading = false;
  error = '';
  busy = 0;
  replyText: { [id: number]: string } = {};

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.reviewService.vendorList(this.page, this.size).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  sendReply(r: AdminReview): void {
    const text = (this.replyText[r.id] || '').trim();
    if (!text) { return; }
    this.busy = r.id;
    this.reviewService.reply(r.id, text).subscribe({
      next: () => { this.busy = 0; this.replyText[r.id] = ''; this.load(); },
      error: (err) => { this.busy = 0; alert(err?.error?.message || 'Trả lời thất bại'); }
    });
  }
}
