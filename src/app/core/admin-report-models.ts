export interface AdminReportPoint {
  label: string;
  revenue: number | null;
  count: number;
}

export interface AdminReport {
  metric: string;
  granularity: string;
  kind: 'REVENUE' | 'COUNT';
  currency: string;
  totalRevenue: number | null;
  totalCount: number;
  series: AdminReportPoint[];
}
