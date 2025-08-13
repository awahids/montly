import { supabase } from './supabase';
import { User } from '@/types';

export async function signUp(email: string, password: string, name: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to sign up');
  }

  return res.json();
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { session } = data;
  if (session) {
    const { access_token, refresh_token, expires_in } = session;
    const maxAge = expires_in;
    document.cookie = `sb-access-token=${access_token}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
    if (refresh_token) {
      document.cookie = `sb-refresh-token=${refresh_token}; Path=/; Max-Age=${maxAge * 2}; SameSite=Lax; Secure`;
    }
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  document.cookie = 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax; Secure';
  document.cookie = 'sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax; Secure';
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    defaultCurrency: profile.default_currency,
  };
}