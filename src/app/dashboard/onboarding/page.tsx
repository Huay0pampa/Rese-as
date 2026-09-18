'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateSlug, createGoogleSearchUrl, validateGoogleReviewUrl } from '@/lib/google-url';
import { saveTenant } from '@/lib/tenant-service';
import { QrDisplay } from '@/components/qr-display';
import { PrintKitModal } from '@/components/print-kit-modal';
import { InstagramIcon } from '@/components/icons';
import {
  Sparkles,
  Building,
  AlertCircle,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Zap,
  ArrowRight,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();

  // Business Name is the only primary input
  const [businessName, setBusinessName] = useState('Chifa Jumbo');
  
  // Advanced optional inputs (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customGoogleUrl, setCustomGoogleUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  
  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrintKit, setShowPrintKit] = useState(false);

  const slug = generateSlug(businessName || 'mi-negocio');
  const autowiredUrl = customGoogleUrl.trim() || createGoogleSearchUrl(businessName || 'Mi Negocio');

  // Submit Handler: Saves immediately with Zero Friction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = businessName.trim();
    if (!cleanName) {
      setErrorMessage('Por favor escribe el nombre de tu negocio.');
      return;
    }

    let finalGoogleUrl = customGoogleUrl.trim();
    if (finalGoogleUrl) {
      const val = validateGoogleReviewUrl(finalGoogleUrl);
      if (!val.isValid) {
        setErrorMessage(val.errorMessage || 'El enlace de Google no es válido.');
        return;
      }
      finalGoogleUrl = val.normalizedUrl;
    } else {
      finalGoogleUrl = createGoogleSearchUrl(cleanName);
    }

    setIsSaving(true);
    try {
      const saved = await saveTenant({
        name: cleanName,
        slug,
        google_review_url: finalGoogleUrl,
        whatsapp_number: whatsappNumber.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        mode: 'DIRECT',
        is_active: true,
      });

      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {}

      // Navigate to dashboard
      router.push(`/dashboard?tenant_id=${saved.id}`);
    } catch (err) {
      console.error('Error saving tenant:', err);
      setErrorMessage('Error al registrar negocio. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Panel</span>
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Onboarding Instantáneo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Generador de QR Dinámico para Google Maps
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Escribe el nombre de tu local y el sistema generará tu QR de reseñas listo para imprimir.
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="max-w-4xl mx-auto w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Single Business Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                  1. Nombre de tu Negocio / Comercio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej: Chifa Jumbo, Don Tito San Isidro, Café Bistro"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border-2 border-blue-500 rounded-2xl text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all font-bold shadow-inner"
                  />
                </div>

                {/* Auto Detection Pill */}
                <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Google Maps Autovinculado con éxito</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-sm">
                      Destino: {autowiredUrl}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsed Advanced Options (WhatsApp / Custom URL) */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Opciones avanzadas (WhatsApp / Enlace manual)</span>
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Enlace específico de Google Business (Opcional)
                      </label>
                      <input
                        type="text"
                        value={customGoogleUrl}
                        onChange={(e) => setCustomGoogleUrl(e.target.value)}
                        placeholder="https://g.page/r/.../review (Dejar vacío para autovinculación)"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">
                          WhatsApp de Atención (Opcional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="+51987654321"
                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">
                          Instagram URL (Opcional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
                            <InstagramIcon className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            placeholder="https://instagram.com/tu_marca"
                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1-Click Action Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{isSaving ? 'Activando Negocio...' : 'Generar y Activar QR en 1 Clic 🚀'}</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live QR Preview */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Vista Previa en Vivo del QR
            </h3>

            <QrDisplay
              slug={slug}
              businessName={businessName || 'Tu Negocio'}
              showDownloadOptions={true}
              onOpenPrintKit={() => setShowPrintKit(true)}
            />
          </div>
        </div>
      </div>

      {/* Print Kit Modal */}
      <PrintKitModal
        isOpen={showPrintKit}
        onClose={() => setShowPrintKit(false)}
        tenantName={businessName || 'Mi Negocio'}
        slug={slug}
      />

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-6 pb-2">
        SaaS B2B de Reseñas y Fidelización en Tiempo Real &bull; Diseñado con Next.js Edge & Supabase
      </footer>
    </main>
  );
}
