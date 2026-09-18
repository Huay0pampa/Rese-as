'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateGoogleReviewUrl, generateSlug } from '@/lib/google-url';
import { saveTenant } from '@/lib/tenant-service';
import { QrDisplay } from '@/components/qr-display';
import { PrintKitModal } from '@/components/print-kit-modal';
import { InstagramIcon } from '@/components/icons';
import {
  Sparkles,
  Building,
  Link as LinkIcon,
  AlertCircle,
  ArrowRight,
  Printer,
  Save,
  MessageCircle,
  HelpCircle,
  Star,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [mode, setMode] = useState<'DIRECT' | 'SMART_LANDING'>('DIRECT');

  // Validation & UI states
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrintKit, setShowPrintKit] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const slug = generateSlug(businessName || 'mi-negocio');

  // Step 1: Validate & Generate Dynamic QR
  const handleValidateAndGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setValidationWarning(null);

    if (!businessName.trim()) {
      setValidationError('Por favor ingresa el nombre de tu negocio.');
      return;
    }

    const validation = validateGoogleReviewUrl(googleUrl);

    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Enlace de Google Reviews no válido.');
      return;
    }

    if (validation.warningMessage) {
      setValidationWarning(validation.warningMessage);
    }

    // Set normalized URL and trigger generation state
    setGoogleUrl(validation.normalizedUrl);
    setIsGenerated(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // confetti non-blocking
    }
  };

  // Step 2: Save Tenant & Persist to Supabase / Storage
  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      const saved = await saveTenant({
        name: businessName.trim(),
        slug,
        google_review_url: googleUrl.trim(),
        whatsapp_number: whatsappNumber.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        mode,
        is_active: true,
      });

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Onboarding Rápido</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Crea tu Código QR Dinámico en 2 Minutos
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multiplica tus reseñas de 5 estrellas en Google Maps y redirige clientes al instante.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form / Preview */}
      <div className="max-w-4xl mx-auto w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleValidateAndGenerate} className="space-y-5">
              {/* Field 1: Business Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  1. Nombre de tu Negocio / Comercio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setIsGenerated(false);
                    }}
                    placeholder="Ej: Café & Bistro La Terraza"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
                {businessName && (
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Slug generado: <span className="text-blue-400 font-semibold">{slug}</span> &bull; URL: <span className="text-slate-300">/r/{slug}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Google Review URL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    2. Enlace Oficial de Reseña de Google Maps *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpGuide(!showHelpGuide)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>¿Cómo obtenerlo?</span>
                  </button>
                </div>

                {/* Helpful Guide Accordion */}
                {showHelpGuide && (
                  <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-blue-200 mb-3 space-y-1.5 animate-in fade-in">
                    <p className="font-bold">Cómo conseguir tu enlace directo de reseñas en Google:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px]">
                      <li>Abre tu cuenta de <strong>Google Mi Negocio</strong> (Google Business Profile).</li>
                      <li>Haz clic en el botón <strong>&quot;Pedir reseñas&quot;</strong> o <strong>&quot;Solicitar reseñas&quot;</strong>.</li>
                      <li>Copia el enlace corto generado (ej: <code className="text-blue-300">https://g.page/r/.../review</code>) y pégalo aquí.</li>
                    </ol>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={googleUrl}
                    onChange={(e) => {
                      setGoogleUrl(e.target.value);
                      setIsGenerated(false);
                      setValidationError(null);
                    }}
                    placeholder="https://g.page/r/CU2f3v.../review o https://search.google.com/local/writereview?placeid=..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Optional Channels */}
              <div className="pt-2 border-t border-slate-800/80 space-y-4">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Canales Adicionales (Opcional - Para Modo Smart Landing)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp */}
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      WhatsApp (Filtro de quejas)
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
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
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
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Feedback Messages */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {validationWarning && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationWarning}</span>
                </div>
              )}

              {/* Validate & Generate Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Validar y Generar QR Dinámico</span>
                <ArrowRight className="w-4 h-4" />
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
              showDownloadOptions={isGenerated}
              onOpenPrintKit={() => setShowPrintKit(true)}
            />

            {/* Step 2 Actions when generated */}
            {isGenerated && (
              <div className="w-full mt-6 pt-6 border-t border-slate-800 space-y-3">
                <button
                  type="button"
                  onClick={handleSaveConfiguration}
                  disabled={isSaving}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando en Supabase...' : 'Guardar Configuración y Activar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintKit(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Descargar Kit de Impresión (PDF / Plantilla)</span>
                </button>
              </div>
            )}
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
