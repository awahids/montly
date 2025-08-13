import { supabase } from './supabase';
import { createServerClient } from './supabase/server';
import { cookies } from 'next/headers';
import { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
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

export async function getUser(): Promise<SupabaseUser> {
  const token = cookies().get('sb-access-token')?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Unauthorized');
  }
  return data.user;
}