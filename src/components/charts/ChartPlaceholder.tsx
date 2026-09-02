'use client';

import React from 'react';
import { Card } from '../common/Card';
import { BarChart3, LineChart, PieChart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface ChartPlaceholderProps {
  title?: string;
  subtitle?: string;
}

const DEMO_CHART_PREVIEW = [
  { name: 'Ene', fob: 4000 },
  { name: 'Feb', fob: 3000 },
  { name: 'Mar', fob: 2000 },
  { name: 'Abr', fob: 2780 },
  { name: 'May', fob: 1890 },
  { name: 'Jun', fob: 2390 },
];

export function ChartPlaceholder({
  title = 'Análisis Visual de Exportaciones (Recharts Architecture)',
  subtitle = 'Módulos dinámicos listos para renderizar distribuciones por valor FOB y volumen',
}: ChartPlaceholderProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Bar Chart Shell */}
      <Card title={title} subtitle={subtitle}>
        <div className="h-64 w-full flex items-center justify-center pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMO_CHART_PREVIEW}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="fob" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: Architectural Capabilities Info Shell */}
      <Card
        title="Visualización Dinámica Data-Driven"
        subtitle="Soporta agregaciones multinivel sin límites de registros"
      >
        <div className="h-64 flex flex-col justify-center space-y-4 px-2">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="p-2 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-slate-200">Ranking por Exportador</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Top empresas ordenadas por valor FOB total acumulado.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="p-2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-slate-200">Evolución Temporal</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tendencia mensual y anual de envíos internacionales.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="p-2 rounded bg-purple-950/60 text-purple-400 border border-purple-800/40">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-slate-200">Cuota por País de Destino</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Distribución porcentual de los principales mercados globales.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
