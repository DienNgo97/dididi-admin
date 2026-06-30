import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_BASE } from './api.config';

describe('AuthService (token storage)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores token/role/email on successful login', () => {
    let emitted: any;
    service.login('a@b.com', 'pw').subscribe((r) => (emitted = r));

    const req = httpMock.expectOne(`${API_BASE}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      data: { accessToken: 'tok-123', tokenType: 'Bearer', expiresInMinutes: 60, email: 'a@b.com', role: 'ADMIN' }
    });

    expect(emitted.accessToken).toBe('tok-123');
    expect(localStorage.getItem('token')).toBe('tok-123');
    expect(localStorage.getItem('role')).toBe('ADMIN');
    expect(localStorage.getItem('email')).toBe('a@b.com');
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.token).toBe('tok-123');
    expect(service.role).toBe('ADMIN');
  });

  it('clears token/role/email on logout', () => {
    localStorage.setItem('token', 'x');
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('email', 'a@b.com');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
