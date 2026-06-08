import { NgModule } from '@angular/core';
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
    VendorListComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
