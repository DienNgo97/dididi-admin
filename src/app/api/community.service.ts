import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { PagedResponse } from '../core/admin-models';
import {
  AdminSocialReport, AdminSocialPost, AdminSocialComment, AdminSocialMember, CommunityStats
} from '../core/community-models';

/** Gọi API kiểm duyệt cộng đồng cho admin (/api/admin/v1/community). */
@Injectable({ providedIn: 'root' })
export class CommunityService {
  private base = `${API_BASE}/api/admin/v1/community`;
  constructor(private http: HttpClient) {}

  // ---- Dashboard ----
  stats(): Observable<CommunityStats> {
    return this.http.get<ApiResponse<CommunityStats>>(`${this.base}/stats`).pipe(map((r) => r.data));
  }

  // ---- Báo cáo ----
  reports(page = 0, size = 20, status?: string, q?: string): Observable<PagedResponse<AdminSocialReport>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    if (q) { params = params.set('q', q); }
    return this.http.get<ApiResponse<PagedResponse<AdminSocialReport>>>(`${this.base}/reports`, { params })
      .pipe(map((r) => r.data));
  }
  reportHide(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/reports/${id}/hide`, {}).pipe(map((r) => r.data));
  }
  reportRemove(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/reports/${id}/remove`, {}).pipe(map((r) => r.data));
  }
  reportDismiss(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/reports/${id}/dismiss`, {}).pipe(map((r) => r.data));
  }

  // ---- Bài viết ----
  posts(page = 0, size = 20, status?: string, authorId?: number, q?: string): Observable<PagedResponse<AdminSocialPost>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    if (authorId) { params = params.set('authorId', authorId); }
    if (q) { params = params.set('q', q); }
    return this.http.get<ApiResponse<PagedResponse<AdminSocialPost>>>(`${this.base}/posts`, { params })
      .pipe(map((r) => r.data));
  }
  postHide(id: number): Observable<AdminSocialPost> {
    return this.http.post<ApiResponse<AdminSocialPost>>(`${this.base}/posts/${id}/hide`, {}).pipe(map((r) => r.data));
  }
  postUnhide(id: number): Observable<AdminSocialPost> {
    return this.http.post<ApiResponse<AdminSocialPost>>(`${this.base}/posts/${id}/unhide`, {}).pipe(map((r) => r.data));
  }
  postRestore(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/posts/${id}/restore`, {}).pipe(map((r) => r.data));
  }
  postRemove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/posts/${id}`);
  }

  // ---- Bình luận ----
  comments(page = 0, size = 20, status?: string, authorId?: number, postId?: number, q?: string): Observable<PagedResponse<AdminSocialComment>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    if (authorId) { params = params.set('authorId', authorId); }
    if (postId) { params = params.set('postId', postId); }
    if (q) { params = params.set('q', q); }
    return this.http.get<ApiResponse<PagedResponse<AdminSocialComment>>>(`${this.base}/comments`, { params })
      .pipe(map((r) => r.data));
  }
  commentHide(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/comments/${id}/hide`, {}).pipe(map((r) => r.data));
  }
  commentUnhide(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/comments/${id}/unhide`, {}).pipe(map((r) => r.data));
  }
  commentRestore(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/comments/${id}/restore`, {}).pipe(map((r) => r.data));
  }
  commentRemove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/comments/${id}`);
  }

  // ---- Thành viên ----
  members(page = 0, size = 20, q?: string): Observable<PagedResponse<AdminSocialMember>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) { params = params.set('q', q); }
    return this.http.get<ApiResponse<PagedResponse<AdminSocialMember>>>(`${this.base}/members`, { params })
      .pipe(map((r) => r.data));
  }
  memberLock(userId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/members/${userId}/lock`, {}).pipe(map((r) => r.data));
  }
  memberUnlock(userId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/members/${userId}/unlock`, {}).pipe(map((r) => r.data));
  }
}
