import { Component, OnInit } from '@angular/core';
import { PromoService } from '../../api/promo.service';
import { PromoCampaign, PromoGrant } from '../../core/promo-models';

/** Màn hình admin: quản lý 4 chương trình khuyến mãi cá nhân hoá + lịch sử phát voucher. */
@Component({
  selector: 'app-promo-admin',
  templateUrl: './promo-admin.component.html',
})
export class PromoAdminComponent implements OnInit {
  tab: 'campaigns' | 'grants' = 'campaigns';
  loading = false;
  err = '';

  campaigns: PromoCampaign[] = [];
  editing: PromoCampaign | null = null;

  grants: PromoGrant[] = [];
  grantType: string | null = null;
  page = 0;
  size = 20;
  total = 0;

  constructor(private api: PromoService) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.loading = true;
    this.err = '';
    this.api.campaigns().subscribe({
      next: c => { this.campaigns = c; this.loading = false; },
      error: e => { this.err = e?.error?.message || 'Không tải được danh sách chương trình'; this.loading = false; },
    });
  }

  loadGrants(page = 0): void {
    this.loading = true;
    this.page = page;
    this.api.grants(this.grantType, page, this.size).subscribe({
      next: p => { this.grants = p.content; this.total = p.totalElements; this.loading = false; },
      error: e => { this.err = e?.error?.message || 'Không tải được lịch sử phát'; this.loading = false; },
    });
  }

  switchTab(t: 'campaigns' | 'grants'): void {
    this.tab = t;
    if (t === 'grants') this.loadGrants(0);
    else this.loadCampaigns();
  }

  toggle(c: PromoCampaign): void {
    this.api.toggle(c.type, !c.enabled).subscribe({
      next: updated => { c.enabled = updated.enabled; },
      error: e => window.appAlert(e?.error?.message || 'Không đổi được trạng thái'),
    });
  }

  edit(c: PromoCampaign): void {
    this.editing = { ...c };
  }

  cancelEdit(): void {
    this.editing = null;
  }

  save(): void {
    if (!this.editing) return;
    const e = this.editing;
    this.api
      .update(e.type, {
        title: e.title,
        description: e.description,
        discountType: e.discountType,
        discountValue: e.discountValue,
        maxDiscount: e.maxDiscount,
        minOrderAmount: e.minOrderAmount,
        validDays: e.validDays,
        thresholdDays: e.thresholdDays,
        minTier: e.minTier,
      })
      .subscribe({
        next: () => { this.editing = null; this.loadCampaigns(); },
        error: err => window.appAlert(err?.error?.message || 'Lưu không thành công'),
      });
  }

  async run(c: PromoCampaign): Promise<void> {
    const ok = await window.appConfirm(`Chạy ngay chương trình "${c.typeName}"? Hệ thống sẽ phát voucher cho những khách đủ điều kiện.`);
    if (!ok) return;
    this.api.run(c.type).subscribe({
      next: r => { window.appAlert(`Đã phát ${r.granted} voucher.`); this.loadCampaigns(); },
      error: e => window.appAlert(e?.error?.message || 'Chạy không thành công'),
    });
  }

  filterGrants(type: string): void {
    this.grantType = type || null;
    this.loadGrants(0);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.size));
  }

  money(v: number | null | undefined): string {
    return v == null ? '—' : Number(v).toLocaleString('vi-VN') + 'đ';
  }

  discountText(c: PromoCampaign): string {
    if (c.discountType === 'PERCENT') {
      return `Giảm ${c.discountValue}%` + (c.maxDiscount ? ` (tối đa ${this.money(c.maxDiscount)})` : '');
    }
    return `Giảm ${this.money(c.discountValue)}`;
  }

  conditionText(c: PromoCampaign): string {
    switch (c.type) {
      case 'BIRTHDAY': return 'Tặng đúng ngày sinh nhật (mỗi năm 1 lần)';
      case 'WIN_BACK': return `Khách không đặt đơn nào trong ${c.thresholdDays} ngày`;
      case 'TIER_REWARD': return `Hạng ${c.minTier} trở lên · mỗi quý 1 lần`;
      case 'WELCOME': return `Khách mới đăng ký trong ${c.validDays} ngày`;
      default: return '';
    }
  }
}
