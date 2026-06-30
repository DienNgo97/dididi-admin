import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompanyService } from '../../api/company.service';
import { UserService } from '../../api/user.service';
import { Company, CompanyUpsert, CompanyEmployee, CompanyBooking, AdminUser, CompanyInvite } from '../../core/admin-models';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html'
})
export class CompanyFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  id?: number;
  model: CompanyUpsert = { name: '', code: '', budgetTotal: 0, contactEmail: '', taxCode: '', address: '', approvalThreshold: undefined, active: true };
  company?: Company;
  error = '';
  saving = false;

  topupAmount: number | null = null;

  employees: CompanyEmployee[] = [];
  allUsers: AdminUser[] = [];
  selectedUserId: number | null = null;

  bookings: CompanyBooking[] = [];

  invites: CompanyInvite[] = [];
  newInviteEmail = '';
  lastInviteUrl = '';
  inviteMsg = '';

  constructor(private companyService: CompanyService, private userService: UserService,
              private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.reload();
      this.loadUsers();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    if (!this.id) { return; }
    this.companyService.get(this.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (c) => {
        this.company = c;
        this.model = {
          name: c.name, code: c.code, budgetTotal: c.budgetTotal,
          contactEmail: c.contactEmail || '', taxCode: c.taxCode || '', address: c.address || '',
          approvalThreshold: c.approvalThreshold, active: c.active
        };
      },
      error: (err) => { this.error = err?.error?.message || 'Không tải được công ty'; }
    });
    this.companyService.employees(this.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (e) => { this.employees = e; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được nhân viên'; }
    });
    this.companyService.bookings(this.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (b) => { this.bookings = b; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được đơn của công ty'; }
    });
    this.companyService.invites(this.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (i) => { this.invites = i; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được lời mời'; }
    });
  }

  loadUsers(): void {
    this.userService.list(0, 200).pipe(takeUntil(this.destroy$)).subscribe({
      next: (p) => { this.allUsers = p.content; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách người dùng'; }
    });
  }

  save(): void {
    this.error = '';
    this.saving = true;
    const done = {
      next: (c: Company) => {
        this.saving = false;
        if (!this.id) { this.router.navigate(['/companies', c.id, 'edit']); } else { this.reload(); }
      },
      error: (err: any) => { this.saving = false; this.error = err?.error?.message || 'Lưu thất bại'; }
    };
    if (this.id) { this.companyService.update(this.id, this.model).pipe(takeUntil(this.destroy$)).subscribe(done); }
    else { this.companyService.create(this.model).pipe(takeUntil(this.destroy$)).subscribe(done); }
  }

  topup(): void {
    if (!this.id || !this.topupAmount || this.topupAmount <= 0) { return; }
    this.companyService.topup(this.id, this.topupAmount).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.topupAmount = null; this.reload(); },
      error: (err) => window.appAlert(err?.error?.message || 'Nạp thất bại')
    });
  }

  assign(): void {
    if (!this.id || !this.selectedUserId) { return; }
    this.companyService.assign(this.id, this.selectedUserId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.selectedUserId = null; this.reload(); },
      error: (err) => window.appAlert(err?.error?.message || err?.message || 'Gán thất bại')
    });
  }

  async unassign(e: CompanyEmployee): Promise<void> {
    if (!this.id) { return; }
    if (!await window.appConfirm('Gỡ ' + e.email + ' khỏi công ty?')) { return; }
    this.companyService.unassign(this.id, e.userId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.reload(),
      error: (err) => window.appAlert(err?.error?.message || err?.message || 'Gỡ thất bại')
    });
  }

  back(): void { this.router.navigate(['/companies']); }

  createInvite(): void {
    if (!this.id || !this.newInviteEmail) { return; }
    this.inviteMsg = ''; this.lastInviteUrl = '';
    this.companyService.invite(this.id, this.newInviteEmail.trim()).pipe(takeUntil(this.destroy$)).subscribe({
      next: (inv) => {
        this.newInviteEmail = '';
        this.lastInviteUrl = inv.acceptUrl;
        this.inviteMsg = 'Đã tạo lời mời. Gửi link sau cho người được mời:';
        if (this.id) { this.companyService.invites(this.id).pipe(takeUntil(this.destroy$)).subscribe({ next: (i) => { this.invites = i; } }); }
      },
      error: (err) => window.appAlert(err?.error?.message || 'Tạo lời mời thất bại')
    });
  }

  async revokeInvite(inv: CompanyInvite): Promise<void> {
    if (!this.id) { return; }
    if (!await window.appConfirm('Thu hồi lời mời cho ' + inv.email + '?')) { return; }
    this.companyService.revokeInvite(this.id, inv.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { if (this.id) { this.companyService.invites(this.id).pipe(takeUntil(this.destroy$)).subscribe({ next: (i) => { this.invites = i; } }); } },
      error: (err) => window.appAlert(err?.error?.message || err?.message || 'Thu hồi thất bại')
    });
  }

  copyInviteUrl(): void {
    if (this.lastInviteUrl && navigator.clipboard) {
      navigator.clipboard.writeText(this.lastInviteUrl).then(() => { this.inviteMsg = 'Đã copy link vào clipboard.'; });
    }
  }

  downloadInvoice(code: string): void {
    this.companyService.invoice(code).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      },
      error: () => window.appAlert('Không tải được hóa đơn (đơn phải đã xác nhận).')
    });
  }
}
