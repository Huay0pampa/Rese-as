'use client';

import { useState, useCallback } from 'react';
import { FileProcessingState } from '@/types';
import { ProcessedPipelineResult } from '@/lib/processing/processor';
import { FileService } from '@/services/file-service';

export function useFileUpload() {
  const [state, setState] = useState<FileProcessingState>({
    file: null,
    status: 'idle',
    progress: 0,
    metadata: null,
    qualityReport: null,
    rawRecords: [],
    normalizedRecords: [],
    errorMessage: null,
  });

  const uploadFile = useCallback(async (file: File): Promise<ProcessedPipelineResult | null> => {
    try {
      setState((prev) => ({
        ...prev,
        file,
        status: 'loading',
        progress: 20,
        errorMessage: null,
      }));

      setState((prev) => ({ ...prev, status: 'parsing', progress: 50 }));

      const result = await FileService.processFile(file);

      setState((prev) => ({ ...prev, status: 'validating', progress: 80 }));

      // Missing required columns check
      if (result.validation.missingColumns.length > 0) {
        const missingList = result.validation.missingColumns.map((c) => `'${c}'`).join(', ');
        const errorMessage = `Estructura no válida. Falta(n) la(s) columna(s) obligatoria(s): ${missingList}. Por favor verifica el encabezado de tu archivo Excel.`;

        setState((prev) => ({
          ...prev,
          status: 'error',
          progress: 0,
          errorMessage,
        }));
        return result;
      }

      if (!result.validation.isValid && result.validation.validRowsCount === 0) {
        const firstError = result.validation.errors[0]?.message || 'Error en la estructura del archivo.';
        setState((prev) => ({
          ...prev,
          status: 'error',
          progress: 0,
          errorMessage: firstError,
        }));
        return result;
      }

      setState({
        file,
        status: 'ready',
        progress: 100,
        metadata: result.metadata,
        qualityReport: result.qualityReport,
        rawRecords: result.rawRecords,
        normalizedRecords: result.normalizedRecords,
        errorMessage: null,
      });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar el archivo.';
      setState((prev) => ({
        ...prev,
        status: 'error',
        progress: 0,
        errorMessage: message,
      }));
      return null;
    }
  }, []);

  const resetUpload = useCallback(() => {
    setState({
      file: null,
      status: 'idle',
      progress: 0,
      metadata: null,
      qualityReport: null,
      rawRecords: [],
      normalizedRecords: [],
      errorMessage: null,
    });
  }, []);

  return {
    state,
    uploadFile,
    resetUpload,
  };
}
