// Models cho khu vendor + admin quan ly vendor (Phase 7d).

export interface VendorHotel {
  id: number;
  name: string;
  city?: string;
  address?: string;
  description?: string;
  starRating?: number;
  minPrice?: number;
  currency?: string;
}

export interface VendorRoomType {
  id: number;
  hotelId: number;
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
  currency: string;
  totalRooms: number;
}

export interface InventoryDay {
  date: string;          // YYYY-MM-DD
  availableRooms: number;
  price?: number;
}

export interface RoomTypeUpsert {
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
  currency?: string;
  totalRooms: number;
}

export interface SetInventory {
  from: string;
  to: string;
  availableRooms: number;
  price?: number;
}

export interface VendorAccount {
  userId: number;
  email: string;
  fullName?: string;
  status: string;        // ACTIVE / INACTIVE (cho duyet) / LOCKED (tu choi)
  hotelId?: number;
  hotelName?: string;
  hotelActive: boolean;
}
