import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
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
export class HotelImageManagerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() hotelId?: number;

  private destroy$ = new Subject<void>();
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    obs.pipe(takeUntil(this.destroy$)).subscribe({
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
        // finalize() o moi buoc da dam bao reset uploading; reset lai cho chac va dong bo lai server.
        this.uploading = false;
        this.pending = 0;
        if (failed > 0) { this.error = 'Có ' + failed + ' ảnh tải không thành công.'; }
        // Tai lai tu server de thu tu gallery khop sortOrder backend gan (tranh lech khi co anh loi giua chung).
        this.load();
        return;
      }
      const obs = this.isAdmin()
        ? this.imageService.uploadForHotel(this.hotelId as number, files[i])
        : this.imageService.uploadMy(files[i]);
      // finalize() luon chay (next/error/unsubscribe) -> uploading khong bao gio ket cung "true".
      obs.pipe(takeUntil(this.destroy$), finalize(() => { this.uploading = false; })).subscribe({
        next: (img) => { this.images = [...this.images, img]; this.pending--; uploadAt(i + 1); },
        error: () => { failed++; this.pending--; uploadAt(i + 1); }
      });
    };
    uploadAt(0);
  }

  async remove(img: HotelImage): Promise<void> {
    if (!await window.appConfirm('Xoá ảnh này?')) { return; }
    const obs = this.isAdmin()
      ? this.imageService.deleteForHotel(this.hotelId as number, img.id)
      : this.imageService.deleteMy(img.id);
    obs.subscribe({
      next: () => { this.images = this.images.filter((i) => i.id !== img.id); },
      error: (err) => window.appAlert(err?.error?.message || 'Xoá thất bại')
    });
  }

  absUrl(img: HotelImage): string {
    return this.imageService.absUrl(img);
  }
}
