import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/lib/tenant-service';
import { Star, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { InstagramIcon } from '@/components/icons';
import Link from 'next/link';

interface SmartLandingProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: SmartLandingProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    return {
      title: 'Negocio no encontrado | Opiniones y Feedback',
    };
  }

  return {
    title: `${tenant.name} - Califica tu Experiencia ⭐⭐⭐⭐⭐`,
    description: tenant.custom_message || 'Tu opinión nos ayuda a brindarte un mejor servicio.',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  };
}

export default async function SmartLandingPage({ params }: SmartLandingProps) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  // Pre-formatted WhatsApp link for private feedback/complaint filtering
  const rawPhone = tenant.whatsapp_number ? tenant.whatsapp_number.replace(/\D/g, '') : '';
  const waText = encodeURIComponent(
    `¡Hola equipo de ${tenant.name}! Estuve en su local y me gustaría compartir un comentario / sugerencia con la gerencia:`
  );
  const whatsappUrl = rawPhone ? `https://wa.me/${rawPhone}?text=${waText}` : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col justify-between p-4 sm:p-6 font-sans select-none">
      {/* Top Branding Banner */}
      <header className="w-full max-w-md mx-auto pt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Experiencia del Cliente</span>
        </div>

        {/* Business Avatar / Initial Badge */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5 shadow-2xl shadow-amber-500/20 mb-3">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
            {tenant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {tenant.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white px-2">
          {tenant.name}
        </h1>

        <div className="flex items-center justify-center gap-1.5 my-2 text-amber-400">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          ))}
          <span className="text-xs font-bold text-slate-300 ml-1.5 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
            5.0
          </span>
        </div>

        <p className="text-sm text-slate-300 max-w-xs mx-auto mt-2 leading-relaxed">
          {tenant.custom_message || '¿Cómo estuvo tu atención hoy? Tu opinión nos ayuda a seguir mejorando para ti.'}
        </p>
      </header>

      {/* Main Interactive Call-to-Actions */}
      <section className="w-full max-w-md mx-auto my-6 space-y-3.5">
        {/* Giant Primary Button: Google Review */}
        <a
          href={tenant.google_review_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] transition-all duration-200 border border-amber-300/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
              ⭐
            </div>
            <div className="text-left">
              <span className="block text-xs uppercase tracking-wider text-amber-100 font-semibold">
                Excelente Servicio
              </span>
              <span className="block text-lg sm:text-xl font-black text-white leading-tight">
                🌟 Dejar reseña en Google
              </span>
            </div>
          </div>
          <div className="text-white/80 group-hover:translate-x-1 transition-transform">
            ➔
          </div>
        </a>

        {/* Secondary Button: WhatsApp Private Feedback / Complaint Filter */}
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/40 text-white font-semibold shadow-md active:scale-[0.98] transition-all duration-200"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-xs text-emerald-400 font-medium">
                  ¿Algo no salió perfecto?
                </span>
                <span className="block text-base font-bold text-slate-100">
                  💬 Contactar directo por WhatsApp
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Privado
            </span>
          </a>
        ) : null}

        {/* Tertiary Button: Instagram */}
        {tenant.instagram_url ? (
          <a
            href={tenant.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-medium active:scale-[0.98] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center">
                <InstagramIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold">📸 Síguenos en Instagram</span>
            </div>
            <span className="text-slate-400 text-xs">@ver</span>
          </a>
        ) : null}
      </section>

      {/* Trust & Instant Speed Footer */}
      <footer className="w-full max-w-md mx-auto pt-2 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Feedback verificado y 100% seguro</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Desarrollado con motor Edge Ultra-Rápido &bull; <Link href="/" className="underline hover:text-slate-400">Crea tu propio QR Dinámico</Link>
        </p>
      </footer>
    </main>
  );
}
