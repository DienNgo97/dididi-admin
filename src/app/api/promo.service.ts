import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { PagedResponse } from '../core/admin-models';
import { PromoCampaign, PromoGrant } from '../core/promo-models';

/** Gọi API admin quản lý khuyến mãi cá nhân hoá. */
@Injectable({ providedIn: 'root' })
export class PromoService {
  private base = `${API_BASE}/api/admin/v1/promo`;

  constructor(private http: HttpClient) {}

  campaigns(): Observable<PromoCampaign[]> {
    return this.http.get<ApiResponse<PromoCampaign[]>>(`${this.base}/campaigns`).pipe(map(r => r.data));
  }

  toggle(type: string, enabled: boolean): Observable<PromoCampaign> {
    return this.http
      .put<ApiResponse<PromoCampaign>>(`${this.base}/campaigns/${type}/enabled`, null, {
        params: new HttpParams().set('enabled', enabled),
      })
      .pipe(map(r => r.data));
  }

  update(type: string, body: Partial<PromoCampaign>): Observable<PromoCampaign> {
    return this.http.put<ApiResponse<PromoCampaign>>(`${this.base}/campaigns/${type}`, body).pipe(map(r => r.data));
  }

  run(type: string): Observable<{ type: string; granted: number }> {
    return this.http
      .post<ApiResponse<{ type: string; granted: number }>>(`${this.base}/campaigns/${type}/run`, null)
      .pipe(map(r => r.data));
  }

  grants(type: string | null, page = 0, size = 20): Observable<PagedResponse<PromoGrant>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (type) p = p.set('type', type);
    return this.http
      .get<ApiResponse<PagedResponse<PromoGrant>>>(`${this.base}/grants`, { params: p })
      .pipe(map(r => r.data));
  }
}
