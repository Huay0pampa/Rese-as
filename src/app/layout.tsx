import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ReviewBoost QR | SaaS de Reseñas Google y QRs Dinámicos Ultra-Rápidos',
  description:
    'SaaS B2B de Reseñas y Fidelización en Tiempo Real mediante QRs Dinámicos con redirección Edge (<100ms), filtro de quejas por WhatsApp y kit de impresión.',
  keywords: [
    'QR Dinámico',
    'Google Reviews',
    'Reseñas Google Maps',
    'SaaS B2B',
    'Fidelización Clientes',
    'Vercel Edge',
    'Supabase',
    'Next.js',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
