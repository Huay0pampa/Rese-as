# Analizador de Exportaciones

Aplicación web data-driven desarrollada con **Next.js**, **TypeScript**, **Tailwind CSS**, **Recharts** y **SheetJS (XLSX)** para procesar y analizar reportes de exportaciones aduaneras.

---

## 🚀 Características (PROMPT 01 - Arquitectura Base)

- **Carga de Archivos Flexibles**: Soporte para archivos `.xlsx`, `.xls` y `.csv`.
- **Esquema Aduanero Estricto**: Validación automática de las 8 columnas requeridas:
  1. `Descripcion de la Partida Aduanera`
  2. `Fecha`
  3. `Exportador`
  4. `Qty 1`
  5. `U$ FOB Tot`
  6. `U$ FOB Und 2`
  7. `Pais de Destino`
  8. `Canal`
- **Procesamiento Data-Driven**: Sin límites fijos de filas ni valores codificados (funciona con cientos, miles o decenas de miles de filas).
- **Métricas y Resumen**: Cálculo dinámico de totales FOB, volumen total, exportadores únicos y destinos.
- **Preparado para Supabase & Recharts**: Arquitectura modular dividida en componentes, utilidades, tipos, servicios y hooks.

---

## 🛠️ Instalación y Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar en entorno de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

3. Validar compilación y tipos:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

---

## 📄 Estado del Proyecto

Consulta [`PROJECT_STATE.md`](./PROJECT_STATE.md) para ver la hoja de ruta detallada, arquitectura de carpetas, dependencias y próximos pasos para PROMPT 02.
