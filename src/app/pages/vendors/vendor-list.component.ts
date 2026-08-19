import { Component, OnInit } from '@angular/core';
import { AdminVendorService, CreateVendorReq } from '../../api/admin-vendor.service';
import { AuthService } from '../../core/auth.service';
import { VendorAccount } from '../../core/vendor-models';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html'
})
export class VendorListComponent implements OnInit {
  allVendors: VendorAccount[] = [];
  filtered: VendorAccount[] = [];
  pageVendors: VendorAccount[] = [];
  loading = false;
  error = '';

  // Bộ lọc trạng thái: '' = tất cả | ACTIVE | INACTIVE (chờ duyệt) | LOCKED
  status = '';

  // Phân trang
  page = 0;
  size = 20;

  showForm = false;
  form: CreateVendorReq = this.emptyForm();
  saving = false;

  constructor(private adminVendorService: AdminVendorService, public auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.adminVendorService.list().subscribe({
      next: (list) => {
        this.allVendors = list || [];
        this.page = 0;
        this.recompute();
        this.loading = false;
      },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  q = '';               // thanh tìm kiếm (email / họ tên / tên KS, không dấu)

  /** Bỏ dấu tiếng Việt để tìm không dấu (go "ha noi" ra "Hà Nội"). */
  private strip(s?: string | null): string {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  onSearch(): void { this.page = 0; this.recompute(); }

  private recompute(): void {
    const q = this.strip(this.q);
    this.filtered = this.allVendors.filter((v) =>
      (!this.status || v.status === this.status)
      && (!q || this.strip(v.email).includes(q) || this.strip(v.fullName).includes(q)
          || this.strip(v.hotelName).includes(q)));
    const maxPage = Math.max(0, Math.ceil(this.filtered.length / this.size) - 1);
    if (this.page > maxPage) {
      this.page = maxPage;
    }
    const start = this.page * this.size;
    this.pageVendors = this.filtered.slice(start, start + this.size);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.size));
  }

  onFilterChange(): void {
    this.page = 0;
    this.recompute();
  }

  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.recompute();
    }
  }

  next(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.recompute();
    }
  }

  approve(v: VendorAccount): void {
    this.adminVendorService.approve(v.userId).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; this.recompute(); },
      error: (err) => window.appAlert(err?.error?.message || 'Duyệt thất bại')
    });
  }

  async reject(v: VendorAccount): Promise<void> {
    if (!await window.appConfirm('Từ chối / khoá vendor ' + v.email + '?')) { return; }
    this.adminVendorService.reject(v.userId).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; this.recompute(); },
      error: (err) => window.appAlert(err?.error?.message || 'Từ chối thất bại')
    });
  }

  async ban(v: VendorAccount): Promise<void> {
    const reason = await window.appPrompt('Ban vendor ' + v.email + '?\nLý do:', 'Vi phạm chính sách');
    // Bấm Huỷ (null) hoặc lý do trống đều bỏ qua — không ban với lý do rỗng.
    if (reason === null || !reason.trim()) { return; }
    this.adminVendorService.ban(v.userId, reason.trim()).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; this.recompute(); },
      error: (err) => window.appAlert(err?.error?.message || 'Ban thất bại')
    });
  }

  unban(v: VendorAccount): void {
    this.adminVendorService.unban(v.userId).subscribe({
      next: (u) => { v.status = u.status; v.hotelActive = u.hotelActive; this.recompute(); },
      error: (err) => window.appAlert(err?.error?.message || 'Gỡ ban thất bại')
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
      error: (err) => { this.saving = false; window.appAlert(err?.error?.message || 'Tạo vendor thất bại'); }
    });
  }
}
