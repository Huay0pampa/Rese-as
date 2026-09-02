'use client';

import React from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useExportData } from '@/hooks/useExportData';
import { FileUploader } from '@/components/upload/FileUploader';
import { FileStatusCard } from '@/components/upload/FileStatusCard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SummaryPlaceholder } from '@/components/dashboard/SummaryPlaceholder';
import { DataQualityDiagnosticsCard } from '@/components/dashboard/DataQualityDiagnosticsCard';
import { DataTablePlaceholder } from '@/components/tables/DataTablePlaceholder';
import { ChartPlaceholder } from '@/components/charts/ChartPlaceholder';

export default function HomePage() {
  const { state: uploadState, uploadFile, resetUpload } = useFileUpload();
  const { setRecords, filteredRecords, summaryMetrics } = useExportData(
    uploadState.normalizedRecords
  );

  const handleFileSelect = async (file: File) => {
    const result = await uploadFile(file);
    if (result && result.normalizedRecords.length > 0) {
      setRecords(result.normalizedRecords);
    }
  };

  const handleReset = () => {
    resetUpload();
    setRecords([]);
  };

  const hasData = uploadState.status === 'ready' && uploadState.normalizedRecords.length > 0;

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Carga y Procesamiento de Archivos
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Selecciona o arrastra tu reporte Excel o CSV con las 8 columnas oficiales
            </p>
          </div>
        </div>

        {uploadState.status === 'ready' && uploadState.metadata ? (
          <div className="space-y-4">
            <FileStatusCard metadata={uploadState.metadata} onReset={handleReset} />
            {uploadState.qualityReport && (
              <DataQualityDiagnosticsCard report={uploadState.qualityReport} />
            )}
          </div>
        ) : (
          <FileUploader
            status={uploadState.status}
            progress={uploadState.progress}
            errorMessage={uploadState.errorMessage}
            onFileSelect={handleFileSelect}
          />
        )}
      </section>

      {/* Dashboard Reserved Area */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Dashboard de Análisis & Indicadores
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Métricas resumidas, análisis gráfico y tabulación dinámica
          </p>
        </div>

        <DashboardShell>
          {/* Summary Metrics */}
          <SummaryPlaceholder metrics={hasData ? summaryMetrics : undefined} />

          {/* Data Table Area */}
          <DataTablePlaceholder records={hasData ? filteredRecords : []} />

          {/* Recharts Area */}
          <ChartPlaceholder />

          {/* Empty State message if no dataset uploaded */}
          {!hasData && <EmptyState />}
        </DashboardShell>
      </section>
    </div>
  );
}
