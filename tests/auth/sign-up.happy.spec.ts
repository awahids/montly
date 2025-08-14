import { test, expect } from '../fixtures';
import { genEmail } from '../utils/genEmail';

// Sign-up happy path
 test('user can sign up', async ({ page, supabaseAdmin }) => {
  const email = genEmail();
  const password = 'Password123';

  await page.goto('/auth/sign-up');
  await page.getByLabel('Full Name').fill('Test User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Confirm Password').fill(password);
  await page.getByRole('button', { name: /create account/i }).click();

  // Expect redirect to sign in page after success
  await expect(page).toHaveURL(/auth\/sign-in/);

  // Verify user exists in Supabase
  const { data: user } = await supabaseAdmin.auth.admin.getUserByEmail(email);
  expect(user?.user?.email).toBe(email);
  const userId = user?.user?.id as string;

  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  expect(profile).toBeTruthy();

  // Cleanup
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await supabaseAdmin.auth.admin.deleteUser(userId);
});
