import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
