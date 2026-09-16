import { getSupabaseClient } from './client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

/**
 * Sign up new user with email and password
 */
export async function signUpUser(
  email: string,
  pass: string,
  fullName?: string
): Promise<AuthResponse> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, session: null, error: 'Supabase no está configurado en el entorno.' };
  }

  const { data, error } = await client.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
    },
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session };
}

/**
 * Sign in existing user with email and password
 */
export async function signInUser(email: string, pass: string): Promise<AuthResponse> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, session: null, error: 'Supabase no está configurado en el entorno.' };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session };
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  const { error } = await client.auth.signOut();
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email || '',
    fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
    avatarUrl: profile?.avatar_url,
  };
}
