# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> smoke routes >> /en/dashboard does not return 500
- Location: tests\smoke.spec.ts:15:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/en/dashboard", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('smoke routes', () => {
  4  |   test('/en/login has title and email form field', async ({ page }) => {
  5  |     await page.goto('/en/login');
  6  |     await expect(page).toHaveTitle(/.+/);
  7  |     await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  8  |   });
  9  | 
  10 |   test('/en/signup loads', async ({ page }) => {
  11 |     await page.goto('/en/signup');
  12 |     await expect(page.locator('body')).toBeVisible();
  13 |   });
  14 | 
  15 |   test('/en/dashboard does not return 500', async ({ page }) => {
> 16 |     const response = await page.goto('/en/dashboard');
     |                                 ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  17 |     expect(response?.status()).not.toBe(500);
  18 |   });
  19 | 
  20 |   test('/en/community/search loads', async ({ page }) => {
  21 |     await page.goto('/en/community/search');
  22 |     await expect(page.locator('body')).toBeVisible();
  23 |   });
  24 | 
  25 |   test('/en/dialects/search loads', async ({ page }) => {
  26 |     await page.goto('/en/dialects/search');
  27 |     await expect(page.locator('body')).toBeVisible();
  28 |   });
  29 | });
  30 | 
```