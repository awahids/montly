import { supabase } from './supabase';
import { User } from '@/types';
import { useAppStore } from './store';

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
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
  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  const user = await getCurrentUser();
  if (user) {
    useAppStore.getState().setUser(user);
  }
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  document.cookie = 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax; Secure';
  document.cookie = 'sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax; Secure';
  useAppStore.getState().setUser(null);
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