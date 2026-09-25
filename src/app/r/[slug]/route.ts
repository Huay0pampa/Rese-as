import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug, recordScanEvent } from "@/lib/tenant-service";
import { detectDeviceType, extractCountry } from "@/lib/device-detection";
import { createGoogleSearchUrl } from "@/lib/google-url";
import { fetchPlaceIdFallback } from "@/lib/place-resolver";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Dynamically resolves a business name/slug to a direct 5-star Google Review URL via Google Places API or zero-cost fallback.
 */
async function resolveDirectReviewUrl(businessQuery: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (apiKey) {
    try {
      const searchQuery = encodeURIComponent(businessQuery.trim());
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === "OK" && data.results && data.results.length > 0) {
          const placeId = data.results[0].place_id;
          if (placeId) {
            return `https://search.google.com/local/writereview?placeid=${placeId}`;
          }
        }
      }
    } catch (err) {
      console.error("Edge Places resolution error:", err);
    }
  }

  // Zero-cost Place ID resolver fallback
  const fallbackPlaceId = await fetchPlaceIdFallback(businessQuery);
  if (fallbackPlaceId) {
    return `https://search.google.com/local/writereview?placeid=${fallbackPlaceId}`;
  }

  return null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const startTime = Date.now();
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  // 1. Fetch tenant from database or in-memory
  let tenant = await getTenantBySlug(slug);

  const formattedName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // 2. Ultra-Resilient Fallback: If tenant not found in DB, construct tenant dynamically
  if (!tenant) {
    tenant = {
      id: crypto.randomUUID(),
      name: formattedName,
      slug: slug.toLowerCase(),
      google_review_url: createGoogleSearchUrl(formattedName),
      mode: "DIRECT",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 3. Extract telemetry headers from Edge request
  const userAgent = request.headers.get("user-agent");
  const isMobileHeader = request.headers.get("sec-ch-ua-mobile");
  const deviceType = detectDeviceType(userAgent, isMobileHeader);
  const country = extractCountry(request.headers);
  const city = request.headers.get("x-vercel-ip-city") || request.headers.get("x-city");

  // 4. Async scan logging
  try {
    const logPromise = recordScanEvent(
      tenant.id,
      userAgent,
      deviceType,
      country,
      city
    );

    // @ts-expect-error Edge waitUntil
    if (typeof request.waitUntil === "function") {
      // @ts-expect-error Edge waitUntil
      request.waitUntil(logPromise);
    } else {
      logPromise.catch(() => {});
    }
  } catch {
    // Fail silently
  }

  // 5. Check if URL is already a direct writereview URL or contains placeid
  let destination = tenant.google_review_url;

  // If destination is a generic maps search URL, attempt live Place ID resolution to force direct 5-star modal!
  if (!destination || destination.includes("maps/search") || !destination.includes("placeid")) {
    if (tenant.place_id) {
      destination = `https://search.google.com/local/writereview?placeid=${tenant.place_id}`;
    } else {
      const resolvedUrl = await resolveDirectReviewUrl(tenant.name || formattedName);
      if (resolvedUrl) {
        destination = resolvedUrl;
      }
    }
  }

  if (!destination) {
    destination = createGoogleSearchUrl(tenant.name);
  }

  const latency = Date.now() - startTime;

  if (tenant.mode === "DIRECT") {
    // Immediate 302 Redirect directly to Google Review 5-Star Form
    const response = NextResponse.redirect(destination, 302);

    response.headers.set("X-Redirection-Engine", "Edge-Direct-V1");
    response.headers.set("X-Latency-Ms", latency.toString());
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    return response;
  }

  // Mode: SMART_LANDING -> 307 Redirect to Smart Landing
  const landingUrl = new URL(`/l/${encodeURIComponent(tenant.slug)}`, request.url);
  const response = NextResponse.redirect(landingUrl, 307);

  response.headers.set("X-Redirection-Engine", "Edge-SmartLanding-V1");
  response.headers.set("X-Latency-Ms", latency.toString());
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  return response;
}
