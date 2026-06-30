import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommissionService } from './commission.service';
import { CompanyService } from './company.service';
import { API_BASE } from '../core/api.config';

/**
 * FE-H3: setVendor/assign/unassign/revokeInvite phải unwrap + ném lỗi khi {success:false}
 * dù HTTP 200, thay vì coi mọi 200 là thành công.
 */
describe('FE-H3 services throw on success:false', () => {
  let httpMock: HttpTestingController;
  let commission: CommissionService;
  let company: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommissionService, CompanyService]
    });
    httpMock = TestBed.inject(HttpTestingController);
    commission = TestBed.inject(CommissionService);
    company = TestBed.inject(CompanyService);
  });

  afterEach(() => httpMock.verify());

  it('commission.setVendor throws on success:false (HTTP 200)', () => {
    let errored: any;
    commission.setVendor(7, 0.1).subscribe({ next: () => {}, error: (e) => (errored = e) });

    const req = httpMock.expectOne((r) => r.url === `${API_BASE}/api/admin/v1/commission/vendors/7`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: false, message: 'Không đủ quyền' });

    expect(errored).toBeTruthy();
    expect(errored.message).toBe('Không đủ quyền');
  });

  it('commission.setVendor unwraps data on success:true', () => {
    let value: any = 'unset';
    commission.setVendor(7, 0.1).subscribe({ next: (v) => (value = v) });

    const req = httpMock.expectOne((r) => r.url === `${API_BASE}/api/admin/v1/commission/vendors/7`);
    req.flush({ success: true, data: { vendorId: 7, rate: 0.1 } });

    expect(value).toEqual({ vendorId: 7, rate: 0.1 });
  });

  it('company.assign throws on success:false (HTTP 200)', () => {
    let errored: any;
    company.assign(1, 42).subscribe({ next: () => {}, error: (e) => (errored = e) });

    const req = httpMock.expectOne(`${API_BASE}/api/admin/v1/companies/1/employees/42`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: false, message: 'User đã thuộc công ty khác' });

    expect(errored).toBeTruthy();
    expect(errored.message).toBe('User đã thuộc công ty khác');
  });

  it('company.revokeInvite throws on success:false (HTTP 200)', () => {
    let errored: any;
    company.revokeInvite(1, 9).subscribe({ next: () => {}, error: (e) => (errored = e) });

    const req = httpMock.expectOne(`${API_BASE}/api/admin/v1/companies/1/invites/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: false, message: 'Lời mời không tồn tại' });

    expect(errored).toBeTruthy();
    expect(errored.message).toBe('Lời mời không tồn tại');
  });
});
