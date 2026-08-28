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
  periodClosable: boolean;
}

export interface SettlementPeriodView {
  overview: SettlementOverview;
  rows: SettlementRow[];
}
