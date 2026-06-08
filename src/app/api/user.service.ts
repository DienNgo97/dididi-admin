import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { AdminUser, PagedResponse } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${API_BASE}/api/admin/v1/users`;
  constructor(private http: HttpClient) {}

  list(page = 0, size = 20, role?: string): Observable<PagedResponse<AdminUser>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (role) { params = params.set('role', role); }
    return this.http
      .get<ApiResponse<PagedResponse<AdminUser>>>(this.base, { params })
      .pipe(map((r) => r.data));
  }

  changeStatus(id: number, status: string): Observable<AdminUser> {
    const params = new HttpParams().set('status', status);
    return this.http
      .patch<ApiResponse<AdminUser>>(`${this.base}/${id}/status`, {}, { params })
      .pipe(map((r) => r.data));
  }

  changeRole(id: number, role: string): Observable<AdminUser> {
    const params = new HttpParams().set('role', role);
    return this.http
      .patch<ApiResponse<AdminUser>>(`${this.base}/${id}/role`, {}, { params })
      .pipe(map((r) => r.data));
  }
}
