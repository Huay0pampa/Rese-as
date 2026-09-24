export type TenantMode = 'DIRECT' | 'SMART_LANDING';

export type DeviceType = 'Mobile' | 'Desktop' | 'Tablet' | 'Unknown';

export interface Tenant {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  google_review_url: string;
  place_id?: string | null;
  license_key?: string | null;
  whatsapp_number?: string | null;
  instagram_url?: string | null;
  mode: TenantMode;
  logo_url?: string | null;
  accent_color?: string;
  custom_message?: string;
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  review_url: string;
}

export interface SuperAdminMetrics {
  totalTenants: number;
  activeTenants: number;
  totalScansGlobal: number;
  scansTodayGlobal: number;
  directModeCount: number;
  smartLandingModeCount: number;
  estimatedMRR: number;
}

export interface ScanAnalytics {
  id: string;
  tenant_id: string;
  user_agent?: string | null;
  device_type: DeviceType;
  country: string;
  city?: string | null;
  referrer?: string | null;
  scanned_at: string;
}

export interface AnalyticsSummary {
  total_scans: number;
  scans_today: number;
  scans_last_7_days: number;
  devices: {
    Mobile: number;
    Desktop: number;
    Tablet: number;
    Unknown?: number;
  };
  countries: Record<string, number>;
  recent_scans: ScanAnalytics[];
}

export interface GoogleUrlValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  formatType: 'g.page' | 'place_id' | 'maps_app' | 'google_search' | 'generic' | 'invalid';
  errorMessage?: string;
  warningMessage?: string;
}
