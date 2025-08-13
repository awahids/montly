import { test, expect } from '../fixtures';
import { genEmail } from '../utils/genEmail';
import { loginUI } from '../utils/helpers';

 test.describe('route protection', () => {
  test('redirects unauthenticated user', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/auth\/signin/);
  });

  test('allows authenticated user', async ({ page, supabaseAdmin }) => {
    const email = genEmail();
    const password = 'Password123';
    const { data: created } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    const userId = created.user!.id;

    await loginUI(page, email, password);
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();

    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
  });
 });
