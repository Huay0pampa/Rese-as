import { NextRequest, NextResponse } from "next/server";
import { GooglePlaceResult } from "@/types";

export const runtime = "nodejs";

/**
 * Handles Places Text Search API queries.
 * Adds region & language bias (region=pe, language=es) and auto-retries with location suffix
 * so queries originating from Vercel's US servers find local businesses in Peru / LATAM reliably.
 */
async function searchPlaces(rawQuery: string, apiKey: string): Promise<{ results: GooglePlaceResult[]; status: string; error?: string }> {
  const cleanQuery = rawQuery.trim();
  if (!cleanQuery) return { results: [], status: "ZERO_RESULTS" };

  // Attempt 1: Direct query with regional bias (pe) & spanish language
  const searchQuery1 = encodeURIComponent(cleanQuery);
  const url1 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery1}&region=pe&language=es&key=${apiKey}`;

  try {
    const resp1 = await fetch(url1);
    if (resp1.ok) {
      const data1 = await resp1.json();

      if (data1.status === "OK" && data1.results && data1.results.length > 0) {
        const results: GooglePlaceResult[] = data1.results.slice(0, 6).map((place: {
          place_id: string;
          name: string;
          formatted_address: string;
          rating?: number;
          user_ratings_total?: number;
        }) => ({
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          review_url: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
        }));
        return { results, status: "OK" };
      }

      if (data1.status !== "OK" && data1.status !== "ZERO_RESULTS") {
        return { results: [], status: data1.status, error: data1.error_message };
      }
    }
  } catch (err) {
    console.error("Places API search error 1:", err);
  }

  // Attempt 2: Auto-retry appending " Peru" for country-wide matching on Vercel US servers
  if (!cleanQuery.toLowerCase().includes("peru") && !cleanQuery.toLowerCase().includes("lima")) {
    try {
      const searchQuery2 = encodeURIComponent(`${cleanQuery} Peru`);
      const url2 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery2}&region=pe&language=es&key=${apiKey}`;
      const resp2 = await fetch(url2);

      if (resp2.ok) {
        const data2 = await resp2.json();
        if (data2.status === "OK" && data2.results && data2.results.length > 0) {
          const results: GooglePlaceResult[] = data2.results.slice(0, 6).map((place: {
            place_id: string;
            name: string;
            formatted_address: string;
            rating?: number;
            user_ratings_total?: number;
          }) => ({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            review_url: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
          }));
          return { results, status: "OK" };
        }
      }
    } catch (err) {
      console.error("Places API search error 2:", err);
    }
  }

  return { results: [], status: "ZERO_RESULTS" };
}

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

    if (!apiKey) {
      return NextResponse.json({ results: [], fallback: true, error: "MISSING_API_KEY" }, { status: 200 });
    }

    const { results, status, error } = await searchPlaces(query, apiKey);

    return NextResponse.json({
      results,
      fallback: results.length === 0,
      status,
      error: error || (results.length === 0 ? "NO_PLACES_FOUND" : undefined),
    }, { status: 200 });
  } catch (err) {
    console.error("find-place error:", err);
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

  if (!apiKey) {
    return NextResponse.json({ results: [], fallback: true, error: "MISSING_API_KEY" }, { status: 200 });
  }

  const { results, status, error } = await searchPlaces(query, apiKey);
  return NextResponse.json({ results, status, error }, { status: 200 });
}
