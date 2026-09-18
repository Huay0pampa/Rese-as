'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tenant, AnalyticsSummary, TenantMode } from '@/types';
import {
  getAllTenants,
  getTenantById,
  updateTenantMode,
  getTenantAnalytics,
  saveTenant,
} from '@/lib/tenant-service';
import { DashboardHeader } from '@/components/dashboard-header';
import { ModeSwitcher } from '@/components/mode-switcher';
import { AnalyticsCharts } from '@/components/analytics-charts';
import { QrDisplay } from '@/components/qr-display';
import { PrintKitModal } from '@/components/print-kit-modal';
import { validateGoogleReviewUrl } from '@/lib/google-url';
import { InstagramIcon } from '@/components/icons';
import {
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  MessageCircle,
  Sparkles,
  QrCode,
  TrendingUp,
  RefreshCw,
  Printer,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tenant_id?: string }>;
}) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [showPrintKit, setShowPrintKit] = useState(false);

  // Edit Channels Form State
  const [googleUrl, setGoogleUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingChannels, setIsSavingChannels] = useState(false);

  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
  const initialTenantId = resolvedSearchParams?.tenant_id;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllTenants();
      setTenants(all);

      if (all.length > 0) {
        const target = initialTenantId
          ? all.find((t) => t.id === initialTenantId) || all[0]
          : all[0];
        setSelectedTenant(target);
        setGoogleUrl(target.google_review_url || '');
        setWhatsappNumber(target.whatsapp_number || '');
        setInstagramUrl(target.instagram_url || '');

        // Fetch analytics
        const stats = await getTenantAnalytics(target.id);
        setAnalytics(stats);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [initialTenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle switching tenant
  const handleSelectTenant = async (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) return;

    setSelectedTenant(tenant);
    setGoogleUrl(tenant.google_review_url || '');
    setWhatsappNumber(tenant.whatsapp_number || '');
    setInstagramUrl(tenant.instagram_url || '');
    setSaveSuccess(false);
    setSaveError(null);

    const stats = await getTenantAnalytics(tenant.id);
    setAnalytics(stats);
  };

  // Handle fast mode switch
  const handleModeChange = async (newMode: TenantMode) => {
    if (!selectedTenant) return;
    setIsUpdatingMode(true);
    try {
      const updated = await updateTenantMode(selectedTenant.id, newMode);
      if (updated) {
        setSelectedTenant(updated);
        setTenants((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      }
    } catch (err) {
      console.error('Error changing mode:', err);
    } finally {
      setIsUpdatingMode(false);
    }
  };

  // Save Channels Form
  const handleSaveChannels = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setSaveError(null);
    setSaveSuccess(false);

    // Validate Google URL
    const val = validateGoogleReviewUrl(googleUrl);
    if (!val.isValid) {
      setSaveError(val.errorMessage || 'Enlace de Google Reviews no válido.');
      return;
    }

    setIsSavingChannels(true);
    try {
      const updated = await saveTenant({
        ...selectedTenant,
        google_review_url: val.normalizedUrl,
        whatsapp_number: whatsappNumber.trim() || null,
        instagram_url: instagramUrl.trim() || null,
      });

      setSelectedTenant(updated);
      setGoogleUrl(updated.google_review_url);
      setTenants((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving channels:', err);
      setSaveError('Error al guardar la configuración.');
    } finally {
      setIsSavingChannels(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Cargando Panel de Control...</p>
      </div>
    );
  }

  if (!selectedTenant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center max-w-md">
          <QrCode className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No tienes negocios registrados</h2>
          <p className="text-xs text-slate-400 mb-6">
            Comienza creando tu primer código QR dinámico en menos de dos minutos.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Iniciar Onboarding</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Header */}
      <DashboardHeader
        tenants={tenants}
        currentTenantId={selectedTenant.id}
        onSelectTenant={handleSelectTenant}
      />

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Title Bar & Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                QR Activo y Operativo en Vercel Edge
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {selectedTenant.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Destino actual: <span className="text-slate-300">/r/{selectedTenant.slug}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrintKit(true)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Kit de Impresión</span>
            </button>

            <a
              href={`/r/${selectedTenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <span>Escanear / Probar Enlace</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 1. Fast Redirection Mode Switcher */}
        <section>
          <ModeSwitcher
            currentMode={selectedTenant.mode}
            onModeChange={handleModeChange}
            disabled={isUpdatingMode}
          />
        </section>

        {/* 2. Main Grid: Analytics & QR Management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Area (7 cols): Analytics and Channels Editor */}
          <div className="lg:col-span-7 space-y-8">
            {/* Analytics Section */}
            {analytics && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Métricas de Escaneo en Tiempo Real
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Actualizado al instante
                  </span>
                </div>
                <AnalyticsCharts summary={analytics} tenantName={selectedTenant.name} />
              </section>
            )}

            {/* Channels & URLs Editor */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                  Configuración de Enlaces y Canales
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modifica los destinos a los que se redirige tu QR sin necesidad de cambiar el código físico.
                </p>
              </div>

              <form onSubmit={handleSaveChannels} className="space-y-4">
                {/* Google Review URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Enlace de Reseña de Google Maps *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={googleUrl}
                      onChange={(e) => setGoogleUrl(e.target.value)}
                      placeholder="https://g.page/r/.../review"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* WhatsApp & Instagram in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp (Reclamos)</span>
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+51987654321"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                      <span>Instagram URL</span>
                    </label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/tu_marca"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Feedback Alerts */}
                {saveError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>¡Enlaces actualizados con éxito en tiempo real!</span>
                  </div>
                )}

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSavingChannels}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingChannels ? 'Guardando...' : 'Guardar Cambios de Enlaces'}</span>
                </button>
              </form>
            </section>
          </div>

          {/* Right Area (5 cols): Dynamic QR Code Card & Kit Download */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  Código QR Dinámico
                </h3>
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                  Latencia &lt;100ms
                </span>
              </div>

              <QrDisplay
                slug={selectedTenant.slug}
                businessName={selectedTenant.name}
                accentColor="#0f172a"
                size={260}
                showDownloadOptions={true}
                onOpenPrintKit={() => setShowPrintKit(true)}
              />

              <div className="mt-6 pt-5 border-t border-slate-800/80 w-full text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Despliegue Global en Vercel Edge</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cualquier actualización de enlaces o modo surte efecto instantáneo para los clientes físicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Print Kit Modal */}
      <PrintKitModal
        isOpen={showPrintKit}
        onClose={() => setShowPrintKit(false)}
        tenantName={selectedTenant.name}
        slug={selectedTenant.slug}
        customMessage={selectedTenant.custom_message}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        QR Reviews SaaS &bull; Motor de Redirección Edge con Supabase PostgreSQL
      </footer>
    </div>
  );
}
