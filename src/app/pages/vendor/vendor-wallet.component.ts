import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WalletService } from '../../api/wallet.service';
import { WalletSummary, LedgerEntry, Payout } from '../../core/wallet-models';
import { PagedResponse } from '../../core/admin-models';

/**
 * Ví của tôi (VENDOR — VW6): số dư 3 bucket (khả dụng / đang chờ / bị giữ),
 * tài khoản nhận tiền, tạo & huỷ yêu cầu rút, lịch sử bút toán sổ cái.
 * Khi có yêu cầu REQUESTED/PROCESSING thì poll nhẹ 5s để thấy mock ngân hàng chốt PAID/FAILED.
 */
@Component({
  selector: 'app-vendor-wallet',
  templateUrl: './vendor-wallet.component.html'
})
export class VendorWalletComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private pollTimer?: ReturnType<typeof setInterval>;

  summary?: WalletSummary;
  ledger?: PagedResponse<LedgerEntry>;
  payouts?: PagedResponse<Payout>;
  ledgerPage = 0;
  payoutPage = 0;
  loading = false;
  error = '';
  msg = '';

  // Form rút tiền
  amount: number | null = null;
  requesting = false;

  // Form tài khoản ngân hàng
  showBankForm = false;
  bankName = '';
  accountNo = '';
  holder = '';
  savingBank = false;

  busyId = 0;

  constructor(private wallet: WalletService) {}

  ngOnInit(): void { this.loadAll(); }

  ngOnDestroy(): void {
    this.stopPoll();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    this.wallet.summary().pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => { this.summary = s; this.loading = false; this.syncPoll(); },
      error: (e) => { this.error = e?.error?.message || 'Không tải được ví'; this.loading = false; }
    });
    this.loadLedger(0);
    this.loadPayouts(0);
  }

  loadLedger(page: number): void {
    this.ledgerPage = Math.max(0, page);
    this.wallet.ledger(this.ledgerPage).pipe(takeUntil(this.destroy$)).subscribe({
      next: (d) => { this.ledger = d; },
      error: () => { /* giữ dữ liệu cũ */ }
    });
  }

  loadPayouts(page: number): void {
    this.payoutPage = Math.max(0, page);
    this.wallet.payouts(this.payoutPage).pipe(takeUntil(this.destroy$)).subscribe({
      next: (d) => { this.payouts = d; this.syncPoll(); },
      error: () => { /* giữ dữ liệu cũ */ }
    });
  }

  request(): void {
    if (this.requesting || this.amount == null) { return; }
    this.requesting = true;
    this.error = '';
    this.msg = '';
    this.wallet.requestPayout(this.amount).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.requesting = false;
        this.amount = null;
        this.msg = 'Đã tạo yêu cầu rút tiền — hệ thống đang xử lý.';
        this.refreshMoney();
      },
      error: (e) => { this.requesting = false; this.error = e?.error?.message || 'Tạo yêu cầu thất bại'; }
    });
  }

  async cancel(p: Payout): Promise<void> {
    if (!await window.appConfirm('Huỷ yêu cầu rút ' + this.vnd(p.amount) + 'đ?')) { return; }
    this.busyId = p.id;
    this.wallet.cancelPayout(p.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.busyId = 0; this.refreshMoney(); },
      error: (e) => { this.busyId = 0; window.appAlert(e?.error?.message || 'Huỷ thất bại'); this.refreshMoney(); }
    });
  }

  openBankForm(): void {
    this.showBankForm = true;
    this.bankName = this.summary?.bankName || '';
    this.holder = this.summary?.bankAccountHolder || '';
    this.accountNo = '';                       // nhập lại số đầy đủ (hiển thị chỉ có bản che)
  }

  saveBank(): void {
    if (this.savingBank) { return; }
    this.savingBank = true;
    this.error = '';
    this.wallet.updateBank(this.bankName, this.accountNo, this.holder)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (s) => {
          this.savingBank = false;
          this.summary = s;
          this.showBankForm = false;
          this.msg = 'Đã lưu tài khoản nhận tiền.';
        },
        error: (e) => { this.savingBank = false; this.error = e?.error?.message || 'Lưu thất bại'; }
      });
  }

  /** Poll nhẹ khi còn yêu cầu chưa chốt (mock ngân hàng chạy nền vài giây). */
  private syncPoll(): void {
    const active = (this.payouts?.content || []).some(
      (p) => p.status === 'REQUESTED' || p.status === 'PROCESSING');
    if (active && !this.pollTimer) {
      this.pollTimer = setInterval(() => this.refreshMoney(), 5000);
    } else if (!active) {
      this.stopPoll();
    }
  }

  private stopPoll(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = undefined; }
  }

  private refreshMoney(): void {
    this.wallet.summary().pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => { this.summary = s; }
    });
    this.loadPayouts(this.payoutPage);
    this.loadLedger(this.ledgerPage);
  }

  vnd(n?: number | null): string { return n == null ? '' : Number(n).toLocaleString('vi-VN'); }

  typeLabel(t: string): string {
    return t === 'EARNING' ? 'Doanh thu' : t === 'REVERSAL' ? 'Điều chỉnh (huỷ/hoàn)' : 'Rút tiền';
  }

  statusLabel(s: string): string {
    switch (s) {
      case 'REQUESTED': return 'Đang chờ';
      case 'PROCESSING': return 'Đang xử lý';
      case 'PAID': return 'Đã chi';
      case 'FAILED': return 'Thất bại';
      case 'CANCELLED': return 'Đã huỷ';
      default: return s;
    }
  }
}
