import { Component, OnInit } from '@angular/core';
import { AdminVendorService, CreateVendorReq } from '../../api/admin-vendor.service';
import { AuthService } from '../../core/auth.service';
import { VendorAccount } from '../../core/vendor-models';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html'
})
export class VendorListComponent implements OnInit {
  vendors: VendorAccount[] = [];
  loading = false;
  error = '';
  onlyPending = false;

  showForm = false;
  form: CreateVendorReq = this.emptyForm();
  saving = false;

  constructor(private adminVendorService: AdminVendorService, public auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    const obs = this.onlyPending ? this.adminVendorService.pending() : this.adminVendorService.list();
    obs.subscribe({
      next: (list) => { this.vendors = list; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  approve(v: VendorAccount): void {
    this.adminVendorService.approve(v.userId).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; if (this.onlyPending) { this.load(); } },
      error: (err) => alert(err?.error?.message || 'Duyệt thất bại')
    });
  }

  reject(v: VendorAccount): void {
    if (!confirm('Từ chối / khoá vendor ' + v.email + '?')) { return; }
    this.adminVendorService.reject(v.userId).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; },
      error: (err) => alert(err?.error?.message || 'Từ chối thất bại')
    });
  }

  ban(v: VendorAccount): void {
    const reason = prompt('Ban vendor ' + v.email + '?\nLý do:', 'Vi phạm chính sách');
    if (reason === null) { return; }
    this.adminVendorService.ban(v.userId, reason).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; },
      error: (err) => alert(err?.error?.message || 'Ban thất bại')
    });
  }

  unban(v: VendorAccount): void {
    this.adminVendorService.unban(v.userId).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; },
      error: (err) => alert(err?.error?.message || 'Gỡ ban thất bại')
    });
  }

  emptyForm(): CreateVendorReq {
    return { email: '', password: '', fullName: '', phone: '', hotelName: '', city: '', address: '', starRating: 3 };
  }

  newVendor(): void { this.form = this.emptyForm(); this.showForm = true; }
  cancelForm(): void { this.showForm = false; }

  createVendor(): void {
    this.saving = true;
    this.adminVendorService.create(this.form).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (err) => { this.saving = false; alert(err?.error?.message || 'Tạo vendor thất bại'); }
    });
  }
}
