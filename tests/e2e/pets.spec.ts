import { expect, test } from '@playwright/test';

import { buildPet } from './support/fixtures';
import {
  createPetFromModal,
  expectNoDevPlaceholderCopy,
  openPage,
} from './support/page-helpers';
import {
  resetTestData,
  seedPets,
  testingApiBaseUrl,
} from './support/seed';

test.beforeEach(async ({ request }) => {
  await resetTestData(request);
});

test('TC-E2E-001A shows the pets empty state when no pets exist', async ({
  page,
}) => {
  await openPage(page, '/pets', 'Quản lý hồ sơ thú cưng của bạn');
  await expect(page.getByText('Chưa có thú cưng nào.')).toBeVisible();

  const totalRegistryCard = page
    .locator('article')
    .filter({ has: page.getByText('Tổng hồ sơ') })
    .first();
  await expect(totalRegistryCard).toContainText('0');
});

test('TC-E2E-001B creates a pet from the modal and shows it in the registry', async ({
  page,
}) => {
  const pet = buildPet();

  await openPage(page, '/pets', 'Quản lý hồ sơ thú cưng của bạn');
  await createPetFromModal(page, pet);

  await expect(page.getByText(pet.name)).toBeVisible();
  await expect(page.getByText('Chó')).toBeVisible();
  await expect(page.getByText('Pembroke Welsh Corgi')).toBeVisible();
  await expect(page.getByText('12 kg')).toBeVisible();
  await expect(page.getByText(/Tạo ngày/)).toBeVisible();

  const totalRegistryCard = page
    .locator('article')
    .filter({ has: page.getByText('Tổng hồ sơ') })
    .first();
  await expect(totalRegistryCard).toContainText('1');
});

test('ISSUE-003 shows the most common pet type in the summary card', async ({
  page,
  request,
}) => {
  await seedPets(request, [
    buildPet({ name: 'Milo', type: 'dog' }),
    buildPet({ name: 'Mimi', type: 'cat' }),
    buildPet({ name: 'Mochi', type: 'cat' }),
  ]);

  await openPage(page, '/pets', 'Quản lý hồ sơ thú cưng của bạn');
  const popularTypeCard = page
    .locator('article')
    .filter({ has: page.getByText('Loại phổ biến') })
    .first();
  await expect(popularTypeCard).toContainText('Mèo');
});

test('ISSUE-002 keeps dev placeholder copy out of the pets page', async ({
  page,
}) => {
  await openPage(page, '/pets', 'Quản lý hồ sơ thú cưng của bạn');
  await expectNoDevPlaceholderCopy(page);
});

test('rejects testing reset without the api key', async ({ request }) => {
  const response = await request.post(`${testingApiBaseUrl}/reset`);

  expect(response.status()).toBe(403);
});
