import { test, expect } from '@playwright/test';

test('landing page displays hero and cta', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: /Budget monthly. Track daily. All in one place./i,
    })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get Started' }).first()).toHaveAttribute(
    'href',
    '/auth/sign-up'
  );
});
