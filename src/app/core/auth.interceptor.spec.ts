import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthInterceptor (401/403 handling)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    const routerSpy = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('logs out and redirects to /login on 401', () => {
    localStorage.setItem('token', 'abc');
    spyOn(auth, 'logout').and.callThrough();

    http.get('/api/admin/v1/users').subscribe({ next: () => {}, error: () => {} });

    const req = httpMock.expectOne('/api/admin/v1/users');
    req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('logs out and redirects to /login on 403', () => {
    localStorage.setItem('token', 'abc');
    spyOn(auth, 'logout').and.callThrough();

    http.get('/api/admin/v1/users').subscribe({ next: () => {}, error: () => {} });

    const req = httpMock.expectOne('/api/admin/v1/users');
    req.flush({ message: 'forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does NOT redirect on the login request itself (lets the form show the error)', () => {
    spyOn(auth, 'logout').and.callThrough();

    http.post('http://localhost:8080/api/auth/login', {}).subscribe({ next: () => {}, error: () => {} });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({ message: 'bad credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not redirect on a successful response', () => {
    localStorage.setItem('token', 'abc');

    http.get('/api/admin/v1/users').subscribe();

    const req = httpMock.expectOne('/api/admin/v1/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({ success: true, data: [] });

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
