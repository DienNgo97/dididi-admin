import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { ApprovalRequest } from '../core/admin-models';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private base = `${API_BASE}/api/admin/v1/approvals`;
  constructor(private http: HttpClient) {}

  /** Danh sách yêu cầu phê duyệt theo trạng thái (PENDING / APPROVED / REJECTED). */
  list(status: ApprovalStatus, companyId?: number): Observable<ApprovalRequest[]> {
    let params = new HttpParams().set('status', status);
    if (companyId) { params = params.set('companyId', companyId); }
    return this.http.get<ApiResponse<ApprovalRequest[]>>(this.base, { params }).pipe(map((r) => r.data));
  }

  /** Giữ tương thích: các yêu cầu đang chờ duyệt. */
  pending(companyId?: number): Observable<ApprovalRequest[]> {
    return this.list('PENDING', companyId);
  }

  approve(id: number): Observable<ApprovalRequest> {
    return this.http.post<ApiResponse<ApprovalRequest>>(`${this.base}/${id}/approve`, {}).pipe(map((r) => r.data));
  }

  reject(id: number, note?: string): Observable<ApprovalRequest> {
    let params = new HttpParams();
    if (note) { params = params.set('note', note); }
    return this.http.post<ApiResponse<ApprovalRequest>>(`${this.base}/${id}/reject`, {}, { params }).pipe(map((r) => r.data));
  }
}
