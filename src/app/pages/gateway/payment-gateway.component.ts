import { Component, OnInit } from '@angular/core';
import { GatewayService } from '../../api/gateway.service';
import { PaymentGatewayConfig, PaymentGatewayUpdate } from '../../core/admin-models';

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html'
})
export class PaymentGatewayComponent implements OnInit {
  cfg?: PaymentGatewayConfig;
  model: PaymentGatewayUpdate = { tmnCode: '', hashSecret: '', payUrl: '', returnUrl: '', enabled: true };
  error = '';
  msg = '';
  saving = false;

  constructor(private gateway: GatewayService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.gateway.get().subscribe({
      next: (c) => {
        this.cfg = c;
        this.model = {
          tmnCode: c.tmnCode || '', hashSecret: '',
          payUrl: c.payUrl || '', returnUrl: c.returnUrl || '', enabled: c.enabled
        };
      },
      error: (e) => { this.error = e?.error?.message || 'Không tải được cấu hình'; }
    });
  }

  save(): void {
    this.error = ''; this.msg = '';
    this.saving = true;
    this.gateway.update(this.model).subscribe({
      next: (c) => { this.saving = false; this.msg = 'Đã lưu cấu hình'; this.cfg = c; this.model.hashSecret = ''; },
      error: (e) => { this.saving = false; this.error = e?.error?.message || 'Lưu thất bại'; }
    });
  }
}
