import { test, expect } from '../fixtures';
import { genEmail } from '../utils/genEmail';

 test.describe('sign in negatives', () => {
  test('wrong password', async ({ page, supabaseAdmin }) => {
    const email = genEmail();
    await supabaseAdmin.auth.admin.createUser({ email, password: 'Password123', email_confirm: true });

    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('WrongPass123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  });

  test('non existent email', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill(genEmail());
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  });
});
