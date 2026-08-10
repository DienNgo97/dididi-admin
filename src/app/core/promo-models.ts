/** Khuyến mãi cá nhân hoá — model khớp DTO backend (/api/admin/v1/promo). */

export interface PromoCampaign {
  id: number;
  type: string;            // BIRTHDAY | WIN_BACK | TIER_REWARD | WELCOME
  typeName: string;        // tên tiếng Việt
  enabled: boolean;
  title: string;
  description?: string | null;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  validDays: number;
  thresholdDays: number;
  minTier?: string | null;
  grantedTotal: number;
}

export interface PromoGrant {
  id: number;
  type: string;
  typeName: string;
  userId: number;
  userEmail?: string | null;
  userName?: string | null;
  voucherCode: string;
  cycleKey: string;
  note?: string | null;
  grantedAt: string;
}
