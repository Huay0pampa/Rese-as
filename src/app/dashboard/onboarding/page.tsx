"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateSlug, createGoogleSearchUrl } from "@/lib/google-url";
import { saveTenant } from "@/lib/tenant-service";
import { QrDisplay } from "@/components/qr-display";
import { PrintKitModal } from "@/components/print-kit-modal";
import { InstagramIcon } from "@/components/icons";
import { GooglePlaceResult } from "@/types";
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
  MapPin,
  Loader2,
  Search,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function OnboardingPage() {
  const router = useRouter();

  // Primary input
  const [businessName, setBusinessName] = useState("");

  // Places search state
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceResult | null>(null);
  const [searchFallback, setSearchFallback] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Advanced optional inputs (collapsed)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customGoogleUrl, setCustomGoogleUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrintKit, setShowPrintKit] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slug = generateSlug(businessName || "mi-negocio");

  // The effective Google URL: use selected place, custom URL, or fallback search
  const effectiveGoogleUrl = selectedPlace
    ? selectedPlace.review_url
    : customGoogleUrl.trim() || createGoogleSearchUrl(businessName || "Mi Negocio");

  // Auto-search with debounce when user types
  const runSearch = useCallback(async (name: string) => {
    if (name.trim().length < 3) {
      setSearchResults([]);
      setSelectedPlace(null);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSelectedPlace(null);

    try {
      const res = await fetch("/api/find-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: name.trim() }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
      setSearchFallback(data.fallback || false);
      setHasSearched(true);

      // Auto-select first result if only one result returned
      if (!data.fallback && data.results?.length === 1) {
        setSelectedPlace(data.results[0]);
      }
    } catch {
      setSearchResults([]);
      setSearchFallback(true);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(businessName);
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [businessName, runSearch]);

  const handleSelectPlace = (place: GooglePlaceResult) => {
    setSelectedPlace(place);
    setSearchResults([]);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = businessName.trim();
    if (!cleanName) {
      setErrorMessage("Por favor escribe el nombre de tu negocio.");
      return;
    }

    // Require selection or place detection if Places API is active and found nothing
    if (!selectedPlace && !searchFallback && hasSearched && searchResults.length === 0 && !customGoogleUrl.trim()) {
      setErrorMessage("⚠️ No se encontró el negocio en Google Maps. Por favor escribe el nombre exacto con su distrito o ciudad (ej: 'Chifa Jumbo Surco').");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveTenant({
        name: cleanName,
        slug,
        google_review_url: effectiveGoogleUrl,
        place_id: selectedPlace?.place_id || null,
        whatsapp_number: whatsappNumber.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        mode: "DIRECT",
        is_active: true,
      });

      try {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      } catch {}

      router.push(`/dashboard?tenant_id=${saved.id}`);
    } catch (err) {
      console.error("Error saving tenant:", err);
      setErrorMessage("Error al registrar negocio. Intenta nuevamente.");
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
            Generador de QR Dinámico — Link Directo a Google Reviews ⭐⭐⭐⭐⭐
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Escribe el nombre de tu local. El sistema busca tu negocio en Google y genera el QR que abre el formulario de reseñas directamente.
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="max-w-4xl mx-auto w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                  Nombre de tu Negocio / Comercio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Building className="w-5 h-5" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Ej: Chifa Jumbo, Don Tito San Isidro, Café Bistro"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border-2 border-blue-500 rounded-2xl text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all font-bold shadow-inner"
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && !selectedPlace && (
                  <div className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                      <span>Selecciona tu negocio para vincular el formulario directo de 5 estrellas:</span>
                    </div>
                    {searchResults.map((place) => (
                      <button
                        key={place.place_id}
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className="w-full text-left px-4 py-3.5 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                              {place.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{place.formatted_address}</p>
                            {place.rating && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs text-amber-400 font-semibold">{place.rating}</span>
                                {place.user_ratings_total && (
                                  <span className="text-xs text-slate-500">({place.user_ratings_total.toLocaleString()} reseñas)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Status Pill */}
                {selectedPlace ? (
                  <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-300">✅ Negocio encontrado en Google — Link directo a 5 estrellas activado</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">{selectedPlace.formatted_address}</span>
                      <button
                        type="button"
                        onClick={() => { setSelectedPlace(null); setHasSearched(false); }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 mt-1 underline"
                      >
                        ¿No es este? Cambiar selección
                      </button>
                    </div>
                  </div>
                ) : hasSearched && !isSearching ? (
                  searchFallback ? (
                    <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Sin API Key de Google configurada</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          El QR usará búsqueda general de Google Maps. Para link directo a reseñas, configura{" "}
                          <code className="bg-slate-800 px-1 rounded">GOOGLE_PLACES_API_KEY</code> en Vercel.
                        </span>
                      </div>
                    </div>
                  ) : searchResults.length === 0 && businessName.trim().length >= 3 ? (
                    <div className="mt-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-300">⚠️ No se encontró este negocio en Google Maps</span>
                        <span className="block text-[11px] text-slate-300 mt-0.5">
                          Agrega el distrito o ciudad (ej: <strong>"{businessName.trim()} Miraflores"</strong>) o verifica que tu negocio esté creado en Google Business.
                        </span>
                      </div>
                    </div>
                  ) : null
                ) : null}
              </div>

              {/* Collapsed Advanced Options */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Opciones avanzadas (Enlace manual / WhatsApp)</span>
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Enlace manual de Google Reviews (Opcional)
                      </label>
                      <input
                        type="text"
                        value={customGoogleUrl}
                        onChange={(e) => setCustomGoogleUrl(e.target.value)}
                        placeholder="https://g.page/r/.../review (Para anular la búsqueda automática)"
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

              {/* Error */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving || !businessName.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Activando Negocio...</span></>
                ) : (
                  <><Sparkles className="w-5 h-5 text-amber-300" /><span>Generar y Activar QR de Reseñas 🚀</span><ArrowRight className="w-5 h-5 ml-1" /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live QR Preview */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Vista Previa en Vivo del QR
            </h3>
            {selectedPlace && (
              <p className="text-[11px] text-emerald-400 font-semibold mb-3">
                ⭐ Abre formulario de 5 estrellas directamente
              </p>
            )}

            <QrDisplay
              slug={slug}
              businessName={businessName || "Tu Negocio"}
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
        tenantName={businessName || "Mi Negocio"}
        slug={slug}
      />

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-6 pb-2">
        SaaS B2B de Reseñas &bull; Motor de QR Dinámico con Google Places API
      </footer>
    </main>
  );
}
