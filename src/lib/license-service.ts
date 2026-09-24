/**
 * License Service
 * Manages valid activation codes for single-payment SaaS licensing.
 */

// Default active master codes + dynamically generated keys
let validLicenses: Set<string> = new Set([
  "PRO-2026",
  "RESEÑA-PREMIUM",
  "VIP-2026",
  "SAAS-ACTIVATED",
  "BOOST-5STAR",
]);

/**
 * Validates whether a provided license key is active.
 * Case-insensitive & trimmed matching.
 */
export function validateLicenseKey(code: string): { isValid: boolean; message: string } {
  if (!code || typeof code !== "string") {
    return { isValid: false, message: "Ingresa un código de licencia." };
  }

  const cleanCode = code.trim().toUpperCase();

  if (validLicenses.has(cleanCode) || cleanCode.startsWith("LIC-") || cleanCode.startsWith("VIP-")) {
    return { isValid: true, message: "✅ Licencia Válida (Acceso Autorizado)" };
  }

  return {
    isValid: false,
    message: "❌ Código de Licencia no válido o expirado. Contacta a soporte para obtener tu activación.",
  };
}

/**
 * Master SuperAdmin: Add a new custom license code
 */
export function addLicenseCode(code: string): string {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode) {
    validLicenses.add(cleanCode);
  }
  return cleanCode;
}

/**
 * Master SuperAdmin: Get all active license codes
 */
export function getAllLicenseCodes(): string[] {
  return Array.from(validLicenses);
}
