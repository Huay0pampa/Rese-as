'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { PersistenceService, AnalysisHistoryItem } from '@/services/persistence-service';
import { X, History, Trash2, Calendar, FileSpreadsheet, Layers, Loader2, BookmarkCheck } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistoryItem?: (item: AnalysisHistoryItem) => void;
}

export function AnalysisHistoryModal({ isOpen, onClose, onSelectHistoryItem }: AnalysisHistoryModalProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      PersistenceService.getAnalysisHistory()
        .then((items) => setHistory(items))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await PersistenceService.deleteAnalysisHistoryItem(id);
    if (success) {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl bg-slate-900/95 border-slate-800 shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Historial de Análisis Guardados</h3>
              <p className="text-xs text-slate-400">
                Metadatos, filtros y snapshots de consultas ejecutadas previamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs">Cargando historial...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <BookmarkCheck className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No hay análisis guardados aún</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Los análisis que guardes durante tu sesión aparecerán aquí con sus configuraciones.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onSelectHistoryItem) onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-950 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                      {item.fileName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(item.createdAt)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Eliminar del historial"
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Registros: <strong className="text-slate-200">{item.recordCount}</strong>
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    Dimensión: <strong className="text-indigo-300">{item.dimension}</strong>
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Métrica: <strong className="text-slate-200">{item.metric}</strong> ({item.operation})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
