'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles, Star, Smartphone, MessageSquare } from 'lucide-react';
import QRCode from 'qrcode';

interface PrintKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
  slug: string;
  customMessage?: string;
  accentColor?: string;
}

export function PrintKitModal({
  isOpen,
  onClose,
  tenantName,
  slug,
  customMessage = '¡Tu opinión nos ayuda a seguir creciendo!',
  accentColor = '#2563eb',
}: PrintKitModalProps) {
  const [qrSvg, setQrSvg] = React.useState<string>('');
  const printCardRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    async function loadQR() {
      if (typeof window === 'undefined') return;
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/r/${slug}`;

      try {
        const svg = await QRCode.toString(url, {
          type: 'svg',
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          margin: 1,
          errorCorrectionLevel: 'H',
        });
        setQrSvg(svg);
      } catch (e) {
        console.error('Error generating print QR:', e);
      }
    }

    if (isOpen) {
      loadQR();
    }
  }, [isOpen, slug]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Kit de Impresión Profesional</h3>
              <p className="text-xs text-slate-400">
                Plantilla lista para imprimir para mesas, vitrinas y mostradores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two columns (Preview + Print Actions) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 sm:p-6 overflow-y-auto">
          {/* Column 1: Printable Canvas Preview */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {/* The Print Card Container (Target of @media print) */}
            <div
              id="printable-kit-card"
              ref={printCardRef}
              className="w-full max-w-[340px] bg-white text-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center border-4 border-slate-900 relative overflow-hidden"
              style={{ minHeight: '460px' }}
            >
              {/* Header Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 via-orange-500 to-blue-600"></div>

              {/* Stars & Top Heading */}
              <div className="flex items-center gap-1 text-amber-500 mt-2 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-snug">
                ¿Te encantó tu experiencia?
              </h2>

              <p className="text-xs text-slate-600 font-medium mt-1 mb-4 px-2">
                {customMessage}
              </p>

              {/* QR Centerpiece */}
              <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                <div
                  className="w-48 h-48 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center text-base font-black text-amber-500">
                    ⭐
                  </div>
                </div>
              </div>

              {/* Steps Instructions */}
              <div className="w-full mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3 text-left space-y-1.5 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Abre la cámara de tu celular</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Apunta y escanea el código QR</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>¡Califícanos en Google Maps!</span>
                </div>
              </div>

              {/* Tenant Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span className="truncate max-w-[200px]">{tenantName}</span>
                <span className="text-amber-600 font-bold">Google Reviews</span>
              </div>
            </div>
          </div>

          {/* Column 2: Printing options and tips */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instrucciones de Uso
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span><strong>Tamaño recomendado:</strong> Imprime en formato A6 o A5 en papel couché o cartulina gruesa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span><strong>Ubicación ideal:</strong> Colócalo en portarretratos de acrílico sobre las mesas, caja de pago o cartas del menú.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span><strong>Nunca cambia:</strong> Puedes cambiar el destino o modo del QR desde el panel sin necesidad de volver a imprimir.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>Compatible con la cámara nativa de iOS y Android sin instalar aplicaciones adicionales.</span>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="space-y-2 pt-4">
              <button
                onClick={handlePrint}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Tarjeta Ahora (Ctrl+P / PDF)</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles Injection */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-kit-card,
          #printable-kit-card * {
            visibility: visible;
          }
          #printable-kit-card {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
        }
      `}</style>
    </div>
  );
}
