import { Injectable } from '@angular/core';
import {
  HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Dinh kem Bearer token cho moi request va xu ly loi xac thuc tap trung:
 * gap 401/403 (token het han / khong du quyen) -> logout + dieu huong /login,
 * thay vi de tung component nuot loi (bang trong / thong bao chung chung).
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // Khong dieu huong khi chinh request dang nhap that bai (de man hinh login tu hien loi).
        const isLoginCall = req.url.includes('/api/auth/login');
        if (!isLoginCall && (err.status === 401 || err.status === 403)) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}
