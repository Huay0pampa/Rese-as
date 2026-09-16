'use client';

import React from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useExportData } from '@/hooks/useExportData';
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard';

import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { FileUploader } from '@/components/upload/FileUploader';
import { FileStatusCard } from '@/components/upload/FileStatusCard';
import { SummaryPlaceholder } from '@/components/dashboard/SummaryPlaceholder';
import { DataQualityDiagnosticsCard } from '@/components/dashboard/DataQualityDiagnosticsCard';
import { AnalysisConfigCard } from '@/components/dashboard/AnalysisConfigCard';
import { FilterPanelCard } from '@/components/dashboard/FilterPanelCard';
import { AnalyticsDataTableCard } from '@/components/tables/AnalyticsDataTableCard';
import { AnalyticsChartCard } from '@/components/charts/AnalyticsChartCard';
import { IncompatibleFileState } from '@/components/dashboard/IncompatibleFileState';
import { EmptyDatasetState } from '@/components/dashboard/EmptyDatasetState';

import { exportDataset, exportAnalyticsResultToPDF, ExportFormat } from '@/lib/export/exporter';
import { AuthModal } from '@/components/auth/AuthModal';
import { AnalysisHistoryModal } from '@/components/dashboard/AnalysisHistoryModal';
import { PersistenceService, AnalysisHistoryItem } from '@/services/persistence-service';

import { AlertCircle, RefreshCw, Layers, BookmarkCheck } from 'lucide-react';
import { Card } from '@/components/common/Card';

export default function HomePage() {
  const { state: uploadState, uploadFile, resetUpload } = useFileUpload();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [historyModalOpen, setHistoryModalOpen] = React.useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = React.useState<string | null>(null);

  const {
    records,
    setRecords,
    filteredRecords,
    filters,
    setFilters,
    filterOptions,
    activeBadges,
    summaryMetrics,
    resetFilters,
    removeFilterBadge,
  } = useExportData(uploadState.normalizedRecords);

  const {
    dimension,
    metric,
    operation,
    chartType,
    queryResult,
    setDimension,
    setMetric,
    setOperation,
    setChartType,
  } = useAnalyticsDashboard(filteredRecords);

  // Manejador de selección de archivo
  const handleFileSelect = React.useCallback(async (file: File) => {
    const result = await uploadFile(file);
    if (result && result.normalizedRecords.length > 0) {
      setRecords(result.normalizedRecords);
    }
  }, [uploadFile, setRecords]);

  // Guardar snapshot de análisis actual en el historial
  const handleSaveAnalysis = React.useCallback(async () => {
    if (!uploadState.metadata || filteredRecords.length === 0) return;
    const res = await PersistenceService.saveAnalysisHistory({
      fileName: uploadState.metadata.fileName,
      recordCount: filteredRecords.length,
      qualityScore: uploadState.qualityReport?.completenessScore || 100,
      dimension,
      metric,
      operation,
      activeFilters: filters,
      summaryMetrics,
    });

    if (res.success) {
      setSaveSuccessMessage('Análisis guardado exitosamente en tu historial.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  }, [uploadState.metadata, uploadState.qualityReport, filteredRecords.length, dimension, metric, operation, filters, summaryMetrics]);


  // Cargar elemento guardado desde el historial
  const handleSelectHistoryItem = React.useCallback((item: AnalysisHistoryItem) => {
    if (item.dimension) setDimension(item.dimension as any);
    if (item.metric) setMetric(item.metric as any);
    if (item.operation) setOperation(item.operation as any);
    if (item.activeFilters) setFilters(item.activeFilters);
  }, [setDimension, setMetric, setOperation, setFilters]);


  // Manejador para reiniciar / cargar un nuevo archivo
  const handleReset = React.useCallback(() => {
    resetUpload();
    setRecords([]);
    resetFilters();
  }, [resetUpload, setRecords, resetFilters]);

  // Manejador de exportación del dataset filtrado
  const handleExportDataset = React.useCallback(async (format: ExportFormat) => {
    if (filteredRecords.length === 0) return;
    try {
      if (format === 'pdf') {
        if (queryResult) {
          exportAnalyticsResultToPDF(queryResult, summaryMetrics, activeBadges);
        }
        return;
      }
      await exportDataset(filteredRecords, format, 'datos_exportaciones_filtrados');
    } catch (err) {
      console.error('Error al exportar dataset:', err);
    }
  }, [filteredRecords, queryResult, summaryMetrics, activeBadges]);


  // Determinar los 8 estados de la aplicación
  const isIdle = uploadState.status === 'idle';
  const isLoading = ['loading', 'parsing', 'validating'].includes(uploadState.status);
  const isError = uploadState.status === 'error';
  const isIncompatible = isError && uploadState.errorMessage?.includes('Estructura no válida');
  const isReady = uploadState.status === 'ready' && records.length > 0;
  const isEmptyDataset = isReady && filteredRecords.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* HEADER PRINCIPAL */}
      <Header
        hasFile={isReady}
        onResetFile={handleReset}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenHistory={() => setHistoryModalOpen(true)}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ESTADO 1: INICIAL & ESTADO 2: CARGANDO */}
        {(!isReady && !isError) && (
          <section className="space-y-6 max-w-4xl mx-auto py-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Dashboard de Análisis de Exportaciones
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Carga tu archivo Excel o CSV con las 8 columnas oficiales para activar tabulación dinámica, visualizaciones Recharts e inteligencia comercial en tiempo real.
              </p>
            </div>

            <FileUploader
              status={uploadState.status}
              progress={uploadState.progress}
              errorMessage={uploadState.errorMessage}
              onFileSelect={handleFileSelect}
            />
          </section>
        )}

        {/* ESTADO 7: ARCHIVO INCOMPATIBLE */}
        {isIncompatible && (
          <section className="py-6">
            <IncompatibleFileState
              errorMessage={uploadState.errorMessage || 'El archivo cargado no coincide con el esquema requerido.'}
              onRetry={handleReset}
            />
          </section>
        )}

        {/* ESTADO 6: ERROR GENERAL */}
        {(isError && !isIncompatible) && (
          <section className="py-6">
            <Card className="bg-red-950/20 border-red-500/30 p-8 max-w-xl mx-auto text-center space-y-4 shadow-xl">
              <div className="p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 w-12 h-12 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100">Error al Procesar el Archivo</h3>
                <p className="text-xs text-red-200/80">{uploadState.errorMessage || 'Ha ocurrido un error inesperado.'}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 mx-auto cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar con otro archivo</span>
              </button>
            </Card>
          </section>
        )}

        {/* VISTA PRINCIPAL DEL DASHBOARD (ESTADO 3, 4, 5 & 8) */}
        {isReady && (
          <div className="space-y-8">
            {/* ARCHIVO CARGADO - METADATOS Y DIAGNÓSTICO DE CALIDAD */}
            {uploadState.metadata && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-1">
                  <FileStatusCard metadata={uploadState.metadata} onReset={handleReset} />
                </div>
                {uploadState.qualityReport && (
                  <div className="lg:col-span-2">
                    <DataQualityDiagnosticsCard report={uploadState.qualityReport} />
                  </div>
                )}
              </section>
            )}

            {/* RESUMEN - 6 TARJETAS KPI */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Resumen de Indicadores Clave
                </h3>

                <div className="flex items-center space-x-2">
                  {saveSuccessMessage && (
                    <span className="text-xs font-semibold text-emerald-400 animate-fade-in">
                      ✓ {saveSuccessMessage}
                    </span>
                  )}
                  <button
                    onClick={handleSaveAnalysis}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-300 bg-blue-950/60 border border-blue-800/60 hover:bg-blue-900/80 transition-all cursor-pointer shadow-sm"
                    title="Guardar metadatos y snapshot del análisis actual"
                  >
                    <BookmarkCheck className="w-4 h-4 text-blue-400" />
                    <span>Guardar Análisis</span>
                  </button>
                </div>
              </div>
              <SummaryPlaceholder metrics={summaryMetrics} />
            </section>


            {/* CONFIGURACIÓN DEL ANÁLISIS & FILTROS MULTICRITERIO */}
            <section className="space-y-6">
              <AnalysisConfigCard
                dimension={dimension}
                metric={metric}
                operation={operation}
                onDimensionChange={setDimension}
                onMetricChange={setMetric}
                onOperationChange={setOperation}
              />

              <FilterPanelCard
                filterOptions={filterOptions}
                activeFilters={filters}
                activeBadges={activeBadges}
                totalRecordsCount={records.length}
                filteredRecordsCount={filteredRecords.length}
                onUpdateFilters={setFilters}
                onResetFilters={resetFilters}
                onRemoveBadge={removeFilterBadge}
                onExportDataset={handleExportDataset}
              />
            </section>

            {/* ESTADO 8: DATASET VACÍO */}
            {isEmptyDataset ? (
              <section>
                <EmptyDatasetState onResetFilters={resetFilters} />
              </section>
            ) : (
              /* RESULTADO - 2 COLUMNAS SINCRONIZADAS (ESCRITORIO / TABLET) */
              <section className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    Resultados del Análisis Sincronizado
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* TABLA RESUMEN (IZQUIERDA) */}
                  <div className="w-full overflow-hidden">
                    <AnalyticsDataTableCard
                      queryResult={queryResult}
                      dimension={dimension}
                      metric={metric}
                      operation={operation}
                      summaryMetrics={summaryMetrics}
                      activeBadges={activeBadges}
                      onDimensionChange={setDimension}
                      onMetricChange={setMetric}
                      onOperationChange={setOperation}
                    />
                  </div>


                  {/* GRÁFICO RESUMEN (DERECHA) */}
                  <div className="w-full overflow-hidden">
                    <AnalyticsChartCard
                      queryResult={queryResult}
                      dimension={dimension}
                      metric={metric}
                      operation={operation}
                      chartType={chartType}
                      onChartTypeChange={setChartType}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODALES DE SUPABASE & HISTORIAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <AnalysisHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        onSelectHistoryItem={handleSelectHistoryItem}
      />
    </div>
  );
}

