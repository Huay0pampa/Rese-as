# PROJECT_STATE.md — Analizador de Exportaciones

## 1. Nombre del Proyecto
**Analizador de Exportaciones**

## 2. Objetivo
Crear una aplicación web data-driven modular para cargar reportes Excel o CSV con un esquema fijo de 8 columnas aduaneras y cantidad variable de registros (cientos, miles o decenas de miles), procesarlos en tiempo real y preparar la arquitectura para tabulación interactiva, filtrado avanzado, gráficos dinámicos con Recharts y almacenamiento persistente en Supabase.

---

## 3. Stack Tecnológico
- **Framework Web**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript (Strict Mode)
- **Biblioteca de UI**: React 19
- **Estilos**: Tailwind CSS v4 (Vanilla CSS variables + Glassmorphism)
- **Iconografía**: `lucide-react`
- **Lectura de Excel**: `xlsx` (SheetJS v0.18.5)
- **Gráficos**: `recharts` v3.10.1
- **Backend / Persistencia**: Supabase JS SDK v2.114.0 (Cliente y servicios listos para Fase 2)
- **Despliegue Objetivo**: Vercel
- **Control de Versiones**: Git / GitHub

---

## 4. Estructura de Carpetas

```
c:\Users\Acer\Desktop\APP Veritrade\
├── PROJECT_STATE.md                # Documento oficial de estado y entrega entre chats
├── README.md                       # Instrucciones rápidas de instalación y uso
├── package.json                    # Dependencias y scripts del proyecto
├── tsconfig.json                   # Configuración de TypeScript
├── eslint.config.mjs               # Configuración de ESLint
├── next.config.ts                  # Configuración de Next.js
├── public/                         # Recursos estáticos
├── scripts/
│   ├── test-analytics-engine.mjs   # Script de pruebas automatizadas para el motor de análisis
│   └── test-filter-engine.mjs      # Script de pruebas automatizadas para el motor de filtros
└── src/
    ├── app/
    │   ├── globals.css             # Estilos globales, variables de tema y scrollbars
    │   ├── layout.tsx              # Root Layout (Google Font Inter, Header, Footer)
    │   └── page.tsx                # Página principal del Analizador (con Filtros y Diagnóstico)
    ├── components/
    │   ├── common/
    │   │   ├── Header.tsx          # Cabecera principal con branding e indicadores
    │   │   ├── Footer.tsx          # Pie de página con créditos de arquitectura
    │   │   ├── Card.tsx            # Contenedor UI de cristal (Glassmorphism)
    │   │   └── Badge.tsx           # Etiqueta visual reutilizable
    │   ├── upload/
    │   │   ├── FileUploader.tsx    # Zona Dropzone interactiva con barra de progreso y manejo de errores
    │   │   └── FileStatusCard.tsx  # Card con metadatos del archivo cargado (registros, columnas, hoja)
    │   ├── dashboard/
    │   │   ├── DashboardShell.tsx  # Layout grid para el dashboard
    │   │   ├── EmptyState.tsx      # Estado inicial explicativo previo a la carga
    │   │   ├── DataQualityDiagnosticsCard.tsx # Tarjeta de Diagnóstico de Calidad de Datos del Archivo
    │   │   ├── FilterPanelCard.tsx # Tarjeta de Panel de Filtros Dinámicos Multicriterio
    │   │   └── SummaryPlaceholder.tsx# Tarjetas de resumen de KPIs (FOB Total, Qty, etc.)
    │   ├── tables/
    │   │   └── DataTablePlaceholder.tsx # Vista previa y estructura para la tabla interactiva
    │   └── charts/
    │       └── ChartPlaceholder.tsx  # Vista previa y contenedor listo para Recharts
    ├── lib/
    │   ├── constants/
    │   │   └── schema.ts           # Definición de las 8 columnas oficiales y tipos mime
    │   ├── excel/
    │   │   └── parser.ts           # Lector modular de búferes Excel/CSV
    │   ├── validation/
    │   │   ├── validator.ts        # Validador de esquema de columnas y obligatoriedad
    │   │   └── diagnostics.ts      # Motor de Diagnóstico de Calidad (DataQualityReport)
    │   ├── normalization/
    │   │   └── normalizer.ts       # Normalizador de datos (limpieza de texto, desglose temporal de fechas)
    │   ├── processing/
    │   │   └── processor.ts        # Pipeline unificado (Parsing -> Validation -> Normalization -> Diagnostics)
    │   ├── analysis/
    │   │   ├── analyzer.ts         # Cálculo dinámico de métricas y agregaciones
    │   │   └── analyticsEngine.ts  # Motor de Análisis Dinámico
    │   ├── filters/
    │   │   └── filterEngine.ts     # Motor de filtrado multicriterio en memoria y extracción dinámica de opciones
    │   ├── export/
    │   │   └── exporter.ts         # Interfaz para exportación (XLSX, CSV, JSON)
    │   └── supabase/
    │       └── client.ts           # Cliente e inicializador de Supabase tolerante a entorno
    ├── services/
    │   ├── file-service.ts         # Servicio de ciclo de vida de archivos
    │   ├── persistence-service.ts  # Servicio de persistencia en Supabase (Placeholder)
    │   └── analytics-service.ts    # Servicio de cálculo analítico
    ├── types/
    │   ├── export-data.ts          # Interfaces de datos exportados y metadatos
    │   ├── schema.ts               # Interfaces de definición de esquema
    │   ├── analysis.ts             # Interfaces de análisis y consultas
    │   ├── filters.ts              # Interfaces (ActiveFilters, FilterOptions, ActiveFilterBadge)
    │   └── index.ts                # Archivo barril exportador de tipos
    ├── hooks/
    │   ├── useFileUpload.ts        # Hook para gestionar la carga y progreso
    │   ├── useExportData.ts        # Hook para el estado de datos normalizados, insignias y filtrado
    │   └── useAnalyticsQuery.ts    # Hook para consultas memoizadas al motor de análisis
    └── utils/
        ├── formatters.ts           # Formateadores de moneda (USD FOB), fechas y números
        └── cn.ts                   # Utilidad para combinar clases de Tailwind CSS
```

---

## 5. Esquema Oficial de Columnas (Excel)

La aplicación valida strictly la presencia de las siguientes 8 columnas oficiales:

1. `Descripcion de la Partida Aduanera` (Texto)
2. `Fecha` (Fecha YYYY-MM-DD)
3. `Exportador` (Texto)
4. `Qty 1` (Número)
5. `U$ FOB Tot` (Número flotante USD)
6. `U$ FOB Und 2` (Número flotante USD)
7. `Pais de Destino` (Texto)
8. `Canal` (Texto)

---

## 6. Funcionalidades Terminadas

### PROMPT 01 — Arquitectura Base
- [x] **Arquitectura Base Modular**: Separación limpia de `components/`, `lib/`, `types/`, `hooks/`, `services/`, `utils/`.
- [x] **Definición de Tipos TypeScript**: Tipado estricto para registros originales, normalizados, metadatos y análisis.

### PROMPT 02 — Carga Dinámica de Excel
- [x] **Soporte de Formatos**: Carga dinámica de `.xlsx`, `.xls` y `.csv` sin límites fijos de filas.
- [x] **Mapeo por Nombre de Columna**: Mapeo independiente del orden de columnas.
- [x] **Preservación de Columnas Adicionales**: Guardadas en `extraFields`.

### PROMPT 03 — Validación y Normalización
- [x] **Limpieza de Texto y Desglose Temporal**: Extracción de `year`, `monthNumber`, `monthName`, `yearMonth` e `isoDate`.
- [x] **Diagnóstico de Calidad del Archivo (`DataQualityDiagnosticsCard`)**: Métricas de completitud, score global `0-100%` y calificación `A`-`F`.

### PROMPT 04 — Motor de Análisis Dinámico
- [x] **Dimensiones Seleccionables**: Año, Mes, Año-Mes, Descripción de Partida, Exportador, País de Destino, Canal.
- [x] **Métricas y Operaciones**: Suma, Promedio, Mínimo, Máximo, Conteo sobre Qty 1, FOB Tot, FOB Und 2.
- [x] **Ordenamiento Cronológico Inteligente**: Meses ordenados por ordinal (1-12), nunca alfabético.

### PROMPT 05 — Sistema de Filtros Dinámicos
- [x] **Extracción 100% Data-Driven (0 Hardcoding)**:
  - Generación dinámica de opciones de filtrado a partir de los datos reales del archivo cargado (Años, Exportadores, Países de Destino, Partidas Aduaneras, Canales).
  - Si el archivo trae 31 exportadores, se muestran 31. Si trae 45, se muestran 45. Si un país no existe en la carga, no se muestra.
- [x] **Combinación Multicriterio**:
  - Aplicación simultánea de filtros (Lógica AND entre campos, lógica OR dentro de selecciones múltiples).
  - Ejemplo verificado: `Año = 2025` AND `País = China` AND `Exportador = EXANDAL S.A.C.`.
- [x] **Gestión de Filtros en UI (`FilterPanelCard`)**:
  - **Búsqueda Libre**: Filtro por texto en descripción, exportador, país o canal.
  - **Rango de Fechas**: Selectores de fecha inicio y fin.
  - **Insignias de Filtros Activos (`ActiveFilterBadge`)**: Chips clicables con botón `(x)` para remover filtros individuales.
  - **Botón "Limpiar Filtros"**: Restablece todos los criterios de filtrado al estado inicial.
  - **Indicador de Registros Filtrados**: Muestra el total de registros visibles vs el total cargado y su porcentaje (`Mostrando X de Y registros (Z%)`).
- [x] **Pruebas Automatizadas**: Ejecutado `scripts/test-filter-engine.mjs` validando combinación multicriterio y extracción dinámica.

---

## 7. Funcionalidades Pendientes (Fases Posteriores / PROMPT 06+)
- [ ] **Tabulación Avanzada Interactiva**: Paginación, ordenamiento por columnas e inspección de filas individuales.
- [ ] **Gráficos Definitivos Recharts**: Ranking Top 10 Exportadores, Evolución Temporal FOB vs Qty, Pie Chart por País de Destino.
- [ ] **Persistencia Real en Supabase**: Creación de tabla en Postgres y sincronización de datasets guardados.
- [ ] **Exportación de Reportes**: Descarga de datos filtrados a Excel/CSV o PDF.

---

## 8. Decisiones Técnicas
1. **Extracción Dinámica Pura**: Las opciones de filtro se recalculan vía `useMemo` sobre la propiedad `records` limpia, garantizando refresco inmediato al cambiar de archivo.
2. **Despliegue de Chips Removibles**: Cada filtro activo genera un badge con identificador único que permite removerlo de forma independiente sin afectar los demás filtros seleccionados.
3. **Arquitectura Extensible**: La estructura `ActiveFilters` y `filterExportRecords` está preparada para recibir filtros adicionales en el futuro (ej. rangos de precios o campos personalizados).

---

## 9. Dependencias Instaladas
- `next`: `16.3.4`
- `react`: `19.2.8`
- `xlsx`: `^0.18.5`
- `recharts`: `^3.10.1`
- `@supabase/supabase-js`: `^2.114.0`
- `lucide-react`: `^1.39.0`
- `clsx`: `^2.1.1`
- `tailwind-merge`: `^3.6.0`

---

## 10. Comandos para Ejecutar y Probar
- Servidor de Desarrollo: `npm run dev`
- Compilación de Producción: `npm run build`
- Linter: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Pruebas del Motor de Análisis: `npx tsx scripts/test-analytics-engine.mjs`
- Pruebas del Motor de Filtros: `npx tsx scripts/test-filter-engine.mjs`
