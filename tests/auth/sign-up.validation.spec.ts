import { test, expect } from '../fixtures';
import { genEmail } from '../utils/genEmail';

test.describe('sign up validation', () => {
  test('shows errors on empty submit', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Name must be at least')).toBeVisible();
    await expect(page.getByText('Invalid email')).toBeVisible();
    await expect(page.getByText('Password must be at least')).toBeVisible();
  });

  test('invalid email', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('Password123');
    await page.getByLabel('Confirm Password').fill('Password123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('password too short', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(genEmail());
    await page.getByLabel('Password').fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Password must be at least')).toBeVisible();
  });

  test('mismatched passwords', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(genEmail());
    await page.getByLabel('Password').fill('Password123');
    await page.getByLabel('Confirm Password').fill('Password124');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test('existing email', async ({ page, supabaseAdmin }) => {
    const email = genEmail();
    const password = 'Password123';
    await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });

    await page.goto('/auth/sign-up');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(
      page.getByText(/An account already exists for this email/i)
    ).toBeVisible();

    const { data } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (data.user) {
      await supabaseAdmin.from('profiles').delete().eq('id', data.user.id);
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    }
  });
});
