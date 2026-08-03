import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommunityService } from '../../api/community.service';
import { PagedResponse } from '../../core/admin-models';
import {
  AdminSocialReport, AdminSocialPost, AdminSocialComment, AdminSocialMember, CommunityStats
} from '../../core/community-models';

type Tab = 'stats' | 'reports' | 'posts' | 'comments' | 'members';

@Component({
  selector: 'app-community-admin',
  templateUrl: './community-admin.component.html'
})
export class CommunityAdminComponent implements OnInit {
  tab: Tab = 'reports';
  size = 20;
  busy = 0;
  error = '';

  // Dashboard
  stats?: CommunityStats;

  // Báo cáo
  reports?: PagedResponse<AdminSocialReport>;
  rPage = 0;
  rStatus = 'OPEN';
  reportStatuses = ['', 'OPEN', 'REVIEWED', 'ACTIONED', 'DISMISSED'];
  loadingR = false;

  // Bài viết
  posts?: PagedResponse<AdminSocialPost>;
  pPage = 0;
  pStatus = '';
  pQ = '';
  contentStatuses = ['', 'PUBLISHED', 'HIDDEN', 'REMOVED'];
  loadingP = false;

  // Bình luận
  comments?: PagedResponse<AdminSocialComment>;
  cPage = 0;
  cStatus = '';
  loadingC = false;

  // Thành viên
  members?: PagedResponse<AdminSocialMember>;
  mPage = 0;
  mQ = '';
  loadingM = false;

  constructor(private svc: CommunityService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadReports();
  }

  switchTab(t: Tab): void {
    this.tab = t;
    this.error = '';
    if (t === 'stats') { this.loadStats(); }
    else if (t === 'reports' && !this.reports) { this.loadReports(); }
    else if (t === 'posts' && !this.posts) { this.loadPosts(); }
    else if (t === 'comments' && !this.comments) { this.loadComments(); }
    else if (t === 'members' && !this.members) { this.loadMembers(); }
  }

  private msg(e: any): string { return e?.error?.message || 'Thao tác thất bại'; }

  /** Chạy 1 hành động (ẩn/gỡ...) rồi reload danh sách của tab. */
  private run(id: number, obs$: Observable<any>, done: () => void): void {
    this.busy = id;
    obs$.subscribe({
      next: () => { this.busy = 0; done(); },
      error: (e) => { this.busy = 0; window.appAlert(this.msg(e)); }
    });
  }

  // ================= DASHBOARD =================
  loadStats(): void {
    this.svc.stats().subscribe({ next: (s) => this.stats = s, error: (e) => this.error = this.msg(e) });
  }

  // ================= BÁO CÁO =================
  loadReports(): void {
    this.loadingR = true; this.error = '';
    this.svc.reports(this.rPage, this.size, this.rStatus || undefined).subscribe({
      next: (d) => { this.reports = d; this.loadingR = false; },
      error: (e) => { this.error = this.msg(e); this.loadingR = false; }
    });
  }
  rFilter(): void { this.rPage = 0; this.loadReports(); }
  rPrev(): void { if (this.rPage > 0) { this.rPage--; this.loadReports(); } }
  rNext(): void { if (this.reports && this.rPage + 1 < this.reports.totalPages) { this.rPage++; this.loadReports(); } }
  rHide(r: AdminSocialReport): void { this.run(r.id, this.svc.reportHide(r.id), () => { this.loadReports(); this.stats = undefined; }); }
  rDismiss(r: AdminSocialReport): void { this.run(r.id, this.svc.reportDismiss(r.id), () => this.loadReports()); }
  async rRemove(r: AdminSocialReport): Promise<void> {
    if (!await window.appConfirm('Gỡ hẳn nội dung bị báo cáo (' + r.targetType + ' #' + r.targetId + ')?')) { return; }
    this.run(r.id, this.svc.reportRemove(r.id), () => { this.loadReports(); this.stats = undefined; });
  }

  // ================= BÀI VIẾT =================
  loadPosts(): void {
    this.loadingP = true; this.error = '';
    this.svc.posts(this.pPage, this.size, this.pStatus || undefined, undefined, this.pQ || undefined).subscribe({
      next: (d) => { this.posts = d; this.loadingP = false; },
      error: (e) => { this.error = this.msg(e); this.loadingP = false; }
    });
  }
  pFilter(): void { this.pPage = 0; this.loadPosts(); }
  pPrev(): void { if (this.pPage > 0) { this.pPage--; this.loadPosts(); } }
  pNext(): void { if (this.posts && this.pPage + 1 < this.posts.totalPages) { this.pPage++; this.loadPosts(); } }
  pHide(p: AdminSocialPost): void { this.run(p.id, this.svc.postHide(p.id), () => this.loadPosts()); }
  pUnhide(p: AdminSocialPost): void { this.run(p.id, this.svc.postUnhide(p.id), () => this.loadPosts()); }
  pRestore(p: AdminSocialPost): void { this.run(p.id, this.svc.postRestore(p.id), () => this.loadPosts()); }
  async pRemove(p: AdminSocialPost): Promise<void> {
    if (!await window.appConfirm('Gỡ hẳn bài viết #' + p.id + '?')) { return; }
    this.run(p.id, this.svc.postRemove(p.id), () => this.loadPosts());
  }

  // ================= BÌNH LUẬN =================
  loadComments(): void {
    this.loadingC = true; this.error = '';
    this.svc.comments(this.cPage, this.size, this.cStatus || undefined).subscribe({
      next: (d) => { this.comments = d; this.loadingC = false; },
      error: (e) => { this.error = this.msg(e); this.loadingC = false; }
    });
  }
  cFilter(): void { this.cPage = 0; this.loadComments(); }
  cPrev(): void { if (this.cPage > 0) { this.cPage--; this.loadComments(); } }
  cNext(): void { if (this.comments && this.cPage + 1 < this.comments.totalPages) { this.cPage++; this.loadComments(); } }
  cHide(c: AdminSocialComment): void { this.run(c.id, this.svc.commentHide(c.id), () => this.loadComments()); }
  cUnhide(c: AdminSocialComment): void { this.run(c.id, this.svc.commentUnhide(c.id), () => this.loadComments()); }
  cRestore(c: AdminSocialComment): void { this.run(c.id, this.svc.commentRestore(c.id), () => this.loadComments()); }
  async cRemove(c: AdminSocialComment): Promise<void> {
    if (!await window.appConfirm('Gỡ hẳn bình luận #' + c.id + '?')) { return; }
    this.run(c.id, this.svc.commentRemove(c.id), () => this.loadComments());
  }

  // ================= THÀNH VIÊN =================
  loadMembers(): void {
    this.loadingM = true; this.error = '';
    this.svc.members(this.mPage, this.size, this.mQ || undefined).subscribe({
      next: (d) => { this.members = d; this.loadingM = false; },
      error: (e) => { this.error = this.msg(e); this.loadingM = false; }
    });
  }
  mFilter(): void { this.mPage = 0; this.loadMembers(); }
  mPrev(): void { if (this.mPage > 0) { this.mPage--; this.loadMembers(); } }
  mNext(): void { if (this.members && this.mPage + 1 < this.members.totalPages) { this.mPage++; this.loadMembers(); } }
  async mLock(m: AdminSocialMember): Promise<void> {
    if (!await window.appConfirm('Khoá tài khoản ' + (m.email || m.handle || ('#' + m.userId)) + '?')) { return; }
    this.run(m.userId, this.svc.memberLock(m.userId), () => this.loadMembers());
  }
  mUnlock(m: AdminSocialMember): void { this.run(m.userId, this.svc.memberUnlock(m.userId), () => this.loadMembers()); }
}
