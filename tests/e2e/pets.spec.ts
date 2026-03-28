import { expect, test } from '@playwright/test';

const testingApiKey = 'e2e-testing-key';
const testingApiBaseUrl = 'http://127.0.0.1:3300/api/testing';

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${testingApiBaseUrl}/reset`, {
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

test('creates a pet from the modal and shows it in the registry', async ({ page }) => {
  await page.goto('/pets');
  await page.getByRole('button', { name: 'Thêm Thú Cưng' }).click();
  await page.getByLabel('Tên thú cưng').fill('E2E Corgi');
  await page.getByLabel('Loại').selectOption('dog');
  await page.getByLabel('Giống loài').fill('Pembroke Welsh Corgi');
  await page.getByLabel('Cân nặng (kg)').fill('12');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('E2E Corgi')).toBeVisible();
});

test('rejects testing reset without the api key', async ({ request }) => {
  const response = await request.post(`${testingApiBaseUrl}/reset`);

  expect(response.status()).toBe(403);
});
