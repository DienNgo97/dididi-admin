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
  vouchers: Voucher[] = [];
  loading = false;
  error = '';

  showForm = false;
  editingId: number | null = null;
  saving = false;
  formError = '';
  model: VoucherUpsert = blankModel();

  // input type=date (yyyy-MM-dd) -> chuyen sang Instant khi luu
  validFromDate = '';
  validToDate = '';

  constructor(private voucherService: VoucherService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.voucherService.list().subscribe({
      next: (data) => { this.vouchers = data; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách voucher'; this.loading = false; }
    });
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
    // dung dau ngay cho validFrom, cuoi ngay cho validTo (UTC)
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

  remove(v: Voucher): void {
    if (!confirm(`Xoá voucher ${v.code}?`)) { return; }
    this.voucherService.delete(v.id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err?.error?.message || 'Xoá thất bại')
    });
  }
}
