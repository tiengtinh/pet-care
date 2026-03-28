import { expect, test } from '@playwright/test';

import {
  buildAgedInventory,
  buildLowStockInventory,
  buildOverdueSchedule,
  buildPet,
  buildScheduleDueTomorrow,
  buildScheduleInDays,
} from './support/fixtures';
import {
  dashboardSection,
  mockBrowserTime,
  openPage,
} from './support/page-helpers';
import {
  resetTestData,
  seedInventory,
  seedPet,
  seedSchedule,
} from './support/seed';

test.beforeEach(async ({ request }) => {
  await resetTestData(request);
});

test('ISSUE-001 shows overdue schedules on the dashboard upcoming card', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Bể Cá', type: 'fish' }));
  await seedSchedule(
    request,
    buildOverdueSchedule(pet.id, 8, {
      eventType: 'water_change',
      eventName: 'Thay nước bể',
    }),
  );

  await openPage(page, '/', /Chào buổi/);
  await expect(page.getByText(/Thay nước bể \(Bể Cá\)/)).toBeVisible();
  await expect(page.getByText('Quá hạn 8 ngày')).toBeVisible();
});

test('renders aggregated dashboard counts and featured sections from seeded data', async ({
  page,
  request,
}) => {
  const petOne = await seedPet(request, buildPet({ name: 'Corgi Mập' }));
  const petTwo = await seedPet(request, buildPet({ name: 'Mèo Mun', type: 'cat' }));

  await seedInventory(
    request,
    buildAgedInventory(petOne.id, 5, {
      foodName: 'Royal Canin',
      totalWeightGrams: 3000,
      dailyPortionGrams: 150,
    }),
  );
  await seedInventory(
    request,
    buildAgedInventory(petTwo.id, 2, {
      foodName: 'Me-O',
      totalWeightGrams: 2000,
      dailyPortionGrams: 100,
    }),
  );
  await seedSchedule(
    request,
    buildScheduleDueTomorrow(petOne.id, {
      eventType: 'vaccine',
      eventName: 'Tiêm phòng',
    }),
  );

  await openPage(page, '/', /Chào buổi/);

  await expect(page.getByText('2 thú cưng')).toBeVisible();
  await expect(page.getByText('2 bản ghi kho')).toBeVisible();
  await expect(page.getByText('1 lịch trong 7 ngày tới')).toBeVisible();
  await expect(page.getByText(/Tiêm phòng \(Corgi Mập\)/)).toBeVisible();
  await expect(page.getByText(/Thức ăn của/)).toContainText('Corgi Mập');
});

test('shows the lowest-stock inventory first in the dashboard attention list', async ({
  page,
  request,
}) => {
  const lowStockPet = await seedPet(request, buildPet({ name: 'Bé Cáo' }));
  const healthyPet = await seedPet(request, buildPet({ name: 'Bé Mèo', type: 'cat' }));

  await seedInventory(
    request,
    buildLowStockInventory(lowStockPet.id, {
      foodName: 'Low Stock Food',
    }),
  );
  await seedInventory(
    request,
    buildAgedInventory(healthyPet.id, 2, {
      foodName: 'Healthy Food',
    }),
  );

  await openPage(page, '/', /Chào buổi/);

  const attentionSection = dashboardSection(page, 'Tồn kho cần chú ý');
  await expect(attentionSection.locator('article').first()).toContainText('Bé Cáo');
  await expect(attentionSection.locator('article').first()).toContainText('Low Stock Food');
});

test('ISSUE-005 adapts the dashboard greeting to the current time of day', async ({
  page,
}) => {
  await mockBrowserTime(page, '2026-03-28T19:00:00');

  await openPage(page, '/', /Chào buổi/);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chào buổi tối!');
});

test('shows schedules in ascending due-date order in the dashboard list', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Mèo Mướp', type: 'cat' }));

  await seedSchedule(
    request,
    buildScheduleInDays(pet.id, 5, {
      eventType: 'deworm',
      eventName: 'Tẩy giun',
    }),
  );
  await seedSchedule(
    request,
    buildScheduleInDays(pet.id, 1, {
      eventType: 'feeding',
      eventName: 'Cho ăn',
    }),
  );

  await openPage(page, '/', /Chào buổi/);

  const upcomingSection = dashboardSection(page, 'Việc sắp tới hạn');
  await expect(upcomingSection.locator('article').first()).toContainText('Cho ăn');
  await expect(upcomingSection.locator('article').nth(1)).toContainText('Tẩy giun');
});
