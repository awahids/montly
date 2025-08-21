
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
