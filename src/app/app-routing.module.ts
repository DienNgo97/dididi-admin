import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HotelListComponent } from './pages/hotels/hotel-list.component';
import { HotelFormComponent } from './pages/hotels/hotel-form.component';
import { FlightListComponent } from './pages/flights/flight-list.component';
import { BookingListComponent } from './pages/bookings/booking-list.component';
import { UserListComponent } from './pages/users/user-list.component';
import { VendorHotelComponent } from './pages/vendor/vendor-hotel.component';
import { VendorListComponent } from './pages/vendors/vendor-list.component';
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
  { path: 'users', component: UserListComponent, canActivate: [roleGuard(...ADMIN)] },
  { path: 'vendors', component: VendorListComponent, canActivate: [roleGuard(...ADMIN)] },

  // Khu vendor
  { path: 'vendor', component: VendorHotelComponent, canActivate: [roleGuard('VENDOR')] },

  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
