import { expect, test } from '@playwright/test';

import {
  assertActiveNavItem,
  expectNoDevPlaceholderCopy,
  headingPositions,
  navigateFromSidebar,
  openPage,
} from './support/page-helpers';
import { resetTestData } from './support/seed';

test.beforeEach(async ({ request }) => {
  await resetTestData(request);
});

test('TC-UI-001 loads the dashboard by default with the hero and three summary cards', async ({
  page,
}) => {
  await openPage(page, '/', /Chào buổi/);

  await assertActiveNavItem(page, 'Dashboard');
  await expect(page.getByRole('heading', { name: 'Cảnh báo khẩn cấp' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sắp tới hạn' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lịch Y tế' })).toBeVisible();
});

test('TC-UI-002 navigates between the main pages from the sidebar', async ({
  page,
}) => {
  await openPage(page, '/', /Chào buổi/);

  await navigateFromSidebar(page, 'Thú Cưng', '/pets', 'Quản lý hồ sơ thú cưng của bạn');
  await navigateFromSidebar(page, 'Kho Thức Ăn', '/inventory', 'Quản lý thức ăn và dự báo số ngày còn lại');
  await navigateFromSidebar(page, 'Lịch Trình', '/schedules', 'Quản lý lịch trình chăm sóc và việc sắp tới hạn');
  await navigateFromSidebar(page, 'Dashboard', '/', /Chào buổi/);
});

test('TC-UI-003 keeps the app shell stable on an unknown route', async ({
  page,
}) => {
  await page.goto('/nonexistent');

  await expect(page.getByText('PetCare')).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Quản lý hồ sơ thú cưng của bạn');
});

test('TC-UI-004 shows the dashboard banner image and copy', async ({
  page,
}) => {
  await openPage(page, '/', /Chào buổi/);

  await expect(page.getByAltText('Dogs playing in nature')).toBeVisible();
  await expect(page.getByText('Theo dõi kho thức ăn và lịch trình chăm sóc thú cưng của bạn.')).toBeVisible();
});

test('TC-UI-005 shows the warning-card labels on the dashboard', async ({
  page,
}) => {
  await openPage(page, '/', /Chào buổi/);

  await expect(page.getByRole('heading', { name: 'Cảnh báo khẩn cấp' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sắp tới hạn' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lịch Y tế' })).toBeVisible();
});

test('TC-UI-006 shows the sidebar branding and care image', async ({
  page,
}) => {
  await openPage(page, '/', /Chào buổi/);

  await expect(page.getByText('PetCare')).toBeVisible();
  await expect(page.getByText('CARE WITH LOVE')).toBeVisible();
  await expect(page.getByAltText('Nature')).toBeVisible();
});

test('TC-UI-007 stacks dashboard cards vertically on a mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, '/', /Chào buổi/);

  const [urgentCard, upcomingCard, medicalCard] = await headingPositions(
    page.getByRole('heading', { name: 'Cảnh báo khẩn cấp' }),
    page.getByRole('heading', { name: 'Sắp tới hạn' }),
    page.getByRole('heading', { name: 'Lịch Y tế' }),
  );

  expect(urgentCard.y).toBeLessThan(upcomingCard.y);
  expect(upcomingCard.y).toBeLessThan(medicalCard.y);
});

test('ISSUE-002 keeps dev placeholder copy out of all user-facing pages', async ({
  page,
}) => {
  await openPage(page, '/', /Chào buổi/);
  await expectNoDevPlaceholderCopy(page);

  await navigateFromSidebar(page, 'Thú Cưng', '/pets', 'Quản lý hồ sơ thú cưng của bạn');
  await expectNoDevPlaceholderCopy(page);

  await navigateFromSidebar(page, 'Kho Thức Ăn', '/inventory', 'Quản lý thức ăn và dự báo số ngày còn lại');
  await expectNoDevPlaceholderCopy(page);

  await navigateFromSidebar(page, 'Lịch Trình', '/schedules', 'Quản lý lịch trình chăm sóc và việc sắp tới hạn');
  await expectNoDevPlaceholderCopy(page);
});
