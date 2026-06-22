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
  pending = 0;
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
    const files = input.files ? Array.from(input.files).filter((f) => f.type.startsWith('image/')) : [];
    input.value = '';
    if (files.length === 0) { return; }
    this.error = '';
    this.uploading = true;
    this.pending = files.length;
    let failed = 0;
    // Upload tuan tu: backend dat sortOrder theo so anh hien co -> tranh dua nhau gay trung thu tu.
    const uploadAt = (i: number): void => {
      if (i >= files.length) {
        this.uploading = false;
        this.pending = 0;
        if (failed > 0) { this.error = 'Có ' + failed + ' ảnh tải không thành công.'; }
        return;
      }
      const obs = this.isAdmin()
        ? this.imageService.uploadForHotel(this.hotelId as number, files[i])
        : this.imageService.uploadMy(files[i]);
      obs.subscribe({
        next: (img) => { this.images = [...this.images, img]; this.pending--; uploadAt(i + 1); },
        error: () => { failed++; this.pending--; uploadAt(i + 1); }
      });
    };
    uploadAt(0);
  }

  async remove(img: HotelImage): Promise<void> {
    if (!await (window as any).appConfirm('Xoá ảnh này?')) { return; }
    const obs = this.isAdmin()
      ? this.imageService.deleteForHotel(this.hotelId as number, img.id)
      : this.imageService.deleteMy(img.id);
    obs.subscribe({
      next: () => { this.images = this.images.filter((i) => i.id !== img.id); },
      error: (err) => (window as any).appAlert(err?.error?.message || 'Xoá thất bại')
    });
  }

  absUrl(img: HotelImage): string {
    return this.imageService.absUrl(img);
  }
}
