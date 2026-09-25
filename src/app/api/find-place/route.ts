import { NextRequest, NextResponse } from "next/server";
import { resolvePlacesWithFallback } from "@/lib/place-resolver";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_API_KEY;

    const { results, source, status, error } = await resolvePlacesWithFallback(query, apiKey);

    return NextResponse.json(
      {
        results,
        source,
        fallback: results.length === 0,
        status,
        error: error || (results.length === 0 ? "NO_PLACES_FOUND" : undefined),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("find-place API route error:", err);
    return NextResponse.json({ results: [], fallback: true, error: "SERVER_ERROR" }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query") || "chifa jumbo";
  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const { results, source, status, error } = await resolvePlacesWithFallback(query, apiKey);
  return NextResponse.json({ results, source, status, error }, { status: 200 });
}
