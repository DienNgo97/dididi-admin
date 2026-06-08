import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = 'admin@dididi.local';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.role === 'VENDOR') {
          this.router.navigate(['/vendor']);
        } else if (res.role === 'ADMIN' || res.role === 'SUPER_ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          // Tai khoan khach (CUSTOMER) khong co quyen vao trang quan tri
          this.auth.logout();
          this.error = 'Tài khoản này không có quyền truy cập trang quản trị (chỉ dành cho admin/vendor).';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Đăng nhập thất bại';
      }
    });
  }
}
