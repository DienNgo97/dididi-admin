import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReviewService } from '../../api/review.service';
import { API_BASE } from '../../core/api.config';
import { AdminReview, PagedResponse } from '../../core/admin-models';

@Component({
  selector: 'app-vendor-review',
  templateUrl: './vendor-review.component.html'
})
export class VendorReviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  data?: PagedResponse<AdminReview>;
  page = 0;
  size = 20;
  loading = false;
  error = '';
  busy = 0;
  apiBase = API_BASE;
  readonly maxReply = 3;
  replyText: { [id: number]: string } = {};
  picked: { [id: number]: { file: File; url: SafeUrl; raw: string }[] } = {};

  constructor(private reviewService: ReviewService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void { this.load(); }

  /** Thu hồi mọi blob URL còn treo (tránh leak khi rời trang giữa lúc đang chọn ảnh). */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.picked).forEach((list) => (list || []).forEach((p) => URL.revokeObjectURL(p.raw)));
    this.picked = {};
  }

  /** Thu hồi các blob URL của 1 review (sau khi gửi thành công). */
  private revokePicked(id: number): void {
    (this.picked[id] || []).forEach((p) => URL.revokeObjectURL(p.raw));
    this.picked[id] = [];
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.reviewService.vendorList(this.page, this.size).pipe(takeUntil(this.destroy$)).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  onReplyFiles(id: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = this.picked[id] || [];
    Array.from(input.files || []).forEach((f) => {
      if (!f.type.startsWith('image/') || list.length >= this.maxReply) { return; }
      if (list.some((p) => p.file.name === f.name && p.file.size === f.size)) { return; }
      const raw = URL.createObjectURL(f);
      list.push({ file: f, url: this.sanitizer.bypassSecurityTrustUrl(raw), raw });
    });
    this.picked[id] = list;
    input.value = '';
  }

  removePick(id: number, index: number): void {
    const list = this.picked[id];
    if (!list) { return; }
    URL.revokeObjectURL(list[index].raw);
    list.splice(index, 1);
  }

  sendReply(r: AdminReview): void {
    const text = (this.replyText[r.id] || '').trim();
    if (!text) { return; }
    this.busy = r.id;
    const files = (this.picked[r.id] || []).map((p) => p.file);
    this.reviewService.reply(r.id, text, files).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.busy = 0; this.replyText[r.id] = ''; this.revokePicked(r.id); this.load(); },
      error: (err) => { this.busy = 0; window.appAlert(err?.error?.message || 'Trả lời thất bại'); }
    });
  }
}
