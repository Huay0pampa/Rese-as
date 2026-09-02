import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Analizador de Exportaciones | Inteligencia Comercial Aduanera',
  description:
    'Aplicación web data-driven para cargar, validar, procesar y analizar reportes de exportaciones aduaneras.',
  keywords: ['Exportaciones', 'Aduana', 'Comercio Exterior', 'Next.js', 'TypeScript', 'Analytics'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100`}>
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
