import { NextRequest, NextResponse } from "next/server";
import { GooglePlaceResult } from "@/types";

export const runtime = "nodejs";

/**
 * POST /api/find-place
 * Body: { query: string }
 * Returns: { results: GooglePlaceResult[], fallback: boolean }
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
      // No API key configured — graceful fallback
      return NextResponse.json({ results: [], fallback: true }, { status: 200 });
    }

    const searchQuery = encodeURIComponent(query.trim());
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&type=establishment&key=${apiKey}`;

    const resp = await fetch(url);

    if (!resp.ok) {
      console.error("Google Places API HTTP error:", resp.status);
      return NextResponse.json({ results: [], fallback: true }, { status: 200 });
    }

    const data = await resp.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API status:", data.status, data.error_message);
      return NextResponse.json({ results: [], fallback: true }, { status: 200 });
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
        review_url: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
      }));

    return NextResponse.json({ results, fallback: false }, { status: 200 });
  } catch (err) {
    console.error("find-place error:", err);
    return NextResponse.json({ results: [], fallback: true }, { status: 200 });
  }
}
