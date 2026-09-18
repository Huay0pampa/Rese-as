# 🚀 ReviewBoost QR - SaaS B2B de Reseñas & Fidelización en Tiempo Real

SaaS B2B completo de captura de reseñas y fidelización de clientes en el punto de venta físico mediante **QRs Dinámicos de Ultra-Baja Latencia (<100ms)** ejecutados en **Vercel Edge Runtime** con persistencia en **Supabase (PostgreSQL + RLS)** y panel de administración interactivo con **Kit de Impresión**.

---

## ⚡ Características Principales

1. **Motor de Redirección Edge (<100ms)** (`/r/[slug]`):
   - Ejecutado en Vercel Edge Runtime (`export const runtime = 'edge'`).
   - Redirección 302 instantánea a la ficha oficial de Google Maps o 307 a la Smart Landing.
   - Registro de analíticas asíncrono y no bloqueante (`scan_analytics`).
   - Detección de dispositivo (Mobile / Desktop / Tablet) y país geolocalizado en el Edge.

2. **Conmutador de Modo en Tiempo Real**:
   - **Modo Directo 5 Estrellas ⭐**: Abre directamente la ventana de reseñas de Google Maps sin fricción.
   - **Modo Smart Landing Multi-canal 🚀**: Carga una página ultra-ligera (<200ms) que captura reseñas positivas en Google y filtra reclamos o quejas de forma privada hacia WhatsApp con la gerencia antes de que lleguen a internet.

3. **Kit de Impresión Profesional (SVG / PNG / Plantilla PDF)**:
   - Descarga de códigos QR en vectores SVG y PNG de alta resolución (1024px / 300 DPI).
   - Generador de tarjetas de acrílico para mesas, mostradores y vitrinas con instrucciones paso a paso para el cliente.

4. **Panel de Control & Onboarding Guiado**:
   - Asistente de 2 minutos para crear negocios y validar URLs de Google Reviews (`g.page`, `search.google.com`, `maps.app.goo.gl`).
   - Métricas en tiempo real: total de escaneos, desglose por dispositivo, país y registro de eventos.
   - Edición de enlaces en caliente sin reimprimir los códigos QR físicos.

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14+ / Next 16 (App Router, Server Components & Edge Routes).
- **Lenguaje**: TypeScript (Strict Mode).
- **Estilos**: Tailwind CSS + Lucide Icons + SVG Icons.
- **Base de Datos & Auth**: Supabase (PostgreSQL con Row Level Security).
- **Generación QR**: `qrcode` (SVG + PNG alta resolución).
- **Despliegue**: Vercel (Edge Functions + Serverless).

---

## 📦 Configuración y Despliegue

### 1. Variables de Entorno (`.env.local`)
Copia `.env.example` a `.env.local` y agrega tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Base de Datos en Supabase
Ejecuta el archivo [`supabase/schema.sql`](./supabase/schema.sql) en el **SQL Editor** de tu consola de Supabase.

Crea las siguientes tablas y políticas RLS:
- `tenants` (Negocios con slug único, enlaces y modo).
- `scan_analytics` (Eventos de escaneo en tiempo real).
- Políticas de seguridad RLS e índices B-Tree optimizados.

### 3. Ejecución Local
```bash
npm install
npm run dev
```

Visita `http://localhost:3000`:
- **Landing Page**: `http://localhost:3000`
- **Dashboard Admin**: `http://localhost:3000/dashboard`
- **Onboarding**: `http://localhost:3000/dashboard/onboarding`
- **Smart Landing**: `http://localhost:3000/l/cafe-la-terraza`
- **Ruta de Redirección Edge**: `http://localhost:3000/r/cafe-la-terraza`

### 4. Despliegue en Vercel
1. Conecta tu repositorio de GitHub a Vercel.
2. Añade las variables de entorno de Supabase en la configuración del proyecto en Vercel.
3. Despliega con un clic: el motor Edge se activará automáticamente para las rutas `/r/[slug]`.
