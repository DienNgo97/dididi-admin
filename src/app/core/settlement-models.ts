/** Đối soát công nợ B2B đối tác API (ST4) — khớp DTO backend /api/admin/v1/settlements. */

export interface SettlementRow {
  partnerCode: string;
  partnerName: string;
  kind: 'PARTNER' | 'PLATFORM' | 'WALLET';
  bookingCount: number;
  gross: number;
  commissionRate?: number | null;
  commissionAmount?: number | null;
  netPayable: number;
  status: 'OPEN' | 'CLOSED' | 'PAID' | 'N/A';
  closable: boolean;
  paymentRef?: string | null;
}

export interface SettlementOverview {
  periodYm: string;
  totalCount: number;
  totalGross: number;
  vendorWalletGross: number;
  partnerGross: number;
  platformGross: number;
  orphanGross: number;
  orphanCount: number;
  balanced: boolean;
  /** Đơn CONFIRMED không có mốc ngày dịch vụ -> không thuộc kỳ nào (P1-2). */
  undatableCount: number;
  undatableGross: number;
  periodClosable: boolean;
}

export interface SettlementPeriodView {
  overview: SettlementOverview;
  rows: SettlementRow[];
}
