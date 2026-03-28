import { expect, test } from '@playwright/test';

import {
  buildOverdueSchedule,
  buildPet,
  buildScheduleDueTomorrow,
  buildScheduleInDays,
} from './support/fixtures';
import { createScheduleFromModal, openPage } from './support/page-helpers';
import {
  resetTestData,
  seedPet,
  seedSchedule,
} from './support/seed';

test.beforeEach(async ({ request }) => {
  await resetTestData(request);
});

test('TC-E2E-002A shows the schedules empty state with a seeded pet and no schedules', async ({
  page,
  request,
}) => {
  await seedPet(request, buildPet({ name: 'Cá Neon', type: 'fish' }));

  await openPage(page, '/schedules', 'Quản lý lịch trình chăm sóc và việc sắp tới hạn');
  await expect(page.getByText('Chưa có lịch trình nào.')).toBeVisible();
});

test('TC-E2E-002 creates a schedule and shows it in the schedules page and dashboard', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Cá Neon', type: 'fish' }));
  const schedule = buildScheduleDueTomorrow(pet.id, {
    eventType: 'water_change',
    eventName: 'Thay nước',
  });

  await openPage(page, '/schedules', 'Quản lý lịch trình chăm sóc và việc sắp tới hạn');
  await createScheduleFromModal(page, {
    petName: pet.name,
    eventType: schedule.eventType,
    nextDueDate: schedule.nextDueDate,
  });

  const scheduleCard = page.locator('main article').filter({ hasText: pet.name }).first();
  await expect(scheduleCard.getByRole('heading', { name: 'Thay nước' })).toBeVisible();
  await expect(scheduleCard.getByText('Ngày mai')).toBeVisible();

  await page.goto('/');
  await expect(page.getByText(/Thay nước \(Cá Neon\)/)).toBeVisible();
  await expect(page.getByText(/^Ngày mai$/)).toBeVisible();
});

test('orders schedule cards by the nearest due date', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Cá Dĩa', type: 'fish' }));

  await seedSchedule(
    request,
    buildScheduleInDays(pet.id, 5, {
      eventType: 'feeding',
      eventName: 'Cho ăn',
    }),
  );
  await seedSchedule(
    request,
    buildScheduleInDays(pet.id, 1, {
      eventType: 'water_change',
      eventName: 'Thay nước',
    }),
  );

  await openPage(page, '/schedules', 'Quản lý lịch trình chăm sóc và việc sắp tới hạn');

  const cards = page.locator('main article').filter({ hasText: 'Cá Dĩa' });
  await expect(cards.first()).toContainText('Thay nước');
  await expect(cards.nth(1)).toContainText('Cho ăn');
});

test('ISSUE-004 keeps the add-schedule button enabled while pets are still loading', async ({
  page,
  request,
}) => {
  await seedPet(request, buildPet({ name: 'Cá Neon', type: 'fish' }));

  await page.route('**/api/pets', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await route.continue();
  });

  await page.goto('/schedules');
  await expect(page.getByRole('button', { name: 'Thêm Lịch' })).toBeEnabled();
});

test('TC-E2E-003A shows schedules summary cards with correct counts', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Cá Dĩa', type: 'fish' }));
  await seedSchedule(
    request,
    buildScheduleInDays(pet.id, 3, {
      eventType: 'water_change',
      eventName: 'Thay nước',
    }),
  );
  await seedSchedule(
    request,
    buildScheduleInDays(pet.id, 7, {
      eventType: 'feeding',
      eventName: 'Cho ăn',
    }),
  );

  await openPage(page, '/schedules', 'Quản lý lịch trình chăm sóc và việc sắp tới hạn');

  const totalCard = page
    .locator('article')
    .filter({ has: page.getByText('Tổng sự kiện') })
    .first();
  await expect(totalCard).toContainText('2');

  const nearestCard = page
    .locator('article')
    .filter({ has: page.getByText('Sắp tới nhất') })
    .first();
  await expect(nearestCard).toContainText('Còn 3 ngày');

  const statusCard = page
    .locator('article')
    .filter({ has: page.getByText('Trạng thái') })
    .first();
  await expect(statusCard).toContainText('1 thú cưng');
});

test('TC-E2E-003B shows overdue status on schedule cards in the schedules list', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Cá Vàng', type: 'fish' }));
  await seedSchedule(
    request,
    buildOverdueSchedule(pet.id, 3, {
      eventType: 'water_change',
      eventName: 'Thay nước bể',
    }),
  );

  await openPage(page, '/schedules', 'Quản lý lịch trình chăm sóc và việc sắp tới hạn');

  const scheduleCard = page.locator('main article').filter({ hasText: 'Thay nước bể' }).first();
  await expect(scheduleCard).toContainText('Quá hạn 3 ngày');
});
