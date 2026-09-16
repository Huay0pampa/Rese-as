'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { signUpUser, signInUser, signOutUser, UserProfile, getCurrentUserProfile } from '@/lib/supabase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        getCurrentUserProfile().then((p) => setProfile(p));
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await getCurrentUserProfile();
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    const res = await signInUser(email, pass);
    setIsLoading(false);
    return res;
  }, []);

  const register = useCallback(async (email: string, pass: string, fullName?: string) => {
    setIsLoading(true);
    const res = await signUpUser(email, pass, fullName);
    setIsLoading(false);
    return res;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    const res = await signOutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
    return res;
  }, []);

  return {
    user,
    session,
    profile,
    isLoading,
    isConfigured,
    login,
    register,
    logout,
  };
}
