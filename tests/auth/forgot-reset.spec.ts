import { test, expect } from '../fixtures';
import { genEmail } from '../utils/genEmail';
import { loginUI } from '../utils/helpers';

 test('forgot and reset password flow', async ({ page, supabaseAdmin }) => {
  const email = genEmail();
  const password = 'Password123';
  await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });

  await page.goto('/auth/forgot');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: /send reset link/i }).click();
  await expect(page.getByText(/if the email exists/i)).toBeVisible();

  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email });
  const { action_link } = linkData.properties!;

  await page.goto(action_link!);
  await page.getByLabel('New Password').fill('NewPassword123');
  await page.getByLabel('Confirm Password').fill('NewPassword123');
  await page.getByRole('button', { name: /reset password/i }).click();
  await expect(page).toHaveURL(/auth\/signin/);

  await loginUI(page, email, 'NewPassword123');

  const { data } = await supabaseAdmin.auth.admin.getUserByEmail(email);
  if (data.user) {
    await supabaseAdmin.from('profiles').delete().eq('id', data.user.id);
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
  }
 });
