
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance to avoid multiple client warnings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Use the same instance for browser client
export function createBrowserClient() {
  return supabase;
}
