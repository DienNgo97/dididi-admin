export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInMinutes: number;
  email: string;
  role: string;
}

export interface Hotel {
  id?: number;
  name: string;
  city?: string;
  address?: string;
  description?: string;
  starRating?: number;
  minPrice?: number;
  currency?: string;
  active?: boolean;
}

export interface HotelImage {
  id: number;
  hotelId: number;
  sortOrder: number;
  url: string; // tương đối, ví dụ /api/v1/hotels/1/images/5
}
