import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HotelService } from '../../api/hotel.service';
import { Hotel } from '../../core/models';

@Component({
  selector: 'app-hotel-list',
  templateUrl: './hotel-list.component.html'
})
export class HotelListComponent implements OnInit {
  allHotels: Hotel[] = [];
  filtered: Hotel[] = [];
  pageHotels: Hotel[] = [];
  loading = false;
  error = '';

  // Bộ lọc
  q = '';               // thanh tìm kiếm (tên / thành phố / địa chỉ, không dấu)
  star = '';            // '' = tất cả, hoặc '1'..'5'
  city = '';            // '' = tất cả
  cities: string[] = []; // danh sách thành phố (sinh từ dữ liệu)

  // Phân trang
  page = 0;
  size = 20;

  constructor(private hotelService: HotelService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.hotelService.list().subscribe({
      next: (data) => {
        this.allHotels = data || [];
        this.cities = Array.from(
          new Set(this.allHotels.map((h) => h.city).filter((c): c is string => !!c))
        ).sort((a, b) => a.localeCompare(b, 'vi'));
        this.page = 0;
        this.recompute();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Không tải được danh sách';
        this.loading = false;
      }
    });
  }


  /** Bỏ dấu tiếng Việt để tìm không dấu (go "ha noi" ra "Hà Nội"). */
  private strip(s?: string | null): string {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  private recompute(): void {
    const q = this.strip(this.q);
    this.filtered = this.allHotels.filter((h) => {
      const okStar = !this.star || String(h.starRating) === this.star;
      const okCity = !this.city || h.city === this.city;
      const okQ = !q || this.strip(h.name).includes(q)
        || this.strip(h.city).includes(q) || this.strip(h.address).includes(q);
      return okStar && okCity && okQ;
    });
    const maxPage = Math.max(0, Math.ceil(this.filtered.length / this.size) - 1);
    if (this.page > maxPage) {
      this.page = maxPage;
    }
    const start = this.page * this.size;
    this.pageHotels = this.filtered.slice(start, start + this.size);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.size));
  }

  onSearch(): void { this.page = 0; this.recompute(); }

  onFilterChange(): void {
    this.page = 0;
    this.recompute();
  }

  clearFilters(): void {
    this.star = '';
    this.city = '';
    this.page = 0;
    this.recompute();
  }

  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.recompute();
    }
  }

  next(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.recompute();
    }
  }

  add(): void { this.router.navigate(['/hotels/new']); }
  edit(h: Hotel): void { this.router.navigate(['/hotels', h.id, 'edit']); }

  async remove(h: Hotel): Promise<void> {
    if (!h.id) { return; }
    if (!await window.appConfirm('Xoá khách sạn "' + h.name + '"?')) { return; }
    this.hotelService.remove(h.id).subscribe({
      next: () => this.load(),
      error: (err) => window.appAlert(err?.error?.message || 'Xoá thất bại')
    });
  }
}
