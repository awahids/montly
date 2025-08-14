import { supabase } from './supabase';
import { User } from '@/types';

export async function signUp(email: string, password: string, name: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sign up');
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sign in');
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