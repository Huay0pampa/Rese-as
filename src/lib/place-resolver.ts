import { GooglePlaceResult } from "@/types";

/**
 * Converts a Google Maps hex feature pair (e.g. "0x9105c7db810b9a2f:0x2de696df10136545")
 * into a standard base64url ChIJ... Place ID without external dependencies.
 * Fully compatible with Edge Runtime & Node.js Runtime.
 */
export function hexToPlaceId(featureId: string): string | null {
  try {
    const parts = featureId.split(":");
    if (parts.length !== 2) return null;

    const h1Str = parts[0].replace(/^0x/i, "");
    const h2Str = parts[1].replace(/^0x/i, "");

    const hex1 = BigInt("0x" + h1Str);
    const hex2 = BigInt("0x" + h2Str);

    const bytes = new Uint8Array(18);
    bytes[0] = 0x0a; // protobuf field 1 tag
    bytes[1] = 0x10; // field length 16 bytes

    const mask8 = BigInt(0xff);
    const shift8 = BigInt(8);

    let temp1 = hex1;
    for (let i = 0; i < 8; i++) {
      bytes[2 + i] = Number(temp1 & mask8);
      temp1 >>= shift8;
    }

    let temp2 = hex2;
    for (let i = 0; i < 8; i++) {
      bytes[10 + i] = Number(temp2 & mask8);
      temp2 >>= shift8;
    }

    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return `ChIJ${base64}`;
  } catch {
    return null;
  }
}

/**
 * Multi-pass fallback resolver that queries Google Maps search RPC
 * and extracts Place IDs directly (ChIJ...) or via Hex feature ID conversion.
 * Works dynamically for ANY business name entered by the user. Zero billing required.
 */
export async function fetchPlaceIdFallback(rawQuery: string): Promise<string | null> {
  const clean = rawQuery.trim();
  if (!clean || clean.length < 2) return null;

  const attempts = [
    clean,
    clean.toLowerCase().includes("peru") ? clean : `${clean} Peru`,
  ];

  for (const query of attempts) {
    try {
      const url = `https://www.google.com/search?tbm=map&authuser=0&hl=es&gl=pe&q=${encodeURIComponent(query)}`;

      const resp = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "es-PE,es;q=0.9,en;q=0.8",
          Referer: "https://www.google.com/",
        },
        next: { revalidate: 86400 },
      });

      if (!resp.ok) continue;
      const text = await resp.text();

      // 1. Direct ChIJ match
      const chijMatches = text.match(/ChIJ[A-Za-z0-9_-]{23}/g);
      if (chijMatches && chijMatches.length > 0) {
        const unique = Array.from(new Set(chijMatches));
        return unique[0];
      }

      // 2. Hex feature ID match & convert
      const hexMatches = text.match(/0x[0-9a-fA-F]+:0x[0-9a-fA-F]+/g);
      if (hexMatches && hexMatches.length > 0) {
        for (const hexPair of hexMatches) {
          const placeId = hexToPlaceId(hexPair);
          if (placeId && placeId.length === 27) {
            return placeId;
          }
        }
      }
    } catch (err) {
      console.error("Place ID fallback fetch attempt error:", err);
    }
  }

  return null;
}

/**
 * Resolves ANY business query to a GooglePlaceResult array dynamically.
 * Tries Google Places Text Search API first. If billing/API errors occur or no results,
 * seamlessly uses zero-cost fallback for any business name.
 */
export async function resolvePlacesWithFallback(
  rawQuery: string,
  apiKey?: string
): Promise<{ results: GooglePlaceResult[]; source: "api" | "fallback"; status: string; error?: string }> {
  const query = rawQuery.trim();
  if (!query) return { results: [], source: "fallback", status: "ZERO_RESULTS" };

  // Attempt 1: Official Google Places API if key is present and active
  if (apiKey) {
    try {
      const searchQuery = encodeURIComponent(query);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&region=pe&language=es&key=${apiKey}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === "OK" && data.results && data.results.length > 0) {
          const results: GooglePlaceResult[] = data.results.slice(0, 6).map(
            (place: {
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
            })
          );
          return { results, source: "api", status: "OK" };
        }
      }
    } catch (err) {
      console.error("Official Places API error:", err);
    }
  }

  // Attempt 2: Zero-cost Multi-pass Fallback Place ID Resolver
  const fallbackPlaceId = await fetchPlaceIdFallback(query);
  if (fallbackPlaceId) {
    const formattedName = query.charAt(0).toUpperCase() + query.slice(1);
    const results: GooglePlaceResult[] = [
      {
        place_id: fallbackPlaceId,
        name: formattedName,
        formatted_address: `${formattedName}, Perú`,
        review_url: `https://search.google.com/local/writereview?placeid=${fallbackPlaceId}`,
      },
    ];
    return { results, source: "fallback", status: "OK" };
  }

  return { results: [], source: "fallback", status: "ZERO_RESULTS" };
}
