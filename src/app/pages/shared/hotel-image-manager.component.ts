import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { HotelImageService } from '../../api/hotel-image.service';
import { HotelImage } from '../../core/models';

/**
 * Quan ly gallery anh khach san (dung lai cho ca vendor lan admin):
 * - Khong truyen hotelId  -> che do VENDOR (KS cua chinh minh).
 * - Truyen [hotelId]       -> che do ADMIN (KS chi dinh).
 */
@Component({
  selector: 'app-hotel-image-manager',
  templateUrl: './hotel-image-manager.component.html'
})
export class HotelImageManagerComponent implements OnInit, OnChanges {
  @Input() hotelId?: number;

  images: HotelImage[] = [];
  loading = false;
  uploading = false;
  error = '';

  constructor(private imageService: HotelImageService) {}

  ngOnInit(): void {
    if (this.hotelId == null) {
      this.load(); // che do vendor: tai 1 lan
    }
  }

  ngOnChanges(): void {
    if (this.hotelId != null) {
      this.load(); // che do admin: tai lai khi doi KS
    }
  }

  private isAdmin(): boolean {
    return this.hotelId != null;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const obs = this.isAdmin()
      ? this.imageService.listForHotel(this.hotelId as number)
      : this.imageService.listMy();
    obs.subscribe({
      next: (list) => { this.images = list; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được ảnh'; this.loading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) { return; }
    this.uploading = true;
    this.error = '';
    const obs = this.isAdmin()
      ? this.imageService.uploadForHotel(this.hotelId as number, file)
      : this.imageService.uploadMy(file);
    obs.subscribe({
      next: (img) => { this.images = [...this.images, img]; this.uploading = false; input.value = ''; },
      error: (err) => { this.uploading = false; input.value = ''; this.error = err?.error?.message || 'Tải ảnh thất bại'; }
    });
  }

  remove(img: HotelImage): void {
    if (!confirm('Xoá ảnh này?')) { return; }
    const obs = this.isAdmin()
      ? this.imageService.deleteForHotel(this.hotelId as number, img.id)
      : this.imageService.deleteMy(img.id);
    obs.subscribe({
      next: () => { this.images = this.images.filter((i) => i.id !== img.id); },
      error: (err) => alert(err?.error?.message || 'Xoá thất bại')
    });
  }

  absUrl(img: HotelImage): string {
    return this.imageService.absUrl(img);
  }
}
