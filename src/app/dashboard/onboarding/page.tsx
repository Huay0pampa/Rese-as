"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateSlug, createGoogleSearchUrl } from "@/lib/google-url";
import { saveTenant } from "@/lib/tenant-service";
import { validateLicenseKey } from "@/lib/license-service";
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
  KeyRound,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function OnboardingPage() {
  const router = useRouter();

  // Primary inputs (pre-filled license key for zero friction)
  const [businessName, setBusinessName] = useState("");
  const [licenseKey, setLicenseKey] = useState("PRO-2026");

  // License status
  const [licenseStatus, setLicenseStatus] = useState<{ isValid: boolean; message: string } | null>(
    validateLicenseKey("PRO-2026")
  );

  // Places search state
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceResult | null>(null);
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

  // The effective Google URL: use selected place, custom URL, or fallback
  const effectiveGoogleUrl = selectedPlace
    ? selectedPlace.review_url
    : customGoogleUrl.trim() || createGoogleSearchUrl(businessName || "Mi Negocio");

  // Validate license key as user types
  useEffect(() => {
    if (!licenseKey.trim()) {
      setLicenseStatus(null);
      return;
    }
    const res = validateLicenseKey(licenseKey);
    setLicenseStatus(res);
  }, [licenseKey]);

  // Auto-search Google Places as user types (keeps dropdown open for user selection)
  const runSearch = useCallback(async (name: string) => {
    if (name.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch("/api/find-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: name.trim() }),
      });
      const data = await res.json();
      const items: GooglePlaceResult[] = data.results || [];
      setSearchResults(items);
      setHasSearched(true);
    } catch {
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(businessName);
    }, 350);
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

    // Require valid License Key
    const licCheck = validateLicenseKey(licenseKey);
    if (!licCheck.isValid) {
      setErrorMessage(licCheck.message || "Por favor ingresa un código de licencia válido para activar tu sistema.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveTenant({
        name: selectedPlace ? selectedPlace.name : cleanName,
        slug,
        google_review_url: effectiveGoogleUrl,
        place_id: selectedPlace?.place_id || null,
        license_key: licenseKey.trim().toUpperCase(),
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
            <span>Onboarding Instantáneo con Licencia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Generador de QR Dinámico — Link Directo a Google Reviews ⭐⭐⭐⭐⭐
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ingresa tu código de licencia y el nombre de tu local para generar tu QR con vinculación directa a reseñas de 5 estrellas.
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="max-w-4xl mx-auto w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* License Code Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <span>1. Código de Licencia / Activación</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal uppercase">Requerido</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => {
                      setLicenseKey(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Ej: PRO-2026, VIP-2026, LIC-889"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border-2 border-purple-500/60 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all font-mono font-bold uppercase"
                  />
                </div>
                {licenseStatus && (
                  <div
                    className={`mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                      licenseStatus.isValid
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {licenseStatus.isValid ? (
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{licenseStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Business Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                  2. Nombre de tu Negocio / Comercio
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
                      setSelectedPlace(null);
                      setErrorMessage(null);
                    }}
                    placeholder="Ej: Pollos Don Tito, Chifa Jumbo, Don Tito San Isidro"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border-2 border-blue-500 rounded-2xl text-white placeholder-slate-500 text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all font-bold shadow-inner"
                  />
                </div>

                {/* Search Results Dropdown List */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                      <span>Coincidencias encontradas en Google Maps (Haz clic en tu local):</span>
                    </div>
                    {searchResults.map((place) => (
                      <button
                        key={place.place_id}
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className={`w-full text-left px-4 py-3.5 border-b border-slate-800/50 last:border-0 transition-colors group cursor-pointer ${
                          selectedPlace?.place_id === place.place_id ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-slate-800"
                        }`}
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

                {/* Selected Place Badge */}
                {selectedPlace ? (
                  <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-300">✅ Ficha de Google Maps Vinculada — Directo a 5 Estrellas</span>
                      <span className="block text-[11px] text-slate-300 mt-0.5 font-medium">{selectedPlace.name} &bull; {selectedPlace.formatted_address}</span>
                      <button
                        type="button"
                        onClick={() => { setSelectedPlace(null); runSearch(businessName); }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 mt-1 underline block"
                      >
                        Cambiar local o sucursal seleccionada
                      </button>
                    </div>
                  </div>
                ) : hasSearched && !isSearching && searchResults.length === 0 && businessName.trim().length >= 3 ? (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold">⚠️ No encontramos coincidencias exactas para "{businessName}"</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        Prueba agregando la ciudad o distrito (ej: <strong>"{businessName.trim()} Surco"</strong> o <strong>"{businessName.trim()} Lima"</strong>).
                      </span>
                    </div>
                  </div>
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
                disabled={isSaving || !businessName.trim() || !licenseKey.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Verificando Licencia y Activando...</span></>
                ) : (
                  <><Sparkles className="w-5 h-5 text-amber-300" /><span>Validar Licencia y Activar QR 🚀</span><ArrowRight className="w-5 h-5 ml-1" /></>
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
            <p className="text-[11px] text-emerald-400 font-semibold mb-3">
              ⭐ Abre formulario de 5 estrellas directamente
            </p>

            <QrDisplay
              slug={slug}
              businessName={selectedPlace ? selectedPlace.name : businessName || "Tu Negocio"}
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
        tenantName={selectedPlace ? selectedPlace.name : businessName || "Mi Negocio"}
        slug={slug}
      />

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-6 pb-2">
        SaaS B2B de Reseñas &bull; Motor de Licencias y QR Dinámico con Google Places API
      </footer>
    </main>
  );
}
