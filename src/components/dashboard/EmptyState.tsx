'use client';

import React from 'react';
import { ShieldCheck, PieChart, Database, ArrowUpCircle } from 'lucide-react';
import { Card } from '../common/Card';

export function EmptyState() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed border-slate-800 bg-slate-900/30">
        <div className="text-center py-8 px-4 max-w-2xl mx-auto">
          <div className="inline-flex p-4 rounded-2xl bg-blue-950/40 text-blue-400 border border-blue-800/40 mb-4">
            <ArrowUpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            Ningún archivo cargado actualmente
          </h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Sube un archivo Excel (.xlsx, .xls) o CSV con las 8 columnas oficiales para activar el procesamiento en tiempo real, tabulación dinámica y visualizaciones.
          </p>
        </div>
      </Card>

      {/* Architectural Capabilities Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/40">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-sm font-semibold text-slate-200">Validación Data-Driven</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detección automática de columnas faltantes, normalización de formatos numéricos (FOB USD, Qty) y fechas ISO sin depender de totales ni países fijos.
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900/40">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-blue-400">
              <PieChart className="w-5 h-5" />
              <h4 className="text-sm font-semibold text-slate-200">Recharts Modulares</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Módulos de gráficos dinámicos listos para renderizar tendencias temporales, participación por exportadores y distribución por mercados de destino.
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900/40">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-purple-400">
              <Database className="w-5 h-5" />
              <h4 className="text-sm font-semibold text-slate-200">Persistencia Supabase</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Capa de servicios y clientes de Supabase integrada para almacenar datasets y permitir consultas históricas en fases posteriores.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
