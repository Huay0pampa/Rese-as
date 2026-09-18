'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, ExternalLink, Sparkles, RefreshCw, Printer } from 'lucide-react';

interface QrDisplayProps {
  slug: string;
  businessName: string;
  accentColor?: string;
  size?: number;
  showDownloadOptions?: boolean;
  onOpenPrintKit?: () => void;
}

export function QrDisplay({
  slug,
  businessName,
  accentColor = '#0f172a',
  size = 280,
  showDownloadOptions = true,
  onOpenPrintKit,
}: QrDisplayProps) {
  const [svgString, setSvgString] = useState<string>('');
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [color, setColor] = useState(accentColor);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // In browser, window.location.origin is always the exact live domain
      setBaseUrl(origin);
    }
  }, []);

  const redirectionUrl = `${baseUrl}/r/${slug}`;

  useEffect(() => {
    async function generateQRCodes() {
      try {
        // 1. Generate SVG format
        const svg = await QRCode.toString(redirectionUrl, {
          type: 'svg',
          color: {
            dark: color,
            light: '#ffffff',
          },
          margin: 2,
          errorCorrectionLevel: 'H',
        });
        setSvgString(svg);

        // 2. Generate Ultra-High Resolution PNG (1024x1024 for crisp print quality)
        const png = await QRCode.toDataURL(redirectionUrl, {
          width: 1024,
          margin: 2,
          color: {
            dark: color,
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });
        setPngDataUrl(png);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }

    if (slug) {
      generateQRCodes();
    }
  }, [redirectionUrl, slug, color]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(redirectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${slug}-vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!pngDataUrl) return;
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.download = `qr-${slug}-300dpi.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR Container Card */}
      <div className="relative p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center">
        {/* Subtle Brand Badge */}
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 font-medium px-1">
          <span className="truncate max-w-[150px] font-semibold text-slate-700">{businessName}</span>
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Dinámico
          </span>
        </div>

        {/* QR Visual Canvas */}
        <div
          className="w-full aspect-square max-w-[280px] flex items-center justify-center p-2 rounded-2xl bg-white border-2 border-slate-100 shadow-inner relative group"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {svgString ? (
            <div
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgString }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs">Generando QR...</span>
            </div>
          )}

          {/* Central Star Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center text-xl">
              ⭐
            </div>
          </div>
        </div>

        {/* Dynamic Link Pill */}
        <div className="mt-4 w-full bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center justify-between gap-2 text-xs">
          <div className="truncate font-mono text-slate-600 select-all font-medium pl-1">
            {redirectionUrl || `/r/${slug}`}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyLink}
              title="Copiar enlace"
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={redirectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Probar redirección en nueva pestaña"
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons: Downloads & Print Kit */}
      {showDownloadOptions && (
        <div className="w-full max-w-sm mt-4 space-y-2.5">
          {onOpenPrintKit && (
            <button
              onClick={onOpenPrintKit}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar Kit de Impresión (PDF / Plantilla)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadPNG}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm active:scale-[0.98] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG Alta Res (1024px)</span>
            </button>

            <button
              onClick={handleDownloadSVG}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold shadow-sm active:scale-[0.98] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Vectorial (SVG)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
