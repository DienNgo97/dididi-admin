import { Component, OnInit } from '@angular/core';
import { UserService } from '../../api/user.service';
import { AuthService } from '../../core/auth.service';
import { AdminUser, PagedResponse, CreateAdminRequest } from '../../core/admin-models';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  data?: PagedResponse<AdminUser>;
  page = 0;
  size = 20;
  role = '';
  status = '';
  q = '';
  private qTimer?: ReturnType<typeof setTimeout>;
  loading = false;
  error = '';
  roles = ['', 'CUSTOMER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'];
  statuses = ['ACTIVE', 'INACTIVE', 'LOCKED'];

  /** Sửa ngày sinh hộ khách (khách chỉ nhập được một lần) — id đang mở ô sửa. */
  editingBirthId = 0;
  birthValue = '';
  birthBusy = 0;

  showCreate = false;
  creating = false;
  createMsg = '';
  newUser: CreateAdminRequest = { email: '', fullName: '', password: '', role: 'ADMIN' };

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.userService.list(this.page, this.size, this.role || undefined, this.status || undefined, this.q || undefined).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 0; this.load(); }

  /** Thanh tìm kiếm: debounce 350ms rồi tải lại từ trang 0 (tìm phía server). */
  onSearch(): void {
    clearTimeout(this.qTimer);
    this.qTimer = setTimeout(() => { this.page = 0; this.load(); }, 350);
  }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  changeStatus(u: AdminUser, status: string): void {
    const prev = u.status;
    u.status = status;
    this.userService.changeStatus(u.id, status).subscribe({
      next: (updated) => { u.status = updated.status; },
      error: (err) => { u.status = prev; window.appAlert(err?.error?.message || 'Đổi trạng thái thất bại'); }
    });
  }

  changeRole(u: AdminUser, role: string): void {
    const prev = u.role;
    u.role = role;
    this.userService.changeRole(u.id, role).subscribe({
      next: (updated) => { u.role = updated.role; },
      error: (err) => { u.role = prev; window.appAlert(err?.error?.message || 'Đổi vai trò thất bại'); }
    });
  }

  openBirth(u: AdminUser): void {
    this.editingBirthId = u.id;
    this.birthValue = u.birthDate ? u.birthDate.substring(0, 10) : '';
  }

  /** Để trống = xoá ngày sinh, khách được nhập lại một lần nữa. Backend ghi audit cũ -> mới. */
  saveBirth(u: AdminUser): void {
    if (this.birthBusy) { return; }
    this.birthBusy = u.id;
    this.userService.changeBirthDate(u.id, this.birthValue || null).subscribe({
      next: (updated) => {
        u.birthDate = updated.birthDate;
        this.birthBusy = 0;
        this.editingBirthId = 0;
      },
      error: (err) => {
        this.birthBusy = 0;
        window.appAlert(err?.error?.message || 'Sửa ngày sinh thất bại');
      }
    });
  }

  createAdmin(): void {
    this.createMsg = '';
    if (!this.newUser.email || !this.newUser.password || this.newUser.password.length < 6) {
      window.appAlert('Cần email và mật khẩu tối thiểu 6 ký tự');
      return;
    }
    this.creating = true;
    this.userService.create(this.newUser).subscribe({
      next: () => {
        this.creating = false;
        this.createMsg = 'Đã tạo tài khoản ' + this.newUser.email;
        this.newUser = { email: '', fullName: '', password: '', role: 'ADMIN' };
        this.page = 0;
        this.load();
      },
      error: (err) => { this.creating = false; window.appAlert(err?.error?.message || 'Tạo tài khoản thất bại'); }
    });
  }
}
