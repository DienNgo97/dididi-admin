import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { AppModule } from './app/app.module';

// Dang ky locale 'vi' de cac pipe number/currency dung phan tach hang nghin kieu Viet (dau cham).
registerLocaleData(localeVi);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
