import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySlug, recordScanEvent } from '@/lib/tenant-service';
import { detectDeviceType, extractCountry } from '@/lib/device-detection';
import { createGoogleSearchUrl } from '@/lib/google-url';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const startTime = Date.now();
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.redirect(new URL('/', request.url), 302);
  }

  // 1. Fetch tenant with ultra-low latency query
  let tenant = await getTenantBySlug(slug);

  // 2. Ultra-Resilient Fallback: If tenant not yet saved in DB, construct live Google search
  if (!tenant) {
    const formattedName = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    tenant = {
      id: crypto.randomUUID(),
      name: formattedName,
      slug: slug.toLowerCase(),
      google_review_url: createGoogleSearchUrl(formattedName),
      mode: 'DIRECT',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 3. Extract telemetry headers from Edge request
  const userAgent = request.headers.get('user-agent');
  const isMobileHeader = request.headers.get('sec-ch-ua-mobile');
  const deviceType = detectDeviceType(userAgent, isMobileHeader);
  const country = extractCountry(request.headers);
  const city = request.headers.get('x-vercel-ip-city') || request.headers.get('x-city');

  // 4. Fire-and-forget asynchronous scan logging (non-blocking for ultra-low latency)
  try {
    const logPromise = recordScanEvent(
      tenant.id,
      userAgent,
      deviceType,
      country,
      city
    );

    // @ts-expect-error Edge waitUntil
    if (typeof request.waitUntil === 'function') {
      // @ts-expect-error Edge waitUntil
      request.waitUntil(logPromise);
    } else {
      logPromise.catch(() => {});
    }
  } catch {
    // Fail silently
  }

  // 5. Ultra-Fast Redirection based on Mode
  const latency = Date.now() - startTime;

  if (tenant.mode === 'DIRECT') {
    // Immediate 302 Redirect directly to Google Review URL
    const destination = tenant.google_review_url || createGoogleSearchUrl(tenant.name);
    const response = NextResponse.redirect(destination, 302);

    response.headers.set('X-Redirection-Engine', 'Edge-Direct-V1');
    response.headers.set('X-Latency-Ms', latency.toString());
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    return response;
  }

  // Mode: SMART_LANDING -> 307 Redirect to Smart Landing
  const landingUrl = new URL(`/l/${encodeURIComponent(tenant.slug)}`, request.url);
  const response = NextResponse.redirect(landingUrl, 307);

  response.headers.set('X-Redirection-Engine', 'Edge-SmartLanding-V1');
  response.headers.set('X-Latency-Ms', latency.toString());
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  return response;
}
