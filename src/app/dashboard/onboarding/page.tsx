'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateGoogleReviewUrl, generateSlug, createGoogleSearchUrl } from '@/lib/google-url';
import { saveTenant } from '@/lib/tenant-service';
import { QrDisplay } from '@/components/qr-display';
import { PrintKitModal } from '@/components/print-kit-modal';
import { InstagramIcon } from '@/components/icons';
import {
  Sparkles,
  Building,
  Link as LinkIcon,
  AlertCircle,
  Save,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();

  // 1-Click Form state
  const [businessName, setBusinessName] = useState('Chifa Jumbo');
  const [googleUrl, setGoogleUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [mode, setMode] = useState<'DIRECT' | 'SMART_LANDING'>('DIRECT');

  // UI & advanced states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrintKit, setShowPrintKit] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const slug = generateSlug(businessName || 'mi-negocio');

  // Auto-fill Google Review destination if not manually specified
  const effectiveGoogleUrl = googleUrl.trim() || createGoogleSearchUrl(businessName || 'Mi Negocio');

  // 1-Click Submit: Saves business & activates QR immediately
  const handleSaveAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setValidationWarning(null);

    const cleanName = businessName.trim();
    if (!cleanName) {
      setValidationError('Por favor ingresa el nombre de tu negocio.');
      return;
    }

    let finalGoogleUrl = googleUrl.trim();
    if (finalGoogleUrl) {
      const validation = validateGoogleReviewUrl(finalGoogleUrl);
      if (!validation.isValid) {
        setValidationError(validation.errorMessage || 'Enlace de Google Reviews no válido.');
        return;
      }
      if (validation.warningMessage) {
        setValidationWarning(validation.warningMessage);
      }
      finalGoogleUrl = validation.normalizedUrl;
    } else {
      // Auto-generated Google Maps review search URL
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
        mode,
        is_active: true,
      });

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      router.push(`/dashboard?tenant_id=${saved.id}`);
    } catch (err) {
      console.error('Error saving tenant:', err);
      setValidationError('Hubo un error al guardar tu negocio. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Panel</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Generación Instantánea Sin Fricción</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Crea tu Código QR Dinámico en 1 Clic
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Solo escribe el nombre de tu local. El sistema vincula Google Maps y genera tu QR al instante.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form / Preview */}
      <div className="max-w-4xl mx-auto w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 1-Click Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSaveAndActivate} className="space-y-6">
              {/* The ONLY Required Field: Business Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                  Nombre de tu Negocio / Comercio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej: Chifa Jumbo, Don Tito San Isidro, La Terraza"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-blue-500/50 rounded-2xl text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all font-semibold shadow-inner"
                  />
                </div>

                {/* Auto-Detection Indicator */}
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Google Maps Autovinculado:</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-sm">
                      {effectiveGoogleUrl}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced Options Accordion (Optional Manual Override) */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Opciones avanzadas (Pegar enlace manual o WhatsApp)</span>
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
                    {/* Manual Google URL (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Enlace Específico de Reseñas de Google (Opcional)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowHelpGuide(!showHelpGuide)}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          ¿Cómo obtenerlo?
                        </button>
                      </div>

                      {showHelpGuide && (
                        <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-200 mb-2 space-y-1">
                          <p>
                            En tu Perfil de Google Business, pulsa <strong>&quot;Pedir reseñas&quot;</strong> y pega el enlace aquí. Si lo dejas vacío, el sistema busca tu negocio automáticamente por su nombre.
                          </p>
                        </div>
                      )}

                      <input
                        type="text"
                        value={googleUrl}
                        onChange={(e) => {
                          setGoogleUrl(e.target.value);
                          setValidationError(null);
                        }}
                        placeholder="https://g.page/r/.../review (Dejar vacío para autovinculación)"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    {/* WhatsApp & Instagram */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">
                          WhatsApp (Filtro Reclamos)
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
                          Instagram URL
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

              {/* Validation Feedback Messages */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1-Click Action Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSaving ? 'Guardando y Activando...' : 'Generar y Activar QR en 1 Clic 🚀'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Dynamic QR Live Preview & Action Buttons */}
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
