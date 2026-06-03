import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from './api.config';
import { ApiResponse, LoginResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${API_BASE}/api/auth/login`, { email, password })
      .pipe(
        map((res) => {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('role', res.data.role);
          localStorage.setItem('email', res.data.email);
          return res.data;
        })
      );
  }

  get token(): string | null { return localStorage.getItem('token'); }
  get role(): string | null { return localStorage.getItem('role'); }
  get email(): string | null { return localStorage.getItem('email'); }
  isLoggedIn(): boolean { return !!this.token; }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  }
}
