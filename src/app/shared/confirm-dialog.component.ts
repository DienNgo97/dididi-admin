import { Component } from '@angular/core';

type DialogMode = 'confirm' | 'prompt' | 'alert';

/**
 * Hộp thoại dùng chung cho admin (thay confirm()/prompt()/alert() native, đồng bộ tông Dididi).
 * Đăng ký 3 hàm toàn cục, đặt 1 lần trong app.component.html: <app-confirm-dialog></app-confirm-dialog>
 *
 *   if (!await (window as any).appConfirm('...')) { return; }        // -> Promise<boolean>
 *   const v = await (window as any).appPrompt('Lý do:', 'mặc định'); // -> Promise<string|null> (null = Huỷ)
 *   (window as any).appAlert('Thao tác thất bại');                   // -> Promise<void>
 */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="cfm-backdrop" *ngIf="visible" (click)="onBackdrop()">
      <div class="cfm-box" (click)="$event.stopPropagation()">
        <h3 class="cfm-title">{{ title }}</h3>
        <p class="cfm-msg" *ngIf="message">{{ message }}</p>
        <input *ngIf="mode === 'prompt'" #promptInput class="cfm-input" type="text"
               [(ngModel)]="inputValue" (keyup.enter)="onOk()" />
        <div class="cfm-actions">
          <button type="button" class="cfm-cancel" *ngIf="mode !== 'alert'" (click)="onCancel()">Huỷ</button>
          <button type="button" class="cfm-ok" (click)="onOk()">{{ okLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cfm-backdrop{position:fixed;inset:0;background:rgba(16,36,59,.5);display:flex;align-items:center;justify-content:center;z-index:2000;padding:16px}
    .cfm-box{background:#fff;max-width:420px;width:100%;border-radius:14px;padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.3)}
    .cfm-title{margin:0 0 8px;font-size:18px;color:#16382a}
    .cfm-msg{margin:0 0 14px;color:#333;font-size:14px;line-height:1.6;white-space:pre-line}
    .cfm-input{width:100%;box-sizing:border-box;margin:0 0 18px;padding:10px 12px;border:1px solid #cfd6e2;border-radius:8px;font-size:14px}
    .cfm-input:focus{outline:0;border-color:#3dac78;box-shadow:0 0 0 3px rgba(61,172,120,.15)}
    .cfm-actions{display:flex;gap:10px;justify-content:flex-end}
    .cfm-actions button{padding:9px 16px;border-radius:8px;cursor:pointer;font-size:14px}
    .cfm-cancel{border:1px solid #cfd6e2;background:#fff;color:#16382a}
    .cfm-ok{border:0;background:#3dac78;color:#fff;font-weight:600}
  `]
})
export class ConfirmDialogComponent {
  visible = false;
  mode: DialogMode = 'confirm';
  title = 'Xác nhận';
  message = '';
  okLabel = 'Đồng ý';
  inputValue = '';
  private resolver: ((v: any) => void) | null = null;

  constructor() {
    (window as any).appConfirm = (message: string) => this.openConfirm(message);
    (window as any).appPrompt = (message: string, def = '') => this.openPrompt(message, def);
    (window as any).appAlert = (message: string) => this.openAlert(message);
  }

  openConfirm(message: string): Promise<boolean> {
    this.mode = 'confirm';
    this.title = 'Xác nhận';
    this.okLabel = 'Đồng ý';
    this.inputValue = '';
    return this.open(message);
  }

  openPrompt(message: string, def: string): Promise<string | null> {
    this.mode = 'prompt';
    this.title = 'Nhập thông tin';
    this.okLabel = 'OK';
    this.inputValue = def || '';
    return this.open(message);
  }

  openAlert(message: string): Promise<void> {
    this.mode = 'alert';
    this.title = 'Thông báo';
    this.okLabel = 'OK';
    this.inputValue = '';
    return this.open(message);
  }

  private open(message: string): Promise<any> {
    this.message = message;
    this.visible = true;
    return new Promise<any>((res) => { this.resolver = res; });
  }

  /** Bấm ra ngoài = huỷ: confirm->false, prompt->null, alert->đóng. */
  onBackdrop(): void {
    if (this.mode === 'prompt') { this.settle(null); }
    else if (this.mode === 'alert') { this.settle(undefined); }
    else { this.settle(false); }
  }

  onCancel(): void {
    this.settle(this.mode === 'prompt' ? null : false);
  }

  onOk(): void {
    if (this.mode === 'prompt') { this.settle(this.inputValue); }
    else if (this.mode === 'alert') { this.settle(undefined); }
    else { this.settle(true); }
  }

  private settle(v: any): void {
    this.visible = false;
    const r = this.resolver;
    this.resolver = null;
    if (r) { r(v); }
  }
}
