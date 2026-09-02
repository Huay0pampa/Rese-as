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
    │   │   ├── FileUploader.tsx    # Zona Dropzone interactiva con barra de progreso
    │   │   └── FileStatusCard.tsx  # Card con metadatos del archivo cargado
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
    │   │   └── parser.ts           # Lector modular de búferes Excel/CSV con SheetJS
    │   ├── validation/
    │   │   └── validator.ts        # Validador de esquema de columnas y obligatoriedad
    │   ├── normalization/
    │   │   └── normalizer.ts       # Normalizador de tipos (fechas ISO, números, textos)
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
    │   ├── export-data.ts          # Interfaces de RawExportRecord, NormalizedExportRecord, FileMetadata
    │   ├── schema.ts               # Interfaces de ColumnDefinition, ValidationResult, ValidationError
    │   ├── analysis.ts             # Interfaces de SummaryMetrics, Aggregations, AnalysisResult
    │   ├── filters.ts              # Interfaces de FilterOptions, ActiveFilters
    │   └── index.ts                # Archivo barril exportador de tipos
    ├── hooks/
    │   ├── useFileUpload.ts        # Hook para gestionar la carga y progreso de archivos
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

## 6. Funcionalidades Terminadas (PROMPT 01)
- [x] **Arquitectura Base Modular**: Separación limpia de `components/`, `lib/`, `types/`, `hooks/`, `services/`, `utils/`.
- [x] **Definición de Tipos TypeScript**: Tipado estricto para registros originales, registros normalizados, metadatos de archivo, resultados de validación, filtros y métricas.
- [x] **Parser de Excel con SheetJS (`xlsx`)**: Carga y lectura de archivos `.xlsx`, `.xls` y `.csv` en memoria sin límite fijo de filas.
- [x] **Motor de Validación de Esquema**: Verificación de presencia de las 8 columnas requeridas y detección de errores de formato por fila.
- [x] **Normalizador de Datos**: Transformación limpia a estructuras tipadas `NormalizedExportRecord` (conversión de fechas a ISO, parseo numérico de FOB Tot y Qty).
- [x] **Motor de Filtrado y Agregación**: Funciones `computeSummaryMetrics` y `extractFilterOptions` data-driven.
- [x] **Preparación de Supabase**: Módulo `src/lib/supabase/client.ts` y `PersistenceService` configurados para integración sin errores de compilación cuando falten variables de entorno.
- [x] **Preparación de Recharts**: Componente `ChartPlaceholder.tsx` integrado con contenedores responsivos de Recharts.
- [x] **UI Profesional Responsive**: Interfaz oscura en Glassmorphism con Dropzone interactivo, indicadores de estado, resumen de KPIs y tabla preliminar.
- [x] **Verificación y Compilación**: Proyecto compilando limpiamente con `npm run build`, `npm run lint` y `npx tsc --noEmit`.

---

## 7. Funcionalidades Pendientes (Fases Posteriores / PROMPT 02+)
- [ ] **Procesamiento de Archivos Pesados en Web Worker**: Optimización para archivos con >50,000 filas.
- [ ] **Tabulación Avanzada Interactiva**: Paginación, ordenamiento por columnas e inspección de filas individuales.
- [ ] **Filtros Dinámicos de UI**: Panel lateral de selección por rango de fechas, exportador, país de destino y canal.
- [ ] **Gráficos Definitivos Recharts**: Ranking Top 10 Exportadores, Evolución Temporal FOB vs Qty, Pie Chart por País de Destino.
- [ ] **Persistencia Real en Supabase**: Creación de tabla en Postgres y sincronización de datasets guardados.
- [ ] **Exportación de Reportes**: Descarga de datos filtrados a Excel/CSV o PDF.
- [ ] **Autenticación y Gestión de Usuarios**: Login/Registro vía Supabase Auth.

---

## 8. Decisiones Técnicas
1. **Modelado Data-Driven**: Nunca se codifican nombres de exportadores, países, años ni número de filas. Todo el sistema responde a la estructura dinámica del archivo cargado.
2. **Next.js App Router**: Utilizado para maximizar el rendimiento, generación de rutas de servidor estáticas y preparación para despliegue en Vercel.
3. **Resiliencia de Supabase**: El cliente de Supabase detecta si `NEXT_PUBLIC_SUPABASE_URL` existe; si no está configurado, la aplicación funciona 100% en modo local de cliente sin romper builds.

---

## 9. Dependencias Instaladas

### Dependencias de Producción:
- `next`: `16.3.4`
- `react`: `19.2.8`
- `react-dom`: `19.2.8`
- `xlsx`: `^0.18.5`
- `recharts`: `^3.10.1`
- `@supabase/supabase-js`: `^2.114.0`
- `lucide-react`: `^1.39.0`
- `clsx`: `^2.1.1`
- `tailwind-merge`: `^3.6.0`

### Dependencias de Desarrollo:
- `typescript`: `^5`
- `tailwindcss`: `^4`
- `@tailwindcss/postcss`: `^4`
- `eslint`: `^9`
- `eslint-config-next`: `16.3.4`
- `@types/node`: `^20`
- `@types/react`: `^19`
- `@types/react-dom`: `^19`

---

## 10. Comandos para Ejecutar

### Servidor de Desarrollo:
```bash
npm run dev
```

### Compilar para Producción:
```bash
npm run build
```

### Iniciar Servidor de Producción:
```bash
npm run start
```

---

## 11. Comandos para Probar

### Verificación de Linters:
```bash
npm run lint
```

### Verificación de Tipos TypeScript:
```bash
npx tsc --noEmit
```

---

## 12. Problemas Conocidos / Notas
- Ningún problema de compilación ni error de linters detectado.
- La aplicación cumple estrictamente con el ámbito del PROMPT 01 y no avanza prematuramente hacia el PROMPT 02.
