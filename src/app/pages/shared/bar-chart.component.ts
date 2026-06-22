import { Component, Input } from '@angular/core';

/** Biểu đồ cột đơn giản bằng SVG (không cần thư viện ngoài). */
@Component({
  selector: 'app-bar-chart',
  template: `
    <div *ngIf="data && data.length; else empty">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + height" preserveAspectRatio="none"
           [style.height.px]="height" style="width:100%;display:block">
        <line [attr.x1]="0" [attr.y1]="height" [attr.x2]="W" [attr.y2]="height" stroke="#e7e9ee" stroke-width="2"/>
        <rect *ngFor="let d of data; let i = index"
              [attr.x]="x(i)" [attr.y]="y(d.value)" [attr.width]="bw" [attr.height]="barH(d.value)"
              [attr.fill]="color">
          <title>{{ d.label }}: {{ d.value | number:'1.0-0' }}{{ unit ? ' ' + unit : '' }}</title>
        </rect>
      </svg>
      <div *ngIf="showLabels" style="display:flex;margin-top:4px">
        <div *ngFor="let d of data"
             style="flex:1;text-align:center;font-size:10px;color:#6b7280;overflow:hidden;white-space:nowrap;padding:0 1px">
          {{ d.label }}
        </div>
      </div>
    </div>
    <ng-template #empty><p class="muted" style="margin:8px 0">Chưa có dữ liệu.</p></ng-template>
  `
})
export class BarChartComponent {
  @Input() data: { label: string; value: number }[] = [];
  @Input() color = '#3dac78';
  @Input() unit = '';
  @Input() height = 180;

  readonly W = 1000;

  private get max(): number {
    return Math.max(1, ...this.data.map((d) => d.value || 0));
  }
  private get slot(): number {
    return this.data.length ? this.W / this.data.length : this.W;
  }
  get bw(): number {
    return this.slot * 0.62;
  }
  get showLabels(): boolean {
    return this.data.length > 0 && this.data.length <= 14;
  }
  x(i: number): number {
    return i * this.slot + (this.slot - this.bw) / 2;
  }
  barH(v: number): number {
    const top = 4;
    return this.max > 0 ? ((v || 0) / this.max) * (this.height - top) : 0;
  }
  y(v: number): number {
    return this.height - this.barH(v);
  }
}
