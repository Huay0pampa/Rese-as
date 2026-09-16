'use client';

import React from 'react';
import { Card } from '../common/Card';
import { FilterX, RotateCcw } from 'lucide-react';

export interface EmptyDatasetStateProps {
  onResetFilters: () => void;
}

export function EmptyDatasetState({ onResetFilters }: EmptyDatasetStateProps) {
  return (
    <Card className="bg-slate-900/60 border-slate-800/80 p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <FilterX className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-100">
            Sin resultados para la combinación de filtros
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Ningún registro de exportación coincide con todos los filtros activos seleccionados.
            Prueba remover algunos criterios de búsqueda o restablecer los filtros.
          </p>
        </div>

        <button
          onClick={onResetFilters}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer todos los filtros</span>
        </button>
      </div>
    </Card>
  );
}
