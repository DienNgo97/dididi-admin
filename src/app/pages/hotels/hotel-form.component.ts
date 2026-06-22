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
    const done = {
      next: () => { this.saving = false; this.router.navigate(['/hotels']); },
      error: (err: any) => { this.saving = false; this.error = err?.error?.message || 'Lưu thất bại'; }
    };
    if (this.id) {
      this.hotelService.update(this.id, this.model).subscribe(done);
    } else {
      this.hotelService.create(this.model).subscribe(done);
    }
  }

  cancel(): void { this.router.navigate(['/hotels']); }
}
