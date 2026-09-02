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
└── src/
    ├── app/
    │   ├── globals.css             # Estilos globales, variables de tema y scrollbars
    │   ├── layout.tsx              # Root Layout (Google Font Inter, Header, Footer)
    │   └── page.tsx                # Página principal del Analizador
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
    │   │   └── SummaryPlaceholder.tsx# Tarjetas de resumen de KPIs (FOB Total, Qty, etc.)
    │   ├── tables/
    │   │   └── DataTablePlaceholder.tsx # Vista previa y estructura para la tabla interactiva
    │   └── charts/
    │       └── ChartPlaceholder.tsx  # Vista previa y contenedor listo para Recharts
    ├── lib/
    │   ├── constants/
    │   │   └── schema.ts           # Definición de las 8 columnas oficiales y tipos mime
    │   ├── excel/
    │   │   └── parser.ts           # Lector modular de búferes Excel/CSV (extrae hoja, total columnas, columnas extra)
    │   ├── validation/
    │   │   └── validator.ts        # Validador de esquema de columnas y obligatoriedad (nombres exactos de columnas faltantes)
    │   ├── normalization/
    │   │   └── normalizer.ts       # Normalizador de tipos (preserva columnas adicionales en extraFields)
    │   ├── processing/
    │   │   └── processor.ts        # Pipeline unificado (Parsing -> Validation -> Normalization)
    │   ├── analysis/
    │   │   └── analyzer.ts         # Cálculo dinámico de métricas y agregaciones
    │   ├── filters/
    │   │   └── filterEngine.ts     # Motor de filtrado multicriterio en memoria
    │   ├── export/
    │   │   └── exporter.ts         # Interfaz para exportación (XLSX, CSV, JSON)
    │   └── supabase/
    │       └── client.ts           # Cliente e inicializador de Supabase tolerante a entorno
    ├── services/
    │   ├── file-service.ts         # Servicio de ciclo de vida de archivos
    │   ├── persistence-service.ts  # Servicio de persistencia en Supabase (Placeholder)
    │   └── analytics-service.ts    # Servicio de cálculo analítico
    ├── types/
    │   ├── export-data.ts          # Interfaces de RawExportRecord, NormalizedExportRecord, FileMetadata (hoja, columnas, extraFields)
    │   ├── schema.ts               # Interfaces de ColumnDefinition, ValidationResult, ValidationError
    │   ├── analysis.ts             # Interfaces de SummaryMetrics, Aggregations, AnalysisResult
    │   ├── filters.ts              # Interfaces de FilterOptions, ActiveFilters
    │   └── index.ts                # Archivo barril exportador de tipos
    ├── hooks/
    │   ├── useFileUpload.ts        # Hook para gestionar la carga, progreso y errores detallados
    │   └── useExportData.ts        # Hook para el estado de datos normalizados y filtros
    └── utils/
        ├── formatters.ts           # Formateadores de moneda (USD FOB), fechas y números
        └── cn.ts                   # Utilidad para combinar clases de Tailwind CSS
```

---

## 5. Esquema Oficial de Columnas (Excel)

La aplicación valida estrictamente la presencia de las siguientes 8 columnas oficiales:

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
- [x] **Definición de Tipos TypeScript**: Tipado estricto para registros originales, registros normalizados, metadatos de archivo, resultados de validación, filtros y métricas.
- [x] **Preparación de Supabase & Recharts**: Módulos y servicios desacoplados.

### PROMPT 02 — Carga Dinámica de Excel
- [x] **Soporte de Formatos**: Carga completa de archivos `.xlsx`, `.xls` y `.csv`.
- [x] **Lectura 100% Dinámica**: Sin límites fijos de filas, rangos rígidos ni referencias estáticas (procesa todas las filas presentes).
- [x] **Mapeo por Nombre de Columna**: Mapeo independiente de la posición u orden de las columnas.
- [x] **Preservación de Columnas Adicionales**: No se rechaza el archivo si tiene columnas extra. Se conservan en la propiedad `extraFields` de cada registro.
- [x] **Manejo Detallado de Errores**:
  - Si el archivo no es un Excel válido / está corrupto: muestra mensaje de error en español comprensible.
  - Si falta una columna requerida: informa exactamente qué columna(s) faltan por su nombre.
- [x] **Información de Metadatos Completa**: Muestra Banner *"Archivo cargado correctamente."*, Nombre del archivo, Tamaño, Cantidad de registros, Columnas detectadas y Nombre de la hoja activa.
- [x] **Verificación y Compilación**: Proyecto verificado con `npx tsc --noEmit`, `npm run lint` y `npm run build`.

---

## 7. Funcionalidades Pendientes (Fases Posteriores / PROMPT 03+)
- [ ] **Procesamiento de Archivos Pesados en Web Worker**: Optimización para archivos con >50,000 filas.
- [ ] **Tabulación Avanzada Interactiva**: Paginación, ordenamiento por columnas e inspección de filas individuales.
- [ ] **Filtros Dinámicos de UI**: Panel lateral de selección por rango de fechas, exportador, país de destino y canal.
- [ ] **Gráficos Definitivos Recharts**: Ranking Top 10 Exportadores, Evolución Temporal FOB vs Qty, Pie Chart por País de Destino.
- [ ] **Persistencia Real en Supabase**: Creación de tabla en Postgres y sincronización de datasets guardados.
- [ ] **Exportación de Reportes**: Descarga de datos filtrados a Excel/CSV o PDF.

---

## 8. Decisiones Técnicas
1. **Modelado Data-Driven**: Nunca se codifican nombres de exportadores, países, años ni número de filas. Todo el sistema responde a la estructura dinámica del archivo cargado.
2. **Preservación de Columnas Extra**: Se identifican y almacenan dentro de `extraFields` en cada registro sin alterar las 8 propiedades normalizadas oficiales.
3. **Mapeo por Nombre Caso-Insensible**: El validador busca coincidencias eliminando espacios laterales e ignorando mayúsculas/minúsculas (`toLowerCase()`), haciendo el sistema tolerante a variaciones de orden.

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
