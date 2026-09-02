'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { ACCEPTED_FILE_EXTENSIONS } from '@/lib/constants/schema';
import { FileProcessingStatus } from '@/types';

export interface FileUploaderProps {
  status: FileProcessingStatus;
  progress: number;
  errorMessage: string | null;
  onFileSelect: (file: File) => void;
}

export function FileUploader({
  status,
  progress,
  errorMessage,
  onFileSelect,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const isProcessing = status === 'loading' || status === 'parsing' || status === 'validating';

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer overflow-hidden ${
          isDragOver
            ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-slate-800/80 text-blue-400 border border-slate-700/60 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-base font-medium text-slate-100">
              Arrastra y suelta tu archivo Excel aquí
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Soporta archivos <span className="font-semibold text-slate-300">.xlsx</span>,{' '}
              <span className="font-semibold text-slate-300">.xls</span> o{' '}
              <span className="font-semibold text-slate-300">.csv</span> sin límite de filas
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-md border border-slate-800">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Esquema esperado: 8 Columnas Aduaneras Oficiales</span>
          </div>
        </div>

        {/* Loading / Progress Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-full max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-medium text-blue-400 animate-pulse">
              {status === 'loading' && 'Cargando archivo...'}
              {status === 'parsing' && 'Leyendo estructura Excel...'}
              {status === 'validating' && 'Validando columnas y registros...'}
            </p>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Error de validación: </span>
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
