'use client';

import React, { useState } from 'react';
import {
  ActiveFilters,
  FilterOptions,
  ActiveFilterBadge,
} from '@/types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Filter,
  RotateCcw,
  Search,
  Calendar,
  Building2,
  Globe2,
  FileText,
  Radio,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

export interface FilterPanelCardProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  activeBadges: ActiveFilterBadge[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
  onUpdateFilters: (newFilters: ActiveFilters) => void;
  onResetFilters: () => void;
  onRemoveBadge: (badge: ActiveFilterBadge) => void;
}

export function FilterPanelCard({
  filterOptions,
  activeFilters,
  activeBadges,
  totalRecordsCount,
  filteredRecordsCount,
  onUpdateFilters,
  onResetFilters,
  onRemoveBadge,
}: FilterPanelCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const percentage =
    totalRecordsCount > 0
      ? Math.round((filteredRecordsCount / totalRecordsCount) * 1000) / 10
      : 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateFilters({ ...activeFilters, searchQuery: e.target.value });
  };

  const handleYearToggle = (year: number) => {
    const exists = activeFilters.selectedYears.includes(year);
    const selectedYears = exists
      ? activeFilters.selectedYears.filter((y) => y !== year)
      : [...activeFilters.selectedYears, year];
    onUpdateFilters({ ...activeFilters, selectedYears });
  };

  const handleExporterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (!activeFilters.selectedExporters.includes(val)) {
      onUpdateFilters({
        ...activeFilters,
        selectedExporters: [...activeFilters.selectedExporters, val],
      });
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (!activeFilters.selectedDestinations.includes(val)) {
      onUpdateFilters({
        ...activeFilters,
        selectedDestinations: [...activeFilters.selectedDestinations, val],
      });
    }
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (!activeFilters.selectedCustomsHeadings.includes(val)) {
      onUpdateFilters({
        ...activeFilters,
        selectedCustomsHeadings: [...activeFilters.selectedCustomsHeadings, val],
      });
    }
  };

  const handleChannelToggle = (channel: string) => {
    const exists = activeFilters.selectedChannels.includes(channel);
    const selectedChannels = exists
      ? activeFilters.selectedChannels.filter((c) => c !== channel)
      : [...activeFilters.selectedChannels, channel];
    onUpdateFilters({ ...activeFilters, selectedChannels });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
    onUpdateFilters({
      ...activeFilters,
      dateRange: {
        ...activeFilters.dateRange,
        [field]: val || null,
      },
    });
  };

  return (
    <Card className="p-6 space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Filtros Dinámicos del Dataset</span>
              <Badge variant="info" className="text-xs">
                {filterOptions.exporters.length} exportadores / {filterOptions.destinations.length} países
              </Badge>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filtrado multicriterio generado 100% dinámicamente desde el archivo cargado
            </p>
          </div>
        </div>

        {/* Counter Badge & Reset Button */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Mostrando: </span>
            <span className="font-bold text-indigo-400">
              {formatNumber(filteredRecordsCount)}
            </span>
            <span className="text-slate-500"> / {formatNumber(totalRecordsCount)} ({percentage}%)</span>
          </div>

          {activeBadges.length > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-medium transition-all"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Active Filter Chips / Badges Bar */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-slate-800/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filtros Activos ({activeBadges.length}):
          </span>
          {activeBadges.map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shadow-sm"
            >
              <span>{badge.label}</span>
              <button
                onClick={() => onRemoveBadge(badge)}
                className="hover:text-rose-300 focus:outline-none p-0.5 rounded-full hover:bg-indigo-900/60 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Expanded Controls Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Free Text Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Búsqueda Libre</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar exportador, partida, país..."
                value={activeFilters.searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-slate-900/80 text-slate-200 placeholder-slate-500 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {activeFilters.searchQuery && (
                <button
                  onClick={() => onUpdateFilters({ ...activeFilters, searchQuery: '' })}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rango de Fechas</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={activeFilters.dateRange.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="bg-slate-900/80 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <input
                type="date"
                value={activeFilters.dateRange.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="bg-slate-900/80 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Exporters Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Exportador</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {filterOptions.exporters.length} disponibles
              </span>
            </label>
            <select
              onChange={handleExporterChange}
              value=""
              className="w-full bg-slate-900/80 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">-- Agregar Exportador --</option>
              {filterOptions.exporters.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Country Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>País de Destino</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {filterOptions.destinations.length} disponibles
              </span>
            </label>
            <select
              onChange={handleDestinationChange}
              value=""
              className="w-full bg-slate-900/80 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">-- Agregar País --</option>
              {filterOptions.destinations.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>
          </div>

          {/* Customs Heading Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Partida Aduanera</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {filterOptions.customsHeadings.length} disponibles
              </span>
            </label>
            <select
              onChange={handleHeadingChange}
              value=""
              className="w-full bg-slate-900/80 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">-- Agregar Partida --</option>
              {filterOptions.customsHeadings.map((head) => (
                <option key={head} value={head}>
                  {head.length > 40 ? head.substring(0, 40) + '...' : head}
                </option>
              ))}
            </select>
          </div>

          {/* Year & Channel Checkboxes */}
          <div className="space-y-3 md:col-span-2 lg:col-span-1">
            {/* Years */}
            {filterOptions.years.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Año</label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.years.map((year) => {
                    const selected = activeFilters.selectedYears.includes(year);
                    return (
                      <button
                        key={year}
                        onClick={() => handleYearToggle(year)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          selected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Channels */}
            {filterOptions.channels.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Canal Aduanero</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.channels.map((chan) => {
                    const selected = activeFilters.selectedChannels.includes(chan);
                    return (
                      <button
                        key={chan}
                        onClick={() => handleChannelToggle(chan)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {chan}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
