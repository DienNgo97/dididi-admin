import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { HotelListComponent } from './pages/hotels/hotel-list.component';
import { HotelFormComponent } from './pages/hotels/hotel-form.component';
import { AuthInterceptor } from './core/auth.interceptor';

@NgModule({
  declarations: [AppComponent, LoginComponent, HotelListComponent, HotelFormComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
