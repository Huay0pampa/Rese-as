-- ============================================================================
-- SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Project: SaaS B2B Reseñas & Fidelización en Tiempo Real con QRs Dinámicos
-- Engine: Ultra-Low Latency (<100ms) Redirection & Smart Landing
-- ============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS TABLE (Negocios / Comercios)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  google_review_url TEXT NOT NULL,
  whatsapp_number TEXT,
  instagram_url TEXT,
  mode TEXT NOT NULL DEFAULT 'DIRECT' CHECK (mode IN ('DIRECT', 'SMART_LANDING')),
  logo_url TEXT,
  accent_color TEXT DEFAULT '#2563eb',
  custom_message TEXT DEFAULT '¡Gracias por visitarnos! Tu opinión nos ayuda a crecer.',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast slug lookups (<5ms in DB) and multi-tenant queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (LOWER(slug));
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants (user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_active_slug ON public.tenants (slug) WHERE is_active = true;

-- 2. SCAN ANALYTICS TABLE (Eventos de Escaneo de QR en Tiempo Real)
CREATE TABLE IF NOT EXISTS public.scan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_agent TEXT,
  device_type TEXT NOT NULL DEFAULT 'Mobile' CHECK (device_type IN ('Mobile', 'Desktop', 'Tablet', 'Unknown')),
  country TEXT DEFAULT 'Unknown',
  city TEXT,
  referrer TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for real-time analytics aggregation & time-series charting
CREATE INDEX IF NOT EXISTS idx_scan_analytics_tenant_id ON public.scan_analytics (tenant_id);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_tenant_scanned_at ON public.scan_analytics (tenant_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_device ON public.scan_analytics (tenant_id, device_type);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_country ON public.scan_analytics (tenant_id, country);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_analytics ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- TENANTS POLICIES
-- ----------------------------------------------------------------------------

-- Policy 1: Authenticated users can view only their own tenants
CREATE POLICY "Users can view their own tenants"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Public read access for the Edge Redirection Engine & Smart Landing
-- Allows unauthenticated QR scanners to fetch destination URL and configuration
CREATE POLICY "Public read access for active tenants by slug"
  ON public.tenants FOR SELECT
  TO anon, public
  USING (is_active = true);

-- Policy 3: Authenticated users can create new tenants
CREATE POLICY "Users can insert their own tenants"
  ON public.tenants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can update their own tenants
CREATE POLICY "Users can update their own tenants"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Authenticated users can delete their own tenants
CREATE POLICY "Users can delete their own tenants"
  ON public.tenants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- SCAN ANALYTICS POLICIES
-- ----------------------------------------------------------------------------

-- Policy 1: Tenant owners can view analytics for their businesses
CREATE POLICY "Owners can view analytics for their tenants"
  ON public.scan_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE public.tenants.id = public.scan_analytics.tenant_id
      AND public.tenants.user_id = auth.uid()
    )
  );

-- Policy 2: Anyone (QR Scanner / Edge Engine / Anonymous) can insert a scan event
CREATE POLICY "Public can insert scan analytics events"
  ON public.scan_analytics FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (true);

-- Policy 3: Owners can purge or delete analytics if needed
CREATE POLICY "Owners can delete their scan analytics"
  ON public.scan_analytics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE public.tenants.id = public.scan_analytics.tenant_id
      AND public.tenants.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update `updated_at` timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tenant_updated
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Analytics aggregation RPC for ultra fast dashboard loading
CREATE OR REPLACE FUNCTION public.get_tenant_analytics_summary(target_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_scans BIGINT;
  scans_today BIGINT;
  scans_last_7_days BIGINT;
  device_stats JSONB;
  country_stats JSONB;
BEGIN
  -- Total Scans
  SELECT COUNT(*) INTO total_scans
  FROM public.scan_analytics
  WHERE tenant_id = target_tenant_id;

  -- Scans Today
  SELECT COUNT(*) INTO scans_today
  FROM public.scan_analytics
  WHERE tenant_id = target_tenant_id
    AND scanned_at >= date_trunc('day', NOW());

  -- Scans Last 7 Days
  SELECT COUNT(*) INTO scans_last_7_days
  FROM public.scan_analytics
  WHERE tenant_id = target_tenant_id
    AND scanned_at >= (NOW() - INTERVAL '7 days');

  -- Device breakdown
  SELECT jsonb_object_agg(device_type, count) INTO device_stats
  FROM (
    SELECT device_type, COUNT(*) as count
    FROM public.scan_analytics
    WHERE tenant_id = target_tenant_id
    GROUP BY device_type
  ) d;

  -- Country breakdown (Top 5)
  SELECT jsonb_object_agg(country, count) INTO country_stats
  FROM (
    SELECT COALESCE(country, 'Unknown') as country, COUNT(*) as count
    FROM public.scan_analytics
    WHERE tenant_id = target_tenant_id
    GROUP BY country
    ORDER BY count DESC
    LIMIT 5
  ) c;

  RETURN jsonb_build_object(
    'total_scans', COALESCE(total_scans, 0),
    'scans_today', COALESCE(scans_today, 0),
    'scans_last_7_days', COALESCE(scans_last_7_days, 0),
    'devices', COALESCE(device_stats, '{}'::jsonb),
    'countries', COALESCE(country_stats, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
