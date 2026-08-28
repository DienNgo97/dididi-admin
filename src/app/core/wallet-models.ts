/** Ví doanh thu vendor (VW6) — model khớp DTO backend (/api/vendor/v1/wallet, /api/admin/v1/payouts). */

export interface WalletSummary {
  total: number;
  available: number;
  pending: number;
  held: number;
  payoutHolding: number;
  minPayout: number;
  hasBankAccount: boolean;
  bankName?: string | null;
  bankAccountMasked?: string | null;
  bankAccountHolder?: string | null;
}

export interface LedgerEntry {
  id: number;
  type: 'EARNING' | 'REVERSAL' | 'PAYOUT';
  bookingId?: number | null;
  bookingCode?: string | null;
  gross?: number | null;
  commissionRate?: number | null;
  commissionAmount?: number | null;
  netAmount: number;
  availableFrom: string;
  createdAt?: string;
}

export interface Payout {
  id: number;
  amount: number;
  currency: string;
  status: 'REQUESTED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  bankName: string;
  bankAccountMasked: string;
  bankAccountHolder: string;
  transactionRef?: string | null;
  failReason?: string | null;
  createdAt?: string;
  processedAt?: string | null;
  vendorEmail?: string | null;
  vendorName?: string | null;
}
