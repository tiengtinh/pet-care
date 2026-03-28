import { expect, type APIRequestContext } from '@playwright/test';

import type {
  HealthSchedule,
  InventoryForecast,
  Pet,
} from '../../../frontend/src/lib/types';

import type { InventorySeed, PetSeed, ScheduleSeed } from './fixtures';

export const testingApiKey = 'e2e-testing-key';
export const testingApiBaseUrl = 'http://127.0.0.1:3300/api/testing';

function testingHeaders() {
  return {
    'x-testing-api-key': testingApiKey,
  };
}

async function postJson<T>(
  request: APIRequestContext,
  path: string,
  data?: unknown,
): Promise<T> {
  const response = await request.post(`${testingApiBaseUrl}${path}`, {
    data,
    headers: testingHeaders(),
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as T;
}

export async function resetTestData(request: APIRequestContext) {
  const response = await request.post(`${testingApiBaseUrl}/reset`, {
    headers: testingHeaders(),
  });

  expect(response.ok()).toBeTruthy();
}

export async function seedPet(
  request: APIRequestContext,
  payload: PetSeed,
): Promise<Pet> {
  return postJson<Pet>(request, '/seed/pet', payload);
}

export async function seedInventory(
  request: APIRequestContext,
  payload: InventorySeed,
): Promise<InventoryForecast> {
  return postJson<InventoryForecast>(request, '/seed/inventory', payload);
}

export async function seedSchedule(
  request: APIRequestContext,
  payload: ScheduleSeed,
): Promise<HealthSchedule> {
  return postJson<HealthSchedule>(request, '/seed/schedule', payload);
}

export async function seedPets(
  request: APIRequestContext,
  payloads: PetSeed[],
): Promise<Pet[]> {
  const pets: Pet[] = [];

  for (const payload of payloads) {
    pets.push(await seedPet(request, payload));
  }

  return pets;
}
