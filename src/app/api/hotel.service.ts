import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse, Hotel } from '../core/models';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private adminBase = `${API_BASE}/api/admin/v1/hotels`;
  private publicBase = `${API_BASE}/api/v1/hotels`;

  constructor(private http: HttpClient) {}

  list(): Observable<Hotel[]> {
    return this.http.get<ApiResponse<Hotel[]>>(this.adminBase).pipe(map((r) => r.data));
  }

  get(id: number): Observable<Hotel> {
    // dung public detail (khong can quyen admin)
    return this.http.get<ApiResponse<Hotel>>(`${this.publicBase}/${id}`).pipe(map((r) => r.data));
  }

  create(h: Hotel): Observable<Hotel> {
    return this.http.post<ApiResponse<Hotel>>(this.adminBase, h).pipe(map((r) => r.data));
  }

  update(id: number, h: Hotel): Observable<Hotel> {
    return this.http.put<ApiResponse<Hotel>>(`${this.adminBase}/${id}`, h).pipe(map((r) => r.data));
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(`${this.adminBase}/${id}`);
  }
}
