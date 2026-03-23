export interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string | null;
  dob?: string | null;
  weight?: number | null;
  imageUrl?: string | null;
  createdAt: string;
}

export interface InventoryForecast {
  id: string;
  petId: string;
  foodName: string;
  totalWeightGrams: number;
  dailyPortionGrams: number;
  lastUpdatedDate: string;
  remainingWeightGrams: number;
  remainingDays: number;
  pet?: Pick<Pet, 'id' | 'name' | 'type'>;
}

export interface HealthSchedule {
  id: string;
  petId: string;
  eventType: string;
  eventName: string;
  lastDate?: string | null;
  nextDueDate: string;
  pet?: Pick<Pet, 'id' | 'name' | 'type'>;
}

export interface PetPayload {
  name: string;
  type: string;
  breed?: string;
  weight?: number;
  dob?: string;
}

export interface InventoryPayload {
  petId: string;
  foodName: string;
  totalWeightGrams: number;
  dailyPortionGrams: number;
}

export interface SchedulePayload {
  petId: string;
  eventType: string;
  eventName: string;
  lastDate?: string | null;
  nextDueDate: string;
}
