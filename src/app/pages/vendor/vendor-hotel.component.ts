import { Component, OnInit } from '@angular/core';
import { VendorService } from '../../api/vendor.service';
import { VendorHotel, VendorRoomType, InventoryDay, RoomTypeUpsert } from '../../core/vendor-models';

@Component({
  selector: 'app-vendor-hotel',
  templateUrl: './vendor-hotel.component.html'
})
export class VendorHotelComponent implements OnInit {
  hotel?: VendorHotel;
  roomTypes: VendorRoomType[] = [];
  loading = false;
  error = '';

  // form them/sua loai phong
  showForm = false;
  editingId: number | null = null;
  form: RoomTypeUpsert = this.emptyForm();
  saving = false;

  // ton kho
  selected?: VendorRoomType;
  invFrom = '';
  invTo = '';
  invRows: InventoryDay[] = [];
  invAvailable = 0;
  invPrice: number | null = null;
  invLoading = false;
  invError = '';
  invMsg = '';

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.vendorService.myHotel().subscribe({
      next: (h) => { this.hotel = h; this.loading = false; this.loadRoomTypes(); },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 404
          ? 'Tài khoản chưa gắn khách sạn nào.'
          : (err?.error?.message || 'Không tải được khách sạn');
      }
    });
  }

  loadRoomTypes(): void {
    this.vendorService.listRoomTypes().subscribe({
      next: (list) => { this.roomTypes = list; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được loại phòng'; }
    });
  }

  emptyForm(): RoomTypeUpsert {
    return { name: '', description: '', capacity: 2, basePrice: 0, currency: 'VND', totalRooms: 1 };
  }

  newRoomType(): void { this.editingId = null; this.form = this.emptyForm(); this.showForm = true; }

  editRoomType(rt: VendorRoomType): void {
    this.editingId = rt.id;
    this.form = {
      name: rt.name, description: rt.description || '', capacity: rt.capacity,
      basePrice: rt.basePrice, currency: rt.currency, totalRooms: rt.totalRooms
    };
    this.showForm = true;
  }

  cancelForm(): void { this.showForm = false; this.editingId = null; }

  saveRoomType(): void {
    this.saving = true;
    const obs = this.editingId == null
      ? this.vendorService.createRoomType(this.form)
      : this.vendorService.updateRoomType(this.editingId, this.form);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.editingId = null; this.loadRoomTypes(); },
      error: (err) => { this.saving = false; alert(err?.error?.message || 'Lưu thất bại'); }
    });
  }

  deleteRoomType(rt: VendorRoomType): void {
    if (!confirm('Xoá loại phòng "' + rt.name + '" (kèm toàn bộ tồn kho)?')) { return; }
    this.vendorService.deleteRoomType(rt.id).subscribe({
      next: () => {
        if (this.selected?.id === rt.id) { this.selected = undefined; this.invRows = []; }
        this.loadRoomTypes();
      },
      error: (err) => alert(err?.error?.message || 'Xoá thất bại')
    });
  }

  selectRoom(rt: VendorRoomType): void {
    this.selected = rt;
    this.invMsg = ''; this.invError = '';
    this.invAvailable = rt.totalRooms;
    this.invPrice = rt.basePrice;
    const today = new Date();
    const plus = new Date(); plus.setDate(plus.getDate() + 13);
    this.invFrom = this.toIso(today);
    this.invTo = this.toIso(plus);
    this.loadInventory();
  }

  loadInventory(): void {
    if (!this.selected) { return; }
    this.invLoading = true; this.invError = '';
    this.vendorService.getInventory(this.selected.id, this.invFrom, this.invTo).subscribe({
      next: (rows) => { this.invRows = rows; this.invLoading = false; },
      error: (err) => { this.invLoading = false; this.invError = err?.error?.message || 'Không tải được tồn kho'; }
    });
  }

  saveInventory(): void {
    if (!this.selected) { return; }
    this.invMsg = ''; this.invError = '';
    const body = { from: this.invFrom, to: this.invTo, availableRooms: this.invAvailable, price: this.invPrice ?? undefined };
    this.vendorService.setInventory(this.selected.id, body).subscribe({
      next: (rows) => { this.invRows = rows; this.invMsg = 'Đã cập nhật tồn kho cho khoảng ngày.'; },
      error: (err) => { this.invError = err?.error?.message || 'Cập nhật thất bại'; }
    });
  }

  private toIso(d: Date): string {
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
