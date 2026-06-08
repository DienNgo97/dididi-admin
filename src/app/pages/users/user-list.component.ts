import { Component, OnInit } from '@angular/core';
import { UserService } from '../../api/user.service';
import { AdminUser, PagedResponse } from '../../core/admin-models';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  data?: PagedResponse<AdminUser>;
  page = 0;
  size = 20;
  role = '';
  loading = false;
  error = '';
  roles = ['', 'CUSTOMER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'];
  statuses = ['ACTIVE', 'INACTIVE', 'LOCKED'];

  constructor(private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.userService.list(this.page, this.size, this.role || undefined).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 0; this.load(); }
  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }

  changeStatus(u: AdminUser, status: string): void {
    const prev = u.status;
    u.status = status;
    this.userService.changeStatus(u.id, status).subscribe({
      next: (updated) => { u.status = updated.status; },
      error: (err) => { u.status = prev; alert(err?.error?.message || 'Đổi trạng thái thất bại'); }
    });
  }

  changeRole(u: AdminUser, role: string): void {
    const prev = u.role;
    u.role = role;
    this.userService.changeRole(u.id, role).subscribe({
      next: (updated) => { u.role = updated.role; },
      error: (err) => { u.role = prev; alert(err?.error?.message || 'Đổi vai trò thất bại'); }
    });
  }
}
