import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HotelListComponent } from './pages/hotels/hotel-list.component';
import { HotelFormComponent } from './pages/hotels/hotel-form.component';
import { FlightListComponent } from './pages/flights/flight-list.component';
import { BookingListComponent } from './pages/bookings/booking-list.component';
import { BookingDetailComponent } from './pages/bookings/booking-detail.component';
import { UserListComponent } from './pages/users/user-list.component';
import { VendorHotelComponent } from './pages/vendor/vendor-hotel.component';
import { VendorListComponent } from './pages/vendors/vendor-list.component';
import { ReviewAdminComponent } from './pages/reviews/review-admin.component';
import { CommunityAdminComponent } from './pages/community/community-admin.component';
import { PromoAdminComponent } from './pages/promo/promo-admin.component';
import { VendorReviewComponent } from './pages/vendor/vendor-review.component';
import { VendorDashboardComponent } from './pages/vendor/vendor-dashboard.component';
import { VendorRevenueComponent } from './pages/vendor/vendor-revenue.component';
import { VendorWalletComponent } from './pages/vendor/vendor-wallet.component';
import { PayoutListComponent } from './pages/payouts/payout-list.component';
import { SettlementComponent } from './pages/settlements/settlement.component';
import { VendorInventoryReportComponent } from './pages/vendor/vendor-inventory-report.component';
import { AuditLogComponent } from './pages/audit/audit-log.component';
import { CommissionComponent } from './pages/commission/commission.component';
import { ApprovalListComponent } from './pages/approvals/approval-list.component';
import { PaymentGatewayComponent } from './pages/gateway/payment-gateway.component';
import { CompanyListComponent } from './pages/companies/company-list.component';
import { CompanyFormComponent } from './pages/companies/company-form.component';
import { VoucherListComponent } from './pages/vouchers/voucher-list.component';
import { AdminReportComponent } from './pages/reports/admin-report.component';
import { SupportLogComponent } from './pages/support/support-log.component';
import { roleGuard } from './core/auth.guard';

const ADMIN = ['ADMIN', 'SUPER_ADMIN'];

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Khu admin
  { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'hotels', component: HotelListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'hotels/new', component: HotelFormComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'hotels/:id/edit', component: HotelFormComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'flights', component: FlightListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'bookings', component: BookingListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'bookings/:id', component: BookingDetailComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'users', component: UserListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'vendors', component: VendorListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'reviews', component: ReviewAdminComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'community', component: CommunityAdminComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'promo', component: PromoAdminComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'companies', component: CompanyListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'companies/new', component: CompanyFormComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'companies/:id/edit', component: CompanyFormComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'approvals', component: ApprovalListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'vouchers', component: VoucherListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'payouts', component: PayoutListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'settlements', component: SettlementComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'reports', component: AdminReportComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'support-log', component: SupportLogComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'audit', component: AuditLogComponent, canActivate: [roleGuard('SUPER_ADMIN')] },
  { path: 'commission', component: CommissionComponent, canActivate: [roleGuard('SUPER_ADMIN')] },
  { path: 'payment-gateway', component: PaymentGatewayComponent, canActivate: [roleGuard('SUPER_ADMIN')] },

  // Khu vendor
  { path: 'vendor', component: VendorHotelComponent, canActivate: [roleGuard('VENDOR')] },
  { path: 'vendor/dashboard', component: VendorDashboardComponent, canActivate: [roleGuard('VENDOR')] },
  { path: 'vendor/revenue', component: VendorRevenueComponent, canActivate: [roleGuard('VENDOR')] },
  { path: 'vendor/wallet', component: VendorWalletComponent, canActivate: [roleGuard('VENDOR')] },
  { path: 'vendor/inventory', component: VendorInventoryReportComponent, canActivate: [roleGuard('VENDOR')] },
  { path: 'vendor/reviews', component: VendorReviewComponent, canActivate: [roleGuard('VENDOR')] },

  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
