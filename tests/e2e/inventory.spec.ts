import { expect, test } from '@playwright/test';

import {
  buildAgedInventory,
  buildInventory,
  buildPet,
} from './support/fixtures';
import {
  createInventoryFromModal,
  inventoryRow,
  openPage,
  updateInventoryFromTable,
} from './support/page-helpers';
import {
  resetTestData,
  seedInventory,
  seedPet,
} from './support/seed';

test.beforeEach(async ({ request }) => {
  await resetTestData(request);
});

test('TC-E2E-001C shows the inventory empty state with a seeded pet and no inventory', async ({
  page,
  request,
}) => {
  await seedPet(request, buildPet({ name: 'Chó Corgi' }));

  await openPage(page, '/inventory', 'Quản lý thức ăn và dự báo số ngày còn lại');
  await expect(page.getByText('Chưa có dữ liệu kho.')).toBeVisible();
});

test('TC-E2E-001 creates inventory and shows forecast values', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Chó Corgi' }));
  const inventory = buildInventory(pet.id, {
    foodName: 'Royal Canin',
    totalWeightGrams: 3000,
    dailyPortionGrams: 150,
  });

  await openPage(page, '/inventory', 'Quản lý thức ăn và dự báo số ngày còn lại');
  await createInventoryFromModal(page, {
    petName: pet.name,
    foodName: inventory.foodName,
    totalWeightGrams: inventory.totalWeightGrams,
    dailyPortionGrams: inventory.dailyPortionGrams,
  });

  const row = inventoryRow(page, pet.name, inventory.foodName);
  await expect(row).toContainText('Royal Canin');
  await expect(row).toContainText('3000g');
  await expect(row).toContainText('Còn 20 ngày');
});

test('TC-E2E-003 updates inventory and resets forecasting from the new total', async ({
  page,
  request,
}) => {
  const pet = await seedPet(request, buildPet({ name: 'Chó Corgi' }));
  await seedInventory(
    request,
    buildAgedInventory(pet.id, 10, {
      foodName: 'Royal Canin',
      totalWeightGrams: 3000,
      dailyPortionGrams: 150,
    }),
  );

  await openPage(page, '/inventory', 'Quản lý thức ăn và dự báo số ngày còn lại');

  const beforeUpdateRow = inventoryRow(page, pet.name, 'Royal Canin');
  await expect(beforeUpdateRow).toContainText('1500g');
  await expect(beforeUpdateRow).toContainText('Còn 10 ngày');

  await updateInventoryFromTable(page, {
    petName: pet.name,
    currentFoodName: 'Royal Canin',
    totalWeightGrams: 5000,
  });

  const afterUpdateRow = inventoryRow(page, pet.name, 'Royal Canin');
  await expect(afterUpdateRow).toContainText('5000g');
  await expect(afterUpdateRow).toContainText('Còn 33 ngày');
});
