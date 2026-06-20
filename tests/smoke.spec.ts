import { test, expect } from '@playwright/test';

test.describe('smoke routes', () => {
  test('/en/login has title and email form field', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  });

  test('/en/signup loads', async ({ page }) => {
    await page.goto('/en/signup');
    await expect(page.locator('body')).toBeVisible();
  });

  test('/en/dashboard does not return 500', async ({ page }) => {
    const response = await page.goto('/en/dashboard');
    expect(response?.status()).not.toBe(500);
  });

  test('/en/community/search loads', async ({ page }) => {
    await page.goto('/en/community/search');
    await expect(page.locator('body')).toBeVisible();
  });

  test('/en/dialects/search loads', async ({ page }) => {
    await page.goto('/en/dialects/search');
    await expect(page.locator('body')).toBeVisible();
  });
});
