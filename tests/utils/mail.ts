import { supabaseAdmin } from './supabaseAdmin';

/**
 * Mark a user's email as confirmed via Supabase Admin API.
 */
export async function confirmEmail(userId: string) {
  await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
}
