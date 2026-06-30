import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportLogService } from '../../api/support-log.service';
import { SupportStats, SupportConversation, SupportChatMessage } from '../../core/admin-models';

@Component({
  selector: 'app-support-log',
  templateUrl: './support-log.component.html',
  styles: [`
    .sl-overlay{position:fixed;inset:0;background:rgba(16,36,59,.5);display:flex;align-items:center;justify-content:center;z-index:1500;padding:16px;}
    .sl-box{background:#fff;max-width:560px;width:100%;max-height:80vh;border-radius:14px;padding:18px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.3);}
    .sl-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
    .sl-msgs{overflow-y:auto;display:flex;flex-direction:column;gap:8px;}
    .sl-msg{border:1px solid #e7e9ee;border-radius:10px;padding:8px 11px;}
    .sl-msg.r-user{background:#eef6f1;border-color:#cce8da;}
    .sl-msg.r-agent{background:#fff7ec;border-color:#ffd9a8;}
    .sl-msg.r-system{background:#eef1f4;text-align:center;font-size:12px;}
    .sl-role{font-size:11px;font-weight:700;color:#3dac78;text-transform:uppercase;margin-bottom:2px;}
    .sl-msg.r-agent .sl-role{color:#b26a00;}
    .sl-text{font-size:13.5px;color:#1f2430;white-space:pre-line;line-height:1.5;}
    .sl-time{font-size:11px;margin-top:3px;}
  `]
})
export class SupportLogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  stats?: SupportStats;
  all: SupportConversation[] = [];
  pageItems: SupportConversation[] = [];
  loading = false;
  error = '';
  page = 0;
  size = 20;

  selected?: SupportConversation;
  messages: SupportChatMessage[] = [];
  msgLoading = false;

  constructor(private svc: SupportLogService) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.svc.stats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => { this.stats = s; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được thống kê hỗ trợ'; }
    });
    this.svc.conversations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (c) => { this.all = c || []; this.page = 0; this.recompute(); this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Không tải được danh sách hội thoại'; this.loading = false; }
    });
  }

  private recompute(): void {
    const maxPage = Math.max(0, Math.ceil(this.all.length / this.size) - 1);
    if (this.page > maxPage) { this.page = maxPage; }
    const start = this.page * this.size;
    this.pageItems = this.all.slice(start, start + this.size);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.all.length / this.size)); }
  prev(): void { if (this.page > 0) { this.page--; this.recompute(); } }
  next(): void { if (this.page + 1 < this.totalPages) { this.page++; this.recompute(); } }

  view(c: SupportConversation): void {
    this.selected = c;
    this.messages = [];
    this.msgLoading = true;
    this.svc.messages(c.conversationId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (m) => { this.messages = m || []; this.msgLoading = false; },
      error: (e) => { this.msgLoading = false; window.appAlert(e?.error?.message || 'Không tải được nội dung hội thoại'); }
    });
  }

  closeView(): void { this.selected = undefined; this.messages = []; }

  shortId(id: string): string { return id ? id.substring(0, 8) : ''; }
}
