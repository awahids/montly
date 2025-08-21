import { cookies } from 'next/headers';
import { createServerClient as createClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createServerClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: { path?: string; maxAge?: number }) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: { path?: string }) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}
