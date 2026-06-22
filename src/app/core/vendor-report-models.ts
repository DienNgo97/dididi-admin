// Models cho báo cáo vendor (doanh thu / tồn kho / dashboard).

export interface SeriesPoint {
  label: string;
  revenue: number;
  bookings: number;
}

export interface RoomTypeRevenue {
  roomTypeId: number;
  name: string;
  revenue: number;
  bookings: number;
}

export interface GroupRow {
  group: string;
  total: number;
  counts: number[];
}

export interface GroupPreference {
  roomTypes: string[];
  rows: GroupRow[];
}

export interface RevenueReport {
  granularity: string;
  currency: string;
  totalRevenue: number;
  bookingCount: number;
  roomNights: number;
  avgOrderValue: number;
  series: SeriesPoint[];
  byRoomType: RoomTypeRevenue[];
  byTier: GroupPreference;
  bySegment: GroupPreference;
}

export interface RoomInventoryStat {
  roomTypeId: number;
  name: string;
  totalRooms: number;
  roomNightsBooked: number;
  roomNightsCapacity: number;
  occupancyPct: number;
  soldOutDays: number;
  lowDays: string[];
}

export interface InventoryReport {
  from: string;
  to: string;
  days: number;
  currency: string;
  rooms: RoomInventoryStat[];
}

export interface UpcomingCheckin {
  publicCode: string;
  title: string;
  checkIn: string;
  rooms: number;
  amount: number;
  roomTypeName: string;
}

export interface VendorDashboard {
  currency: string;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChangePct: number;
  thisMonthBookings: number;
  avgOrderValue: number;
  occupancyNext30Pct: number;
  avgRating: number;
  reviewCount: number;
  unansweredReviews: number;
  upcomingCheckins: UpcomingCheckin[];
  topRoomTypes: RoomTypeRevenue[];
  last30Days: SeriesPoint[];
}
