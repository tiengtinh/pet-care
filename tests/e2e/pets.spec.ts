import { expect, test } from '@playwright/test';

test('shows the pets empty state when no pets exist', async ({ page }) => {
  await page.goto('/pets');
  await expect(page.getByText('Chưa có thú cưng nào.')).toBeVisible();
});
