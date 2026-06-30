import { Component, OnInit } from '@angular/core';
import { VoucherService } from '../../api/voucher.service';
import { Voucher, VoucherUpsert } from '../../core/admin-models';

function blankModel(): VoucherUpsert {
  return {
    code: '', description: '', discountType: 'PERCENT', discountValue: 10,
    maxDiscount: null, minOrderAmount: null, usageLimit: null, perUserLimit: null,
    validFrom: null, validTo: null, active: true
  };
}

@Component({
  selector: 'app-voucher-list',
  templateUrl: './voucher-list.component.html'
})
export class VoucherListComponent implements OnInit {
  allVouchers: Voucher[] = [];
  filtered: Voucher[] = [];
  pageVouchers: Voucher[] = [];
  loading = false;
  error = '';

  // Bộ lọc loại: '' = tất cả | 'dididi' = voucher sàn | 'point' = đổi điểm (mã PT-)
  typeFilter = '';
  // Bộ lọc trạng thái: '' = tất cả | active | expired | scheduled | off
  statusFilter = '';

  // Phân trang
  page = 0;
  size = 20;

  // Form thêm/sửa
  showForm = false;
  editingId: number | null = null;
  saving = false;
  formError = '';
  model: VoucherUpsert = blankModel();
  validFromDate = '';
  validToDate = '';

  constructor(private voucherService: VoucherService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.voucherService.list().subscribe({
      next: (data) => {
        this.allVouchers = data || [];
        this.page = 0;
        this.recompute();
        this.loading = false;
      },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách voucher'; this.loading = false; }
    });
  }

  /** Voucher đổi điểm do hệ thống loyalty tạo, mã luôn bắt đầu bằng "PT-". */
  isPoint(v: Voucher): boolean {
    return (v.code || '').toUpperCase().startsWith('PT-');
  }

  /** Trạng thái suy ra từ active + khoảng hiệu lực. */
  statusKey(v: Voucher): string {
    if (!v.active) { return 'off'; }
    const now = Date.now();
    if (v.validTo && new Date(v.validTo).getTime() < now) { return 'expired'; }
    if (v.validFrom && new Date(v.validFrom).getTime() > now) { return 'scheduled'; }
    return 'active';
  }

  statusText(v: Voucher): string {
    switch (this.statusKey(v)) {
      case 'active': return 'Đang áp dụng';
      case 'expired': return 'Hết hạn';
      case 'scheduled': return 'Chưa hiệu lực';
      default: return 'Tắt';
    }
  }

  private recompute(): void {
    this.filtered = this.allVouchers.filter((v) => {
      const pt = this.isPoint(v);
      if (this.typeFilter === 'point' && !pt) { return false; }
      if (this.typeFilter === 'dididi' && pt) { return false; }
      if (this.statusFilter && this.statusKey(v) !== this.statusFilter) { return false; }
      return true;
    });
    const maxPage = Math.max(0, Math.ceil(this.filtered.length / this.size) - 1);
    if (this.page > maxPage) {
      this.page = maxPage;
    }
    const start = this.page * this.size;
    this.pageVouchers = this.filtered.slice(start, start + this.size);
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

  add(): void {
    this.editingId = null;
    this.model = blankModel();
    this.validFromDate = '';
    this.validToDate = '';
    this.formError = '';
    this.showForm = true;
  }

  edit(v: Voucher): void {
    this.editingId = v.id;
    this.model = {
      code: v.code, description: v.description || '', discountType: v.discountType,
      discountValue: v.discountValue, maxDiscount: v.maxDiscount ?? null,
      minOrderAmount: v.minOrderAmount ?? null, usageLimit: v.usageLimit ?? null,
      perUserLimit: v.perUserLimit ?? null, validFrom: v.validFrom ?? null,
      validTo: v.validTo ?? null, active: v.active
    };
    this.validFromDate = v.validFrom ? v.validFrom.substring(0, 10) : '';
    this.validToDate = v.validTo ? v.validTo.substring(0, 10) : '';
    this.formError = '';
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editingId = null; }

  save(): void {
    this.formError = '';
    if (!this.model.code || !this.model.code.trim()) { this.formError = 'Vui lòng nhập mã voucher'; return; }
    // discountValue bind <input type=number>: xoá trắng -> null/NaN. Bắt buộc không rỗng & >= 0.
    if (this.model.discountValue == null || isNaN(this.model.discountValue) || this.model.discountValue < 0) {
      this.formError = 'Giá trị giảm phải là số không âm';
      return;
    }
    if (this.model.discountType === 'PERCENT' && this.model.discountValue > 100) {
      this.formError = 'Phần trăm giảm tối đa là 100';
      return;
    }
    this.model.validFrom = this.validFromDate ? `${this.validFromDate}T00:00:00Z` : null;
    this.model.validTo = this.validToDate ? `${this.validToDate}T23:59:59Z` : null;

    this.saving = true;
    const done = {
      next: () => { this.saving = false; this.showForm = false; this.editingId = null; this.load(); },
      error: (err: any) => { this.saving = false; this.formError = err?.error?.message || 'Lưu thất bại'; }
    };
    if (this.editingId) { this.voucherService.update(this.editingId, this.model).subscribe(done); }
    else { this.voucherService.create(this.model).subscribe(done); }
  }

  async remove(v: Voucher): Promise<void> {
    if (!await window.appConfirm(`Xoá voucher ${v.code}?`)) { return; }
    this.voucherService.delete(v.id).subscribe({
      next: () => this.load(),
      error: (err) => window.appAlert(err?.error?.message || 'Xoá thất bại')
    });
  }
}
