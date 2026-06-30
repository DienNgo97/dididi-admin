import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VendorListComponent } from './vendor-list.component';
import { AdminVendorService } from '../../api/admin-vendor.service';
import { AuthService } from '../../core/auth.service';
import { VendorAccount } from '../../core/vendor-models';
import { of } from 'rxjs';

/**
 * FE-H7: ban() phải bỏ qua khi lý do null HOẶC chuỗi rỗng/khoảng trắng
 * (không gọi service ban với lý do trống).
 */
describe('VendorListComponent.ban empty-reason guard', () => {
  let component: VendorListComponent;
  let banSpy: jasmine.Spy;

  const vendor: VendorAccount = { userId: 5, email: 'v@x.com', status: 'ACTIVE', hotelActive: true };

  beforeEach(() => {
    banSpy = jasmine.createSpy('ban').and.returnValue(of({} as VendorAccount));
    const adminVendorServiceStub: Partial<AdminVendorService> = {
      list: () => of([]),
      ban: banSpy as any
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [VendorListComponent],
      providers: [
        { provide: AdminVendorService, useValue: adminVendorServiceStub },
        AuthService
      ]
    });
    component = TestBed.createComponent(VendorListComponent).componentInstance;
  });

  it('does NOT call ban when prompt is cancelled (null)', async () => {
    window.appPrompt = () => Promise.resolve(null);
    await component.ban(vendor);
    expect(banSpy).not.toHaveBeenCalled();
  });

  it('does NOT call ban when reason is empty / whitespace', async () => {
    window.appPrompt = () => Promise.resolve('   ');
    await component.ban(vendor);
    expect(banSpy).not.toHaveBeenCalled();
  });

  it('calls ban with a trimmed reason when reason is non-empty', async () => {
    window.appPrompt = () => Promise.resolve('  Vi phạm  ');
    await component.ban(vendor);
    expect(banSpy).toHaveBeenCalledWith(5, 'Vi phạm');
  });
});
