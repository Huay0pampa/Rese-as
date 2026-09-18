'use client';

import React, { useState } from 'react';
import { TenantMode } from '@/types';
import { Zap, Layout, CheckCircle2, ShieldAlert, Sparkles, Star } from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: TenantMode;
  onModeChange: (newMode: TenantMode) => Promise<void> | void;
  disabled?: boolean;
}

export function ModeSwitcher({ currentMode, onModeChange, disabled = false }: ModeSwitcherProps) {
  const [loading, setLoading] = useState(false);

  const handleSelect = async (mode: TenantMode) => {
    if (mode === currentMode || disabled || loading) return;
    setLoading(true);
    try {
      await onModeChange(mode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Modo de Redirección del QR Dinámico
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Elige qué sucede exactamente cuando tus clientes escanean el código QR en tu local.
          </p>
        </div>

        {loading && (
          <span className="text-xs text-blue-400 font-semibold animate-pulse">
            Guardando cambios...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: DIRECT MODE */}
        <div
          onClick={() => handleSelect('DIRECT')}
          className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all relative ${
            currentMode === 'DIRECT'
              ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              <Zap className="w-6 h-6" />
            </div>
            {currentMode === 'DIRECT' && (
              <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Activo
              </span>
            )}
          </div>

          <h4 className="text-base font-bold text-white flex items-center gap-1.5">
            Modo Directo 5 Estrellas
            <span className="text-amber-400 text-xs">⭐</span>
          </h4>
          
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Redirección instantánea (<strong>&lt;100ms</strong>) directa a la ficha de reseñas de Google Maps. Máxima tasa de conversión para clientes felices.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Flujo: QR ➔ Google Maps Reviews</span>
          </div>
        </div>

        {/* Option 2: SMART LANDING MODE */}
        <div
          onClick={() => handleSelect('SMART_LANDING')}
          className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all relative ${
            currentMode === 'SMART_LANDING'
              ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
              <Layout className="w-6 h-6" />
            </div>
            {currentMode === 'SMART_LANDING' && (
              <span className="flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Activo
              </span>
            )}
          </div>

          <h4 className="text-base font-bold text-white flex items-center gap-1.5">
            Modo Smart Landing Multi-canal
            <span className="text-purple-400 text-xs">🚀</span>
          </h4>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Muestra una página intermedia ultra-rápida. Reseñas a Google, <strong>filtro de quejas por WhatsApp</strong> y botón a tu Instagram.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Flujo: QR ➔ Smart Landing ➔ Google / WhatsApp / Instagram</span>
          </div>
        </div>
      </div>
    </div>
  );
}
