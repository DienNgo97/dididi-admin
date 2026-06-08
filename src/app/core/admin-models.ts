// Models cho khu vuc admin (Phase 4b-2).

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalHotels: number;
  totalFlights: number;
  totalBookings: number;
  bookingsPendingPayment: number;
  bookingsConfirmed: number;
  bookingsCancelled: number;
  bookingsFailed: number;
  totalRevenue: number;
  recentBookings: AdminBooking[];
}

export interface AdminBooking {
  id: number;
  publicCode: string;
  userId: number;
  type: string;
  title: string;
  status: string;
  amount: number;
  currency: string;
  quantity: number;
  checkIn?: string;
  checkOut?: string;
  travelDate?: string;
  providerConfirmation?: string;
  createdAt?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  status: string;
  vendorId?: number;
  createdAt?: string;
}

export interface AdminFlight {
  id: number;
  flightNumber: string;
  airlineCode: string;
  from: string;
  to: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  currency?: string;
  availableSeats?: number;
  aircraftType?: string;
}
