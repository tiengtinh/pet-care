import { expect, test } from '@playwright/test';

import { openPage } from './support/page-helpers';
import { resetTestData } from './support/seed';

test.beforeEach(async ({ request }) => {
  await resetTestData(request);
});

test('ISSUE-006 shows the dashboard error state when backend requests fail on initial load', async ({
  page,
}) => {
  await page.route('**/api/**', async (route) => {
    await route.abort('failed');
  });

  await openPage(page, '/', /Chào buổi/);
  await expect(page.getByText('Không thể tải số liệu dashboard.')).toBeVisible();
});
