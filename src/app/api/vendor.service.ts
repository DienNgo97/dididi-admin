import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { VendorHotel, VendorRoomType, InventoryDay, RoomTypeUpsert, SetInventory } from '../core/vendor-models';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private base = `${API_BASE}/api/vendor/v1`;
  constructor(private http: HttpClient) {}

  myHotel(): Observable<VendorHotel> {
    return this.http.get<ApiResponse<VendorHotel>>(`${this.base}/my-hotel`).pipe(map((r) => r.data));
  }

  listRoomTypes(): Observable<VendorRoomType[]> {
    return this.http.get<ApiResponse<VendorRoomType[]>>(`${this.base}/room-types`).pipe(map((r) => r.data));
  }

  createRoomType(req: RoomTypeUpsert): Observable<VendorRoomType> {
    return this.http.post<ApiResponse<VendorRoomType>>(`${this.base}/room-types`, req).pipe(map((r) => r.data));
  }

  updateRoomType(id: number, req: RoomTypeUpsert): Observable<VendorRoomType> {
    return this.http.put<ApiResponse<VendorRoomType>>(`${this.base}/room-types/${id}`, req).pipe(map((r) => r.data));
  }

  deleteRoomType(id: number): Observable<void> {
    // Backend co the tra 204 No Content (body rong) -> dung delete<void>, khong unwrap r.data.
    return this.http.delete<void>(`${this.base}/room-types/${id}`);
  }

  getInventory(id: number, from: string, to: string): Observable<InventoryDay[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<ApiResponse<InventoryDay[]>>(`${this.base}/room-types/${id}/inventory`, { params })
      .pipe(map((r) => r.data));
  }

  setInventory(id: number, req: SetInventory): Observable<InventoryDay[]> {
    return this.http
      .put<ApiResponse<InventoryDay[]>>(`${this.base}/room-types/${id}/inventory`, req)
      .pipe(map((r) => r.data));
  }
}
