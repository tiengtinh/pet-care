import { expect, test } from '@playwright/test';

const testingApiKey = 'e2e-testing-key';

test.beforeEach(async ({ request }) => {
  const response = await request.post('http://127.0.0.1:3000/api/testing/reset', {
    headers: {
      'x-testing-api-key': testingApiKey,
    },
  });
  expect(response.ok()).toBeTruthy();
});

test('shows the pets empty state when no pets exist', async ({ page }) => {
  await page.goto('/pets');
  await expect(page.getByText('Chưa có thú cưng nào.')).toBeVisible();
});

test('rejects testing reset without the api key', async ({ request }) => {
  const response = await request.post('http://127.0.0.1:3000/api/testing/reset');

  expect(response.status()).toBe(403);
});
