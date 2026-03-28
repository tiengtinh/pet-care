export interface PetSeed {
  name: string;
  type: string;
  breed?: string;
  weight?: number;
  dob?: string;
  imageUrl?: string;
}

export interface InventorySeed {
  petId: string;
  foodName: string;
  totalWeightGrams: number;
  dailyPortionGrams: number;
  lastUpdatedDate?: string;
}

export interface ScheduleSeed {
  petId: string;
  eventType: string;
  eventName: string;
  nextDueDate: string;
  lastDate?: string | null;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isoDateDaysFromToday(offsetInDays: number) {
  const date = startOfToday();
  date.setDate(date.getDate() + offsetInDays);
  return date.toISOString();
}

export function calendarDateDaysFromToday(offsetInDays: number) {
  return isoDateDaysFromToday(offsetInDays).slice(0, 10);
}

export function buildPet(overrides: Partial<PetSeed> = {}): PetSeed {
  return {
    name: 'E2E Corgi',
    type: 'dog',
    breed: 'Pembroke Welsh Corgi',
    weight: 12,
    ...overrides,
  };
}

export function buildInventory(
  petId: string,
  overrides: Partial<InventorySeed> = {},
): InventorySeed {
  return {
    petId,
    foodName: 'Royal Canin E2E',
    totalWeightGrams: 3000,
    dailyPortionGrams: 150,
    ...overrides,
  };
}

export function buildAgedInventory(
  petId: string,
  daysAgo: number,
  overrides: Partial<InventorySeed> = {},
): InventorySeed {
  return buildInventory(petId, {
    lastUpdatedDate: isoDateDaysFromToday(-daysAgo),
    ...overrides,
  });
}

export function buildLowStockInventory(
  petId: string,
  overrides: Partial<InventorySeed> = {},
): InventorySeed {
  return buildAgedInventory(petId, 18, overrides);
}

export function buildSchedule(
  petId: string,
  overrides: Partial<ScheduleSeed> = {},
): ScheduleSeed {
  return {
    petId,
    eventType: 'water_change',
    eventName: 'Thay nước',
    nextDueDate: calendarDateDaysFromToday(1),
    lastDate: null,
    ...overrides,
  };
}

export function buildScheduleDueTomorrow(
  petId: string,
  overrides: Partial<ScheduleSeed> = {},
): ScheduleSeed {
  return buildSchedule(petId, {
    nextDueDate: calendarDateDaysFromToday(1),
    ...overrides,
  });
}

export function buildScheduleInDays(
  petId: string,
  daysFromToday: number,
  overrides: Partial<ScheduleSeed> = {},
): ScheduleSeed {
  return buildSchedule(petId, {
    nextDueDate: calendarDateDaysFromToday(daysFromToday),
    ...overrides,
  });
}

export function buildOverdueSchedule(
  petId: string,
  daysOverdue: number,
  overrides: Partial<ScheduleSeed> = {},
): ScheduleSeed {
  return buildSchedule(petId, {
    nextDueDate: calendarDateDaysFromToday(-daysOverdue),
    ...overrides,
  });
}
