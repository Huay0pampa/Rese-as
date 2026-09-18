import { DeviceType } from '@/types';

/**
 * Detects device category (Mobile, Tablet, Desktop) based on User-Agent and headers.
 */
export function detectDeviceType(userAgent?: string | null, isMobileHeader?: string | null): DeviceType {
  if (isMobileHeader === '?1' || isMobileHeader === '1') {
    return 'Mobile';
  }

  if (!userAgent) return 'Mobile'; // Default to mobile for physical QR scans

  const ua = userAgent.toLowerCase();

  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk/i.test(ua)) {
    return 'Tablet';
  }

  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini|webos|windows phone/i.test(ua)) {
    return 'Mobile';
  }

  return 'Desktop';
}

/**
 * Extracts country code/name from Edge request headers (Vercel, Cloudflare, etc.)
 */
export function extractCountry(headers: Headers): string {
  const vercelCountry = headers.get('x-vercel-ip-country');
  if (vercelCountry) return vercelCountry.toUpperCase();

  const cfCountry = headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') return cfCountry.toUpperCase();

  const geoCountry = headers.get('x-country') || headers.get('x-client-country');
  if (geoCountry) return geoCountry.toUpperCase();

  return 'Desconocido';
}
