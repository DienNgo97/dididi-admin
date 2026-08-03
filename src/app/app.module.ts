import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HotelListComponent } from './pages/hotels/hotel-list.component';
import { HotelFormComponent } from './pages/hotels/hotel-form.component';
import { FlightListComponent } from './pages/flights/flight-list.component';
import { BookingListComponent } from './pages/bookings/booking-list.component';
import { UserListComponent } from './pages/users/user-list.component';
import { VendorHotelComponent } from './pages/vendor/vendor-hotel.component';
import { VendorListComponent } from './pages/vendors/vendor-list.component';
import { ReviewAdminComponent } from './pages/reviews/review-admin.component';
import { CommunityAdminComponent } from './pages/community/community-admin.component';
import { VendorReviewComponent } from './pages/vendor/vendor-review.component';
import { AuditLogComponent } from './pages/audit/audit-log.component';
import { CommissionComponent } from './pages/commission/commission.component';
import { ApprovalListComponent } from './pages/approvals/approval-list.component';
import { PaymentGatewayComponent } from './pages/gateway/payment-gateway.component';
import { HotelImageManagerComponent } from './pages/shared/hotel-image-manager.component';
import { CompanyListComponent } from './pages/companies/company-list.component';
import { CompanyFormComponent } from './pages/companies/company-form.component';
import { VoucherListComponent } from './pages/vouchers/voucher-list.component';
import { AdminReportComponent } from './pages/reports/admin-report.component';
import { SupportLogComponent } from './pages/support/support-log.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { BarChartComponent } from './pages/shared/bar-chart.component';
import { VendorDashboardComponent } from './pages/vendor/vendor-dashboard.component';
import { VendorRevenueComponent } from './pages/vendor/vendor-revenue.component';
import { VendorInventoryReportComponent } from './pages/vendor/vendor-inventory-report.component';
import { AuthInterceptor } from './core/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    HotelListComponent,
    HotelFormComponent,
    FlightListComponent,
    BookingListComponent,
    UserListComponent,
    VendorHotelComponent,
    VendorListComponent,
    ReviewAdminComponent,
    CommunityAdminComponent,
    VendorReviewComponent,
    AuditLogComponent,
    HotelImageManagerComponent,
    CompanyListComponent,
    CompanyFormComponent,
    CommissionComponent,
    PaymentGatewayComponent,
    ApprovalListComponent,
    VoucherListComponent,
    AdminReportComponent,
    SupportLogComponent,
    ConfirmDialogComponent,
    BarChartComponent,
    VendorDashboardComponent,
    VendorRevenueComponent,
    VendorInventoryReportComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'vi' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
