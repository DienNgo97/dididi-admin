import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HotelService } from '../../api/hotel.service';
import { Hotel } from '../../core/models';

@Component({
  selector: 'app-hotel-list',
  templateUrl: './hotel-list.component.html'
})
export class HotelListComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = false;
  error = '';

  constructor(private hotelService: HotelService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.hotelService.list().subscribe({
      next: (data) => { this.hotels = data; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  add(): void { this.router.navigate(['/hotels/new']); }
  edit(h: Hotel): void { this.router.navigate(['/hotels', h.id, 'edit']); }

  remove(h: Hotel): void {
    if (!h.id) { return; }
    if (!confirm('Xoá khách sạn "' + h.name + '"?')) { return; }
    this.hotelService.remove(h.id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err?.error?.message || 'Xoá thất bại')
    });
  }
}
