import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse, HotelImage } from '../core/models';

@Injectable({ providedIn: 'root' })
export class HotelImageService {
  constructor(private http: HttpClient) {}

  /** URL tuyệt đối để hiển thị trong thẻ <img>. */
  absUrl(img: HotelImage): string {
    return API_BASE + img.url;
  }

  // ----- Vendor: ảnh KS của chính mình -----
  listMy(): Observable<HotelImage[]> {
    return this.http
      .get<ApiResponse<HotelImage[]>>(`${API_BASE}/api/vendor/v1/my-hotel/images`)
      .pipe(map((r) => r.data));
  }

  uploadMy(file: File): Observable<HotelImage> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http
      .post<ApiResponse<HotelImage>>(`${API_BASE}/api/vendor/v1/my-hotel/images`, fd)
      .pipe(map((r) => r.data));
  }

  deleteMy(imageId: number): Observable<unknown> {
    return this.http.delete(`${API_BASE}/api/vendor/v1/my-hotel/images/${imageId}`);
  }

  // ----- Admin: ảnh của 1 KS bất kỳ -----
  listForHotel(hotelId: number): Observable<HotelImage[]> {
    return this.http
      .get<ApiResponse<HotelImage[]>>(`${API_BASE}/api/admin/v1/hotels/${hotelId}/images`)
      .pipe(map((r) => r.data));
  }

  uploadForHotel(hotelId: number, file: File): Observable<HotelImage> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http
      .post<ApiResponse<HotelImage>>(`${API_BASE}/api/admin/v1/hotels/${hotelId}/images`, fd)
      .pipe(map((r) => r.data));
  }

  deleteForHotel(hotelId: number, imageId: number): Observable<unknown> {
    return this.http.delete(`${API_BASE}/api/admin/v1/hotels/${hotelId}/images/${imageId}`);
  }
}
