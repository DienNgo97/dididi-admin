import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelService } from '../../api/hotel.service';
import { Hotel } from '../../core/models';

@Component({
  selector: 'app-hotel-form',
  templateUrl: './hotel-form.component.html'
})
export class HotelFormComponent implements OnInit {
  model: Hotel = { name: '', city: '', address: '', description: '', starRating: 3, active: true };
  id?: number;
  error = '';
  saving = false;

  constructor(private hotelService: HotelService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.hotelService.get(this.id).subscribe({
        next: (h) => { this.model = { ...h }; },   // dùng đúng active load về (không ép = true)
        error: (err) => { this.error = err?.error?.message || 'Không tải được khách sạn'; }
      });
    }
  }

  save(): void {
    this.error = '';
    this.saving = true;
    // QA TC-C-12: model được load từ API PUBLIC nên amenities là object {name, label...},
    // còn API admin (PUT) chờ mảng CHUỖI mã enum -> chuẩn hoá trước khi gửi, nếu không
    // Jackson vỡ ở HotelUpsertRequest.amenities và trả 500 "Something went wrong".
    const m: any = { ...this.model };
    if (Array.isArray(m.amenities)) {
      m.amenities = m.amenities.map((a: any) => (typeof a === 'string' ? a : (a?.code ?? a?.name))).filter(Boolean);
    }
    if (Array.isArray(m.tags)) {
      m.tags = m.tags.map((t: any) => (typeof t === 'string' ? t : (t?.code ?? t?.name))).filter(Boolean);
    }
    const done = {
      next: () => { this.saving = false; this.router.navigate(['/hotels']); },
      error: (err: any) => { this.saving = false; this.error = err?.error?.message || 'Lưu thất bại'; }
    };
    if (this.id) {
      this.hotelService.update(this.id, m).subscribe(done);
    } else {
      this.hotelService.create(m).subscribe(done);
    }
  }

  cancel(): void { this.router.navigate(['/hotels']); }
}
