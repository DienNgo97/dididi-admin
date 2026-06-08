import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

/** Trang chu theo role. Role khong thuoc app quan tri (vd CUSTOMER) -> /login de tranh vong lap guard. */
function homeFor(role: string): string {
  if (role === 'VENDOR') { return '/vendor'; }
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') { return '/dashboard'; }
  return '/login';
}

/** Cho phep theo role; sai role thi dua ve trang chu phu hop (khong gay lap). */
export function roleGuard(...allowed: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }
    const role = auth.role || '';
    if (allowed.includes(role)) {
      return true;
    }
    router.navigate([homeFor(role)]);
    return false;
  };
}
