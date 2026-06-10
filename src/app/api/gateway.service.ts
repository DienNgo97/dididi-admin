import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { PaymentGatewayConfig, PaymentGatewayUpdate } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private base = `${API_BASE}/api/admin/v1/payment-gateway`;
  constructor(private http: HttpClient) {}

  get(): Observable<PaymentGatewayConfig> {
    return this.http.get<ApiResponse<PaymentGatewayConfig>>(this.base).pipe(map((r) => r.data));
  }

  update(req: PaymentGatewayUpdate): Observable<PaymentGatewayConfig> {
    return this.http.put<ApiResponse<PaymentGatewayConfig>>(this.base, req).pipe(map((r) => r.data));
  }
}
