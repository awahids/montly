import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { createServerClient } from '../supabase/server';

export async function getUser(): Promise<User> {
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
