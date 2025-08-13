import { test, expect } from '../fixtures';
import { genEmail } from '../utils/genEmail';
import { confirmEmail } from '../utils/mail';

// Simulated email verification using Admin API
 test('email can be verified via admin', async ({ supabaseAdmin }) => {
  const email = genEmail();
  const password = 'Password123';

  const { data: created } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  });
  const userId = created.user!.id;

  // initially not confirmed
  const { data: before } = await supabaseAdmin.auth.admin.getUserById(userId);
  expect(before.user?.email_confirmed_at).toBeNull();

  await confirmEmail(userId);

  const { data: after } = await supabaseAdmin.auth.admin.getUserById(userId);
  expect(after.user?.email_confirmed_at).not.toBeNull();

  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await supabaseAdmin.auth.admin.deleteUser(userId);
 });
