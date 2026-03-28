import { expect, type Locator, type Page } from '@playwright/test';

import type { InventorySeed, PetSeed, ScheduleSeed } from './fixtures';

function mainRegion(page: Page) {
  return page.locator('main');
}

export async function openPage(
  page: Page,
  path: string,
  heading?: string | RegExp,
) {
  await page.goto(path);

  if (heading) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
}

export async function assertActiveNavItem(page: Page, label: string) {
  await expect(page.getByRole('link', { name: label })).toHaveClass(/bg-warm/);
}

export async function navigateFromSidebar(
  page: Page,
  label: string,
  expectedPath: string,
  heading?: string | RegExp,
) {
  await page.getByRole('link', { name: label }).click();
  await expect(page).toHaveURL(new RegExp(`${expectedPath.replace('/', '\\/')}$`));

  if (heading) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }

  await assertActiveNavItem(page, label);
}

export async function createPetFromModal(page: Page, pet: PetSeed) {
  await page.getByRole('button', { name: 'Thêm Thú Cưng' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm Thú Cưng' })).toBeVisible();

  await page.getByLabel('Tên thú cưng').fill(pet.name);
  await page.getByLabel('Loại').selectOption(pet.type);

  if (pet.breed) {
    await page.getByLabel('Giống loài').fill(pet.breed);
  }

  if (pet.weight != null) {
    await page.getByLabel('Cân nặng (kg)').fill(String(pet.weight));
  }

  if (pet.dob) {
    await page.getByLabel('Ngày sinh').fill(pet.dob);
  }

  await page.getByRole('button', { name: 'Lưu' }).click();
}

export async function createInventoryFromModal(
  page: Page,
  input: Omit<InventorySeed, 'petId'> & { petName: string },
) {
  await page.getByRole('button', { name: 'Thêm Kho' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm Kho' })).toBeVisible();

  await page.getByLabel('Thú cưng').selectOption({ label: input.petName });
  await page.getByLabel('Tên thức ăn').fill(input.foodName);
  await page
    .getByLabel('Tổng khối lượng (g)')
    .fill(String(input.totalWeightGrams));
  await page
    .getByLabel('Khẩu phần ăn hàng ngày (g)')
    .fill(String(input.dailyPortionGrams));
  await page.getByRole('button', { name: 'Lưu' }).click();
}

export async function updateInventoryFromTable(
  page: Page,
  input: {
    petName: string;
    currentFoodName?: string;
    foodName?: string;
    totalWeightGrams?: number;
    dailyPortionGrams?: number;
  },
) {
  const row = inventoryRow(page, input.petName, input.currentFoodName);
  await row.getByRole('button', { name: 'Sửa' }).click();
  await expect(page.getByRole('heading', { name: 'Cập Nhật Kho' })).toBeVisible();

  if (input.foodName) {
    await page.getByLabel('Tên thức ăn').fill(input.foodName);
  }

  if (input.totalWeightGrams != null) {
    await page
      .getByLabel('Tổng khối lượng (g)')
      .fill(String(input.totalWeightGrams));
  }

  if (input.dailyPortionGrams != null) {
    await page
      .getByLabel('Khẩu phần ăn hàng ngày (g)')
      .fill(String(input.dailyPortionGrams));
  }

  await page.getByRole('button', { name: 'Lưu' }).click();
}

export async function createScheduleFromModal(
  page: Page,
  input: Pick<ScheduleSeed, 'eventType' | 'nextDueDate'> & { petName: string },
) {
  await page.getByRole('button', { name: 'Thêm Lịch' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm Lịch' })).toBeVisible();

  await page.getByLabel('Thú cưng').selectOption({ label: input.petName });
  await page.getByLabel('Loại sự kiện').selectOption(input.eventType);
  await page.getByLabel('Ngày hẹn').fill(input.nextDueDate);
  await page.getByRole('button', { name: 'Lưu' }).click();
}

export function inventoryTable(page: Page) {
  return mainRegion(page).locator('table');
}

export function inventoryRow(
  page: Page,
  petName: string,
  foodName?: string,
) {
  let row = inventoryTable(page).locator('tbody tr').filter({ hasText: petName });

  if (foodName) {
    row = row.filter({ hasText: foodName });
  }

  return row.first();
}

export function dashboardSection(page: Page, title: string) {
  return mainRegion(page)
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: title }) })
    .first();
}

export async function mockBrowserTime(page: Page, fixedTime: string) {
  const fixedTimestamp = new Date(fixedTime).valueOf();

  await page.addInitScript(({ now }) => {
    const RealDate = Date;

    class MockDate extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(now);
          return;
        }

        super(...args);
      }

      static now() {
        return now;
      }
    }

    Object.setPrototypeOf(MockDate, RealDate);
    MockDate.parse = RealDate.parse;
    MockDate.UTC = RealDate.UTC;
    Object.defineProperty(window, 'Date', {
      configurable: true,
      writable: true,
      value: MockDate,
    });
  }, { now: fixedTimestamp });
}

export async function expectNoDevPlaceholderCopy(page: Page) {
  await expect(mainRegion(page)).not.toContainText(/placeholder/i);
  await expect(mainRegion(page)).not.toContainText(/e2e flow/i);
  await expect(mainRegion(page)).not.toContainText(/luồng e2e/i);
}

export async function headingPositions(
  ...headings: Locator[]
) {
  const positions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  for (const heading of headings) {
    const box = await heading.boundingBox();

    if (!box) {
      throw new Error('Expected heading to have a bounding box');
    }

    positions.push(box);
  }

  return positions;
}
