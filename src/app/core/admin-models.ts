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
  cancelStatus?: string;
  cancelReason?: string;
  cancelAdminNote?: string;
}

export interface Refund {
  id: number;
  bookingId: number;
  paymentId?: number;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  processedBy?: number;
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

export interface AdminReview {
  id: number;
  rating: number;
  comment?: string;
  reviewerName?: string;
  status: string;       // PENDING | PUBLISHED | HIDDEN
  targetType: string;   // HOTEL | FLIGHT
  targetId: number;
  bookingId: number;
  vendorReply?: string;
  vendorReplyAt?: string;
  createdAt?: string;
  images?: string[];
  replyImages?: string[];
}

export interface AuditLog {
  id: number;
  actorUserId?: number;
  actorEmail?: string;
  action: string;
  targetType?: string;
  targetId?: number;
  detail?: string;
  createdAt?: string;
}

export interface Company {
  id: number;
  name: string;
  code: string;
  budgetTotal: number;
  budgetUsed: number;
  remaining: number;
  contactEmail?: string;
  taxCode?: string;
  address?: string;
  approvalThreshold?: number;
  active: boolean;
}

export interface CompanyUpsert {
  name: string;
  code: string;
  budgetTotal: number;
  contactEmail?: string;
  taxCode?: string;
  address?: string;
  approvalThreshold?: number;
  active?: boolean;
}

export interface CompanyEmployee {
  userId: number;
  email: string;
  fullName?: string;
  role?: string;
}

export interface CompanyBooking {
  publicCode: string;
  type?: string;
  title?: string;
  amount?: number;
  currency?: string;
  status?: string;
  userId?: number;
  createdAt?: string;
}

export interface CommissionConfig {
  defaultRate: number;
}

export interface VendorCommission {
  vendorId: number;
  vendorName?: string;
  vendorEmail?: string;
  rate: number;
}

export interface CommissionReportRow {
  vendorId: number;
  vendorName?: string;
  bookingCount: number;
  gross: number;
  rate: number;
  commission: number;
  net: number;
}

export interface CommissionReport {
  rows: CommissionReportRow[];
  totalGross: number;
  totalCommission: number;
  totalNet: number;
}

export interface PaymentGatewayConfig {
  provider: string;
  tmnCode?: string;
  hashSecretMasked?: string;
  payUrl?: string;
  returnUrl?: string;
  enabled: boolean;
}

export interface PaymentGatewayUpdate {
  tmnCode?: string;
  hashSecret?: string;
  payUrl?: string;
  returnUrl?: string;
  enabled?: boolean;
}

export interface CreateAdminRequest {
  email: string;
  fullName?: string;
  password: string;
  role: string;
}

export interface ApprovalRequest {
  id: number;
  bookingCode?: string;
  bookingTitle?: string;
  companyId: number;
  companyName?: string;
  requestedByEmail?: string;
  amount: number;
  status: string;
  decisionNote?: string;
  createdAt?: string;
}

export interface CompanyInvite {
  id: number;
  companyId: number;
  email: string;
  token: string;
  status: string;
  expiresAt?: string;
  acceptUrl: string;
}

// ---- Voucher / Mã giảm giá (nice-to-have) ----
export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  active: boolean;
}

export interface VoucherUpsert {
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  active: boolean;
}

// ===== Lịch sử chat hỗ trợ (chatbot) =====
export interface SupportStats {
  totalMessages: number;
  totalQuestions: number;
  totalConversations: number;
  escalatedConversations: number;
  escalationRate: number;
  kbAnswers: number;
  llmAnswers: number;
  unresolvedAnswers: number;
  agentMessages: number;
}

export interface SupportConversation {
  conversationId: string;
  messageCount: number;
  startedAt: string;
  lastAt: string;
  escalated: boolean;
  userId: number | null;
}

export interface SupportChatMessage {
  id: number;
  role: string;
  content: string;
  source: string | null;
  escalated: boolean;
  bookingCode: string | null;
  userId: number | null;
  createdAt: string;
}
