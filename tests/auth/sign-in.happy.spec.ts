import { test, expect } from '../fixtures';
import { genEmail } from '../utils/genEmail';
import { loginUI } from '../utils/helpers';

 test('user can sign in', async ({ page, supabaseAdmin }) => {
  const email = genEmail();
  const password = 'Password123';
  const { data: created } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  const userId = created.user!.id;

  await loginUI(page, email, password);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

  // visiting sign-in when logged in should redirect
  await page.goto('/auth/sign-in');
  await expect(page).toHaveURL(/dashboard/);

  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await supabaseAdmin.auth.admin.deleteUser(userId);
});
