import { expect, test } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.post('http://127.0.0.1:3000/api/testing/reset');
  expect(response.ok()).toBeTruthy();
});

test('shows the pets empty state when no pets exist', async ({ page }) => {
  await page.goto('/pets');
  await expect(page.getByText('Chưa có thú cưng nào.')).toBeVisible();
});
