import type { User } from '@supabase/supabase-js';
import { createServerClient } from '../supabase/server';

export async function getUser(): Promise<User> {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Unauthorized');
  }
  return data.user;
}
