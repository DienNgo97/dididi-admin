import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  /** Trang xác thực (login...) -> KHÔNG render sidebar/shell của app. */
  get isAuthPage(): boolean {
    return this.router.url.split('?')[0].split('#')[0].startsWith('/login');
  }

  /** 2 chữ cái đầu cho avatar, suy ra từ email. */
  get initials(): string {
    const email = this.auth.email || '';
    const name = email.split('@')[0] || '';
    const parts = name.split(/[._-]+/).filter(Boolean);
    const s = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    return (s || 'AD').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
