import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Zap,
  Star,
  ShieldAlert,
  Printer,
  BarChart3,
  ArrowRight,
  Sparkles,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { QrDisplay } from '@/components/qr-display';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              ReviewBoost QR
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors"
            >
              Ver Demo Panel
            </Link>
            <Link
              href="/dashboard/onboarding"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all"
            >
              <span>Crear mi QR Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>Motor Edge de Ultra-Baja Latencia (&lt;100ms)</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Multiplica tus Reseñas de 5 Estrellas en Google Maps con{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  QRs Dinámicos
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Captura reseñas positivas en el momento exacto de la compra. Filtra quejas hacia WhatsApp antes de que lleguen a internet y actualiza tus destinos en tiempo real sin reimprimir nada.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start pt-2">
                <Link
                  href="/dashboard/onboarding"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generar QR para mi Negocio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition-all"
                >
                  <span>Explorar Dashboard Admin</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-900 max-w-lg mx-auto lg:mx-0 text-center sm:text-left">
                <div>
                  <div className="text-2xl font-black text-white">&lt;100ms</div>
                  <div className="text-xs text-slate-400">Redirección Edge</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">+340%</div>
                  <div className="text-xs text-slate-400">Más reseñas en Google</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">0 Re-impresiones</div>
                  <div className="text-xs text-slate-400">QR 100% Dinámico</div>
                </div>
              </div>
            </div>

            {/* Right Live Demo Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm relative">
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
                  Prueba el QR en Vivo
                </div>

                <div className="text-center mb-4">
                  <span className="text-xs text-slate-400 font-medium">Demo interactivo de negocio:</span>
                  <h3 className="font-extrabold text-base text-white">Café & Bistro La Terraza</h3>
                </div>

                <QrDisplay
                  slug="cafe-la-terraza"
                  businessName="Café & Bistro La Terraza"
                  size={240}
                  showDownloadOptions={true}
                />

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <a
                    href="/r/cafe-la-terraza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <span>Simular escaneo de cliente móvil</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Value Propositions */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Todo lo que necesitas para dominar las reseñas locales
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Diseñado específicamente para restaurantes, cafeterías, clínicas, hoteles y comercios físicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Modo Directo 5 Estrellas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Abre la ventana de calificación de Google Maps en un parpadeo. Sin clics intermediarios ni fricción para el comensal.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Filtro Inteligente de Quejas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                En el modo Smart Landing, las consultas y molestias se desvían de forma privada a WhatsApp con la gerencia, protegiendo tu reputación online.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Kit de Impresión Listo (PDF/PNG)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descarga plantillas profesionales para portarretratos de acrílico y mesas en alta resolución (1024px PNG y vector SVG).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Banner */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border border-blue-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Comienza a recibir más reseñas hoy mismo
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6">
              Configura tu primer código QR dinámico en menos de 2 minutos. Totalmente compatible con Vercel Edge y Supabase.
            </p>
            <Link
              href="/dashboard/onboarding"
              className="inline-flex items-center gap-2 py-3.5 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear QR Dinámico Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} ReviewBoost SaaS &bull; Motor de Redirección Ultra-Rápido (&lt;100ms)
        </p>
        <p className="text-[11px] text-slate-600">
          Construido con Next.js 14+ (App Router), Supabase PostgreSQL (RLS), TypeScript, Tailwind CSS y Vercel Edge Runtime.
        </p>
      </footer>
    </div>
  );
}
