import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HotelListComponent } from './pages/hotels/hotel-list.component';
import { HotelFormComponent } from './pages/hotels/hotel-form.component';
import { authGuard } from './core/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'hotels', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'hotels', component: HotelListComponent, canActivate: [authGuard] },
  { path: 'hotels/new', component: HotelFormComponent, canActivate: [authGuard] },
  { path: 'hotels/:id/edit', component: HotelFormComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'hotels' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
