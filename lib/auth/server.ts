import type { User } from '@supabase/supabase-js';
import { createClient } from '../supabase/server';

export async function getUser(): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Unauthorized');
  }
  return data.user;
}
