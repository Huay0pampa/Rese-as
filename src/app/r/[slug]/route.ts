import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySlug, recordScanEvent } from '@/lib/tenant-service';
import { detectDeviceType, extractCountry } from '@/lib/device-detection';

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
  const tenant = await getTenantBySlug(slug);

  if (!tenant || !tenant.is_active) {
    // Graceful fallback for unregistered QR codes
    const notFoundUrl = new URL('/?error=tenant_not_found', request.url);
    notFoundUrl.searchParams.set('slug', slug);
    return NextResponse.redirect(notFoundUrl, 302);
  }

  // 2. Extract telemetry headers from Edge request
  const userAgent = request.headers.get('user-agent');
  const isMobileHeader = request.headers.get('sec-ch-ua-mobile');
  const deviceType = detectDeviceType(userAgent, isMobileHeader);
  const country = extractCountry(request.headers);
  const city = request.headers.get('x-vercel-ip-city') || request.headers.get('x-city');

  // 3. Fire-and-forget asynchronous scan logging (non-blocking for ultra-low latency)
  // Using Promise without awaiting ensures <100ms response time
  try {
    const logPromise = recordScanEvent(
      tenant.id,
      userAgent,
      deviceType,
      country,
      city
    );
    
    // In Edge environments supporting waitUntil (Next.js / Cloudflare / Vercel Edge)
    // or standard async detached execution
    // @ts-expect-error waitUntil might be provided in certain Edge contexts
    if (typeof request.waitUntil === 'function') {
      // @ts-expect-error waitUntil execution
      request.waitUntil(logPromise);
    } else {
      // Run detached
      logPromise.catch(() => {});
    }
  } catch {
    // Fail silently so customer is never blocked
  }

  // 4. Ultra-Fast Redirection based on Mode
  const latency = Date.now() - startTime;
  
  if (tenant.mode === 'DIRECT') {
    // Immediate 302 Redirect directly to Google Review URL
    const destination = tenant.google_review_url || 'https://maps.google.com';
    const response = NextResponse.redirect(destination, 302);
    
    // Performance & cache control headers
    response.headers.set('X-Redirection-Engine', 'Edge-Direct-V1');
    response.headers.set('X-Latency-Ms', latency.toString());
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    return response;
  }

  // Mode: SMART_LANDING -> Fast 307 Redirect to the ultra-lightweight landing page
  const landingUrl = new URL(`/l/${encodeURIComponent(tenant.slug)}`, request.url);
  const response = NextResponse.redirect(landingUrl, 307);
  
  response.headers.set('X-Redirection-Engine', 'Edge-SmartLanding-V1');
  response.headers.set('X-Latency-Ms', latency.toString());
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  return response;
}
