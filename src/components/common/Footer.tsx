import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-400 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span>Analizador de Exportaciones &copy; {new Date().getFullYear()}</span>
          <span>•</span>
          <span className="text-slate-400">Arquitectura Modular Data-Driven</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400">Next.js • TypeScript • Tailwind CSS • SheetJS</span>
        </div>
      </div>
    </footer>
  );
}
