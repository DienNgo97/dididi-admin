import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { AuditLog, PagedResponse } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private base = `${API_BASE}/api/admin/v1/audit-logs`;
  constructor(private http: HttpClient) {}

  list(page = 0, size = 30, action?: string): Observable<PagedResponse<AuditLog>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (action) { params = params.set('action', action); }
    return this.http
      .get<ApiResponse<PagedResponse<AuditLog>>>(this.base, { params })
      .pipe(map((r) => r.data));
  }
}
