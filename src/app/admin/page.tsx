"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Tenant,
  SuperAdminMetrics,
  ScanAnalytics,
} from "@/types";
import {
  getSuperAdminMetrics,
  getAllTenantsWithStats,
  toggleTenantStatus,
  updateTenantPlan,
  getGlobalRecentScans,
} from "@/lib/tenant-service";
import { addLicenseCode, getAllLicenseCodes } from "@/lib/license-service";
import {
  ShieldAlert,
  Building2,
  Activity,
  DollarSign,
  Search,
  ExternalLink,
  Power,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  RefreshCw,
  Flame,
  ArrowUpRight,
  KeyRound,
  Copy,
  Plus,
} from "lucide-react";

export default function SuperAdminPage() {
  const [metrics, setMetrics] = useState<SuperAdminMetrics | null>(null);
  const [tenants, setTenants] = useState<(Tenant & { scan_count: number })[]>([]);
  const [recentScans, setRecentScans] = useState<(ScanAnalytics & { tenant_name?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // License Generator State
  const [newLicenseInput, setNewLicenseInput] = useState("");
  const [activeLicenses, setActiveLicenses] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [m, t, s] = await Promise.all([
        getSuperAdminMetrics(),
        getAllTenantsWithStats(),
        getGlobalRecentScans(),
      ]);
      setMetrics(m);
      setTenants(t);
      setRecentScans(s);
      setActiveLicenses(getAllLicenseCodes());
    } catch (err) {
      console.error("Error loading SuperAdmin data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Create new license code
  const handleCreateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicenseInput.trim()) return;
    const added = addLicenseCode(newLicenseInput);
    setActiveLicenses(getAllLicenseCodes());
    setNewLicenseInput("");
    setActionSuccess(`Código de licencia "${added}" generado exitosamente.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleCopyLicense = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Handle Toggle Active/Suspended
  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = !tenant.is_active;
    const ok = await toggleTenantStatus(tenant.id, newStatus);
    if (ok) {
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, is_active: newStatus } : t))
      );
      setActionSuccess(
        `Negocio "${tenant.name}" ${newStatus ? "activado" : "suspendido"} correctamente.`
      );
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Handle Plan Change
  const handlePlanChange = async (tenantId: string, newPlan: "FREE" | "PRO" | "ENTERPRISE") => {
    const ok = await updateTenantPlan(tenantId, newPlan);
    if (ok) {
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, plan: newPlan } : t))
      );
      const m = await getSuperAdminMetrics();
      setMetrics(m);
      setActionSuccess(`Plan actualizado a ${newPlan}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "ACTIVE") return matchesSearch && t.is_active !== false;
    if (statusFilter === "SUSPENDED") return matchesSearch && t.is_active === false;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-600 selection:text-white pb-12">
      {/* SuperAdmin Top Header */}
      <header className="bg-slate-900/90 border-b border-purple-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base text-white flex items-center gap-2">
                SuperAdmin Console
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Master Control
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              title="Refrescar métricas"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3.5 rounded-xl border border-slate-700 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Ver Panel de Negocio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/30 p-6 rounded-3xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Visión Global de la Plataforma SaaS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Gestión de Licencias, Negocios y Facturación
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Supervisión de todos los comercios inscritos, generación de licencias y estado de activación en Edge.
            </p>
          </div>

          {actionSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}
        </div>

        {/* Global KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Negocios Totales</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Building2 className="w-4 h-4" /></div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{metrics.totalTenants}</span>
                <span className="text-xs font-semibold text-emerald-400">{metrics.activeTenants} activos</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">{metrics.directModeCount} en Modo 5⭐ &bull; {metrics.smartLandingModeCount} en Smart Landing</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Escaneos Globales</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><Activity className="w-4 h-4" /></div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{metrics.totalScansGlobal.toLocaleString()}</span>
                <span className="text-xs font-semibold text-blue-400">&lt;100ms</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Tráfico total redirigido por Vercel Edge</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Escaneos Hoy (24h)</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Flame className="w-4 h-4" /></div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{metrics.scansTodayGlobal.toLocaleString()}</span>
                <span className="text-xs font-semibold text-amber-400">en vivo</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Interacciones en el punto de venta hoy</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">MRR / Ingresos</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><DollarSign className="w-4 h-4" /></div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">${metrics.estimatedMRR}</span>
                <span className="text-xs font-semibold text-emerald-400">USD</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Basado en licencias activas</p>
            </div>
          </div>
        )}

        {/* License Key Generator Panel */}
        <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-400" />
                Generador de Códigos de Licencia (Pago Único)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea códigos de activación para tus clientes cuando confirmen su pago.
              </p>
            </div>

            <form onSubmit={handleCreateLicense} className="flex items-center gap-2">
              <input
                type="text"
                value={newLicenseInput}
                onChange={(e) => setNewLicenseInput(e.target.value)}
                placeholder="Ej: CLIENTE-PRO-01"
                className="px-3.5 py-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Generar Código</span>
              </button>
            </form>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
              Códigos de Licencia Activos ({activeLicenses.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {activeLicenses.map((code) => (
                <button
                  key={code}
                  onClick={() => handleCopyLicense(code)}
                  title="Haz clic para copiar"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95 group"
                >
                  <span>{code}</span>
                  <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300" />
                  {copiedCode === code && <span className="text-[10px] text-emerald-400 font-sans">¡Copiado!</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o slug..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === "ALL"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Todos ({tenants.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Activos ({tenants.filter((t) => t.is_active !== false).length})
            </button>
            <button
              onClick={() => setStatusFilter("SUSPENDED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === "SUSPENDED"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Suspendidos ({tenants.filter((t) => t.is_active === false).length})
            </button>
          </div>
        </div>

        {/* Global Tenants Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              Directorio de Clientes / Negocios ({filteredTenants.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Control de suscripciones y activación en Edge
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Negocio / Licencia</th>
                  <th className="py-3 px-3">Modo QR</th>
                  <th className="py-3 px-3">Plan SaaS</th>
                  <th className="py-3 px-3">Escaneos</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Business Info */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-white block text-sm">{t.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-slate-400">/r/{t.slug}</span>
                          {t.license_key && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                              🔑 {t.license_key}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Mode */}
                    <td className="py-3 px-3">
                      {t.mode === "DIRECT" ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                          ⭐ Directo 5⭐
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                          🚀 Smart Landing
                        </span>
                      )}
                    </td>

                    {/* Plan Selector */}
                    <td className="py-3 px-3">
                      <select
                        value={t.plan || "PRO"}
                        onChange={(e) =>
                          handlePlanChange(
                            t.id,
                            e.target.value as "FREE" | "PRO" | "ENTERPRISE"
                          )
                        }
                        aria-label={`Plan de suscripción para ${t.name}`}
                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500"
                      >
                        <option value="FREE">Free ($0/m)</option>
                        <option value="PRO">Pro ($19/m)</option>
                        <option value="ENTERPRISE">Enterprise ($49/m)</option>
                      </select>
                    </td>

                    {/* Scans */}
                    <td className="py-3 px-3">
                      <span className="font-black text-white text-sm">
                        {t.scan_count.toLocaleString()}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        title={t.is_active !== false ? "Suspender Negocio" : "Activar Negocio"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                          t.is_active !== false
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{t.is_active !== false ? "Activo" : "Suspendido"}</span>
                      </button>
                    </td>

                    {/* Action Links */}
                    <td className="py-3 px-3 text-right space-x-2">
                      <a
                        href={`/r/${t.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Probar redirección de QR"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800"
                      >
                        <span>QR</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <Link
                        href={`/dashboard?tenant_id=${t.id}`}
                        title="Abrir en Panel de Control"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg border border-slate-700"
                      >
                        <span>Dashboard</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Real-Time Scan Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Feed Global de Escaneos en Tiempo Real
            </h3>
            <span className="text-[11px] text-slate-400">
              Últimas 25 peticiones a nivel plataforma
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Negocio</th>
                  <th className="py-2.5 px-3">Dispositivo</th>
                  <th className="py-2.5 px-3">País</th>
                  <th className="py-2.5 px-3">Latencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentScans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(s.scanned_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{s.tenant_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                        {s.device_type === "Mobile" && (
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {s.device_type === "Tablet" && (
                          <Tablet className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        {s.device_type === "Desktop" && (
                          <Monitor className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        {s.device_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{s.country || "PE"}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        &lt;100ms Edge
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
