import axios from 'axios';

import type {
  HealthSchedule,
  InventoryForecast,
  InventoryPayload,
  Pet,
  PetPayload,
  SchedulePayload,
} from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
});

export async function getPets() {
  const response = await api.get<Pet[]>('/pets');
  return response.data;
}

export async function createPet(payload: PetPayload) {
  const response = await api.post<Pet>('/pets', payload);
  return response.data;
}

export async function getInventoryByPet(petId: string) {
  const response = await api.get<InventoryForecast[]>(`/inventory/pet/${petId}`);
  return response.data;
}

export async function createInventory(payload: InventoryPayload) {
  const response = await api.post<InventoryForecast>('/inventory', payload);
  return response.data;
}

export async function updateInventory(
  inventoryId: string,
  payload: Omit<InventoryPayload, 'petId'>,
) {
  const response = await api.put<InventoryForecast>(
    `/inventory/${inventoryId}`,
    payload,
  );
  return response.data;
}

export async function getSchedulesByPet(petId: string) {
  const response = await api.get<HealthSchedule[]>(`/schedules/pet/${petId}`);
  return response.data;
}

export async function getUpcomingSchedules() {
  const response = await api.get<HealthSchedule[]>('/schedules/upcoming');
  return response.data;
}

export async function createSchedule(payload: SchedulePayload) {
  const response = await api.post<HealthSchedule>('/schedules', payload);
  return response.data;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.message ?? fallbackMessage;
  }

  return fallbackMessage;
}
