import { NextRequest, NextResponse } from "next/server";
import { GooglePlaceResult } from "@/types";

export const runtime = "nodejs";

/**
 * POST /api/find-place
 * Body: { query: string }
 * Returns: { results: GooglePlaceResult[], fallback: boolean, status?: string }
 *
 * Uses Google Places Text Search API (server-side) to find businesses by name.
 * The API key is kept secret in GOOGLE_PLACES_API_KEY env var.
 */
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ results: [], fallback: true, error: "MISSING_API_KEY" }, { status: 200 });
    }

    const searchQuery = encodeURIComponent(query.trim());
    // Query Places API without restrictive type filtering to ensure all local business categories match
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;

    const resp = await fetch(url);

    if (!resp.ok) {
      console.error("Google Places API HTTP error:", resp.status);
      return NextResponse.json({ results: [], fallback: true, error: `HTTP_${resp.status}` }, { status: 200 });
    }

    const data = await resp.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API status:", data.status, data.error_message);
      return NextResponse.json({ results: [], fallback: true, status: data.status, error: data.error_message }, { status: 200 });
    }

    const results: GooglePlaceResult[] = (data.results || [])
      .slice(0, 5)
      .map((place: {
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
        // Direct 5-Star Review Form URL
        review_url: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
      }));

    return NextResponse.json({ results, fallback: false, status: data.status }, { status: 200 });
  } catch (err) {
    console.error("find-place error:", err);
    return NextResponse.json({ results: [], fallback: true, error: "SERVER_ERROR" }, { status: 200 });
  }
}
