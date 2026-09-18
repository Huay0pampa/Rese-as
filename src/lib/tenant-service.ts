import { supabase, isSupabaseConfigured } from './supabase';
import { getSupabaseEdgeClient } from './supabase-edge';
import { Tenant, ScanAnalytics, AnalyticsSummary, TenantMode, DeviceType, SuperAdminMetrics } from '@/types';

// In-memory fallback / demo cache to allow immediate local testing & offline fallback
let demoTenants: Tenant[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Café & Bistro La Terraza',
    slug: 'cafe-la-terraza',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    whatsapp_number: '+51987654321',
    instagram_url: 'https://instagram.com/laterraza_cafe',
    mode: 'DIRECT',
    logo_url: null,
    accent_color: '#2563eb',
    custom_message: '¡Gracias por visitarnos! Tu reseña nos ayuda a seguir brindándote la mejor experiencia.',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Restaurante Fuego & Sabor',
    slug: 'fuego-y-sabor',
    google_review_url: 'https://g.page/r/CU2f3v73kZ8_EAE/review',
    whatsapp_number: '+525512345678',
    instagram_url: 'https://instagram.com/fuegoy_sabor',
    mode: 'SMART_LANDING',
    logo_url: null,
    accent_color: '#ea580c',
    custom_message: '¿Cómo estuvo tu comida hoy? Queremos escuchar tu opinión sincera.',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let demoScans: ScanAnalytics[] = [
  {
    id: 's1',
    tenant_id: '11111111-1111-4111-8111-111111111111',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    device_type: 'Mobile',
    country: 'PE',
    scanned_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 's2',
    tenant_id: '11111111-1111-4111-8111-111111111111',
    user_agent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B)',
    device_type: 'Mobile',
    country: 'PE',
    scanned_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 's3',
    tenant_id: '11111111-1111-4111-8111-111111111111',
    user_agent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
    device_type: 'Tablet',
    country: 'PE',
    scanned_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 's4',
    tenant_id: '11111111-1111-4111-8111-111111111111',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    device_type: 'Desktop',
    country: 'ES',
    scanned_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 's5',
    tenant_id: '11111111-1111-4111-8111-111111111111',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6)',
    device_type: 'Mobile',
    country: 'US',
    scanned_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
];

/**
 * Fetch a tenant by its unique slug (Used by Edge redirection & Smart Landing).
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseEdgeClient();
      const { data, error } = await client
        .from('tenants')
        .select('*')
        .eq('slug', normalizedSlug)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        return data as Tenant;
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback / local demo lookup
  const match = demoTenants.find(t => t.slug.toLowerCase() === normalizedSlug);
  return match || null;
}

/**
 * Fetch a tenant by its ID.
 */
export async function getTenantById(id: string): Promise<Tenant | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return data as Tenant;
    } catch {
      // Fallback below
    }
  }

  return demoTenants.find(t => t.id === id) || null;
}

/**
 * Get all tenants for the current session/user.
 */
export async function getAllTenants(): Promise<Tenant[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Tenant[];
      }
    } catch {
      // Fallback
    }
  }

  return [...demoTenants];
}

/**
 * Create or save a new tenant.
 */
export async function saveTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
  const now = new Date().toISOString();
  const slug = tenantData.slug || tenantData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'negocio';

  const newTenant: Tenant = {
    id: tenantData.id || crypto.randomUUID(),
    name: tenantData.name || 'Mi Negocio',
    slug,
    google_review_url: tenantData.google_review_url || 'https://maps.google.com',
    whatsapp_number: tenantData.whatsapp_number || null,
    instagram_url: tenantData.instagram_url || null,
    mode: tenantData.mode || 'DIRECT',
    logo_url: tenantData.logo_url || null,
    accent_color: tenantData.accent_color || '#2563eb',
    custom_message: tenantData.custom_message || '¡Gracias por visitarnos!',
    is_active: true,
    created_at: tenantData.created_at || now,
    updated_at: now,
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .upsert(newTenant)
        .select()
        .single();

      if (!error && data) {
        return data as Tenant;
      }
    } catch {
      // Fallback
    }
  }

  // Update in-memory fallback demo
  const index = demoTenants.findIndex(t => t.id === newTenant.id || t.slug === newTenant.slug);
  if (index >= 0) {
    demoTenants[index] = newTenant;
  } else {
    demoTenants.unshift(newTenant);
  }

  return newTenant;
}

/**
 * Update tenant mode ('DIRECT' vs 'SMART_LANDING').
 */
export async function updateTenantMode(id: string, mode: TenantMode): Promise<Tenant | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({ mode, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) return data as Tenant;
    } catch {
      // Fallback
    }
  }

  const tenant = demoTenants.find(t => t.id === id);
  if (tenant) {
    tenant.mode = mode;
    tenant.updated_at = new Date().toISOString();
    return tenant;
  }
  return null;
}

/**
 * Record a scan event in scan_analytics asynchronously.
 */
export async function recordScanEvent(
  tenantId: string,
  userAgent?: string | null,
  deviceType: DeviceType = 'Mobile',
  country: string = 'Unknown',
  city?: string | null
): Promise<void> {
  const scanRecord: ScanAnalytics = {
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    user_agent: userAgent || null,
    device_type: deviceType,
    country: country || 'Unknown',
    city: city || null,
    scanned_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseEdgeClient();
      await client.from('scan_analytics').insert([scanRecord]);
      return;
    } catch {
      // Fallback
    }
  }

  // Fallback demo storage
  demoScans.unshift(scanRecord);
  if (demoScans.length > 500) demoScans.pop();
}

/**
 * Get aggregated analytics for a tenant.
 */
export async function getTenantAnalytics(tenantId: string): Promise<AnalyticsSummary> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('scan_analytics')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('scanned_at', { ascending: false });

      if (!error && data) {
        return buildAnalyticsSummary(data as ScanAnalytics[]);
      }
    } catch {
      // Fallback
    }
  }

  const tenantScans = demoScans.filter(s => s.tenant_id === tenantId);
  return buildAnalyticsSummary(tenantScans);
}

function buildAnalyticsSummary(scans: ScanAnalytics[]): AnalyticsSummary {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  let scansToday = 0;
  let scansLast7Days = 0;
  const devices = { Mobile: 0, Desktop: 0, Tablet: 0, Unknown: 0 };
  const countries: Record<string, number> = {};

  for (const scan of scans) {
    const scanTime = new Date(scan.scanned_at).getTime();
    if (scanTime >= oneDayAgo) scansToday++;
    if (scanTime >= sevenDaysAgo) scansLast7Days++;

    const dev = scan.device_type || 'Mobile';
    devices[dev] = (devices[dev] || 0) + 1;

    const c = scan.country || 'Desconocido';
    countries[c] = (countries[c] || 0) + 1;
  }

  return {
    total_scans: scans.length,
    scans_today: scansToday,
    scans_last_7_days: scansLast7Days,
    devices,
    countries,
    recent_scans: scans.slice(0, 10),
  };
}

/**
 * SuperAdmin: Get global metrics across all tenants
 */
export async function getSuperAdminMetrics(): Promise<SuperAdminMetrics> {
  let allTenants: Tenant[] = [];
  let allScans: ScanAnalytics[] = [];

  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseEdgeClient();
      const { data: tData } = await client.from('tenants').select('*');
      const { data: sData } = await client.from('scan_analytics').select('*');
      if (tData) allTenants = tData as Tenant[];
      if (sData) allScans = sData as ScanAnalytics[];
    } catch {
      allTenants = [...demoTenants];
      allScans = [...demoScans];
    }
  } else {
    allTenants = [...demoTenants];
    allScans = [...demoScans];
  }

  const activeTenants = allTenants.filter(t => t.is_active !== false).length;
  const directModeCount = allTenants.filter(t => t.mode === 'DIRECT').length;
  const smartLandingModeCount = allTenants.filter(t => t.mode === 'SMART_LANDING').length;

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const scansTodayGlobal = allScans.filter(s => new Date(s.scanned_at).getTime() >= oneDayAgo).length;

  // Estimated MRR: Free $0, Pro $19, Enterprise $49 (defaults to $19 for active demo)
  const estimatedMRR = allTenants.reduce((acc, t) => {
    if (t.plan === 'ENTERPRISE') return acc + 49;
    if (t.plan === 'PRO') return acc + 19;
    return acc + (t.is_active ? 19 : 0);
  }, 0);

  return {
    totalTenants: allTenants.length,
    activeTenants,
    totalScansGlobal: allScans.length,
    scansTodayGlobal,
    directModeCount,
    smartLandingModeCount,
    estimatedMRR,
  };
}

/**
 * SuperAdmin: Get all tenants with individual scan counts
 */
export async function getAllTenantsWithStats(): Promise<(Tenant & { scan_count: number })[]> {
  let allTenants: Tenant[] = [];
  let allScans: ScanAnalytics[] = [];

  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseEdgeClient();
      const { data: tData } = await client.from('tenants').select('*').order('created_at', { ascending: false });
      const { data: sData } = await client.from('scan_analytics').select('tenant_id');
      if (tData) allTenants = tData as Tenant[];
      if (sData) allScans = sData as ScanAnalytics[];
    } catch {
      allTenants = [...demoTenants];
      allScans = [...demoScans];
    }
  } else {
    allTenants = [...demoTenants];
    allScans = [...demoScans];
  }

  const scanCounts: Record<string, number> = {};
  for (const s of allScans) {
    scanCounts[s.tenant_id] = (scanCounts[s.tenant_id] || 0) + 1;
  }

  return allTenants.map(t => ({
    ...t,
    scan_count: scanCounts[t.id] || 0,
    plan: t.plan || 'PRO',
  }));
}

/**
 * SuperAdmin: Toggle active/suspended status of a business
 */
export async function toggleTenantStatus(id: string, isActive: boolean): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseEdgeClient();
      await client.from('tenants').update({ is_active: isActive }).eq('id', id);
      return true;
    } catch {
      // Fallback
    }
  }

  const match = demoTenants.find(t => t.id === id);
  if (match) {
    match.is_active = isActive;
    return true;
  }
  return false;
}

/**
 * SuperAdmin: Update tenant subscription plan
 */
export async function updateTenantPlan(id: string, plan: 'FREE' | 'PRO' | 'ENTERPRISE'): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseEdgeClient();
      await client.from('tenants').update({ plan }).eq('id', id);
      return true;
    } catch {
      // Fallback
    }
  }

  const match = demoTenants.find(t => t.id === id);
  if (match) {
    match.plan = plan;
    return true;
  }
  return false;
}

/**
 * SuperAdmin: Global recent scans feed
 */
export async function getGlobalRecentScans(): Promise<(ScanAnalytics & { tenant_name?: string })[]> {
  let allTenants: Tenant[] = [];
  let allScans: ScanAnalytics[] = [];

  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseEdgeClient();
      const { data: tData } = await client.from('tenants').select('id, name');
      const { data: sData } = await client.from('scan_analytics').select('*').order('scanned_at', { ascending: false }).limit(25);
      if (tData) allTenants = tData as Tenant[];
      if (sData) allScans = sData as ScanAnalytics[];
    } catch {
      allTenants = [...demoTenants];
      allScans = [...demoScans];
    }
  } else {
    allTenants = [...demoTenants];
    allScans = [...demoScans];
  }

  const tenantMap = new Map(allTenants.map(t => [t.id, t.name]));

  return allScans.slice(0, 25).map(s => ({
    ...s,
    tenant_name: tenantMap.get(s.tenant_id) || 'Negocio Registrado',
  }));
}
