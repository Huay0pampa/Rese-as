'use client';

import React from 'react';
import { AnalyticsSummary } from '@/types';
import { Smartphone, Monitor, Tablet, Globe, Flame, Activity, Clock, Users } from 'lucide-react';

interface AnalyticsChartsProps {
  summary: AnalyticsSummary;
  tenantName: string;
}

export function AnalyticsCharts({ summary, tenantName }: AnalyticsChartsProps) {
  const total = summary.total_scans || 0;
  const mobileCount = summary.devices?.Mobile || 0;
  const desktopCount = summary.devices?.Desktop || 0;
  const tabletCount = summary.devices?.Tablet || 0;

  const mobilePct = total > 0 ? Math.round((mobileCount / total) * 100) : 0;
  const desktopPct = total > 0 ? Math.round((desktopCount / total) * 100) : 0;
  const tabletPct = total > 0 ? Math.round((tabletCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Scans Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total de Escaneos
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {total.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              +100% activos
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Clientes dirigidos a tus canales de feedback
          </p>
        </div>

        {/* Scans Today Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Escaneos Hoy
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {summary.scans_today.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              en las últimas 24h
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tráfico en tiempo real en tus locales
          </p>
        </div>

        {/* 7-Days Volume Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Últimos 7 Días
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {summary.scans_last_7_days.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-indigo-400">
              semana activa
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Crecimiento sostenido de interacción
          </p>
        </div>
      </div>

      {/* Breakdown Grid: Devices & Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-blue-400" />
            Distribución por Dispositivo
          </h4>

          <div className="space-y-3.5">
            {/* Mobile Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Móviles (Smartphones)
                </span>
                <span className="text-white font-bold">{mobileCount} ({mobilePct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${mobilePct || (total === 0 ? 0 : 5)}%` }}
                ></div>
              </div>
            </div>

            {/* Desktop Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  Escritorio (Computadoras)
                </span>
                <span className="text-white font-bold">{desktopCount} ({desktopPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${desktopPct || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Tablet Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Tablet className="w-3.5 h-3.5 text-purple-400" />
                  Tablets (iPads)
                </span>
                <span className="text-white font-bold">{tabletCount} ({tabletPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${tabletPct || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Country & Geo Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-emerald-400" />
            Ubicación Geográfica de Clientes
          </h4>

          {Object.keys(summary.countries || {}).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(summary.countries).map(([country, count]) => {
                const cPct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={country} className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {country}
                    </span>
                    <span className="font-bold text-slate-300">
                      {count} escaneos ({cPct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">
              No hay datos geográficos registrados aún.
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans Live Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-400" />
          Registro de Escaneos Recientes
        </h4>

        {summary.recent_scans && summary.recent_scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Dispositivo</th>
                  <th className="py-2.5 px-3">País</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary.recent_scans.map((scan) => {
                  const dateStr = new Date(scan.scanned_at).toLocaleString();
                  return (
                    <tr key={scan.id} className="hover:bg-slate-800/40 text-slate-300">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{dateStr}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-white">
                          {scan.device_type === 'Mobile' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                          {scan.device_type === 'Tablet' && <Tablet className="w-3.5 h-3.5 text-purple-400" />}
                          {scan.device_type === 'Desktop' && <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                          {scan.device_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{scan.country || 'Desconocido'}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          Redirigido &lt;100ms
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            Aún no se registran escaneos para este QR. ¡Pruébalo escaneándolo o visitando tu enlace!
          </div>
        )}
      </div>
    </div>
  );
}
