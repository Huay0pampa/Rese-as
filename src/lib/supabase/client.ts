import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Get or initialize Supabase Client instance.
 * Reads environment variables SUPABASE_URL and SUPABASE_ANON_KEY when configured.
 * Prepared for future DB persistence and auth integration without breaking builds when unconfigured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClientInstance;
  } catch (error) {
    console.warn('Supabase client initialization warning:', error);
    return null;
  }
}

/**
 * Check if Supabase is connected & configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
