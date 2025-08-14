import { User } from '@/types';
import { useAppStore } from './store';

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
  return data as User;
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
  useAppStore.getState().setUser(data);
  return data as User;
}

export async function signOut() {
  await fetch('/api/auth/signout', { method: 'POST' });
  useAppStore.getState().setUser(null);
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch('/api/profile');
  if (!res.ok) return null;
  return (await res.json()) as User;
}
