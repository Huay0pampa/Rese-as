import { GoogleUrlValidationResult } from '@/types';

/**
 * Validates and normalizes Google Review and Maps URLs.
 * Ensures the business link correctly directs customers to leave a review.
 */
export function validateGoogleReviewUrl(inputUrl: string): GoogleUrlValidationResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      isValid: false,
      normalizedUrl: '',
      formatType: 'invalid',
      errorMessage: 'Por favor ingresa una URL de Google Maps o Reseñas.',
    };
  }

  const trimmed = inputUrl.trim();
  let urlObj: URL;

  try {
    // Add protocol if omitted
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    urlObj = new URL(withProtocol);
  } catch {
    return {
      isValid: false,
      normalizedUrl: '',
      formatType: 'invalid',
      errorMessage: 'El enlace ingresado no tiene un formato de URL válido.',
    };
  }

  const hostname = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // 1. Format: https://g.page/r/{place_id_or_handle}/review
  if (hostname === 'g.page' || hostname.endsWith('.g.page')) {
    let normalized = urlObj.toString();
    if (!pathname.endsWith('/review')) {
      // Append /review if missing for direct review box opening
      normalized = `${urlObj.origin}${pathname.replace(/\/$/, '')}/review${urlObj.search}`;
    }
    return {
      isValid: true,
      normalizedUrl: normalized,
      formatType: 'g.page',
    };
  }

  // 2. Format: https://search.google.com/local/writereview?placeid=ChIJ...
  if (
    (hostname === 'search.google.com' || hostname.endsWith('.search.google.com')) &&
    pathname.includes('/writereview')
  ) {
    if (searchParams.has('placeid')) {
      return {
        isValid: true,
        normalizedUrl: urlObj.toString(),
        formatType: 'google_search',
      };
    }
  }

  // 3. Format: https://maps.app.goo.gl/... or https://goo.gl/maps/...
  if (
    hostname === 'maps.app.goo.gl' ||
    hostname === 'goo.gl' ||
    hostname.endsWith('.maps.app.goo.gl')
  ) {
    return {
      isValid: true,
      normalizedUrl: urlObj.toString(),
      formatType: 'maps_app',
      warningMessage: 'Enlace corto de Google Maps detectado. Asegúrate de que abra la ficha correcta.',
    };
  }

  // 4. Format: https://www.google.com/maps/...
  if (
    hostname.includes('google.') &&
    (pathname.startsWith('/maps') || hostname.startsWith('maps.google.'))
  ) {
    // Check if place ID is in query or path
    const placeId = searchParams.get('placeid') || searchParams.get('cid');
    if (placeId) {
      return {
        isValid: true,
        normalizedUrl: urlObj.toString(),
        formatType: 'place_id',
      };
    }

    return {
      isValid: true,
      normalizedUrl: urlObj.toString(),
      formatType: 'generic',
      warningMessage: 'Es recomendable usar el enlace directo de "Pedir reseñas" de tu Perfil de Negocio de Google.',
    };
  }

  // Disallow non-google domains
  return {
    isValid: false,
    normalizedUrl: urlObj.toString(),
    formatType: 'invalid',
    errorMessage: 'La URL debe pertenecer a Google (g.page, maps.app.goo.gl o google.com/maps).',
  };
}

/**
 * Automatically creates a direct Google Maps search & review destination URL from business name
 */
export function createGoogleSearchUrl(businessName: string): string {
  const cleanName = businessName.trim();
  if (!cleanName) return 'https://www.google.com/maps';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName)}`;
}

/**
 * Creates a clean slug from a business name.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '')         // remove leading and trailing hyphens
    .slice(0, 50);
}
