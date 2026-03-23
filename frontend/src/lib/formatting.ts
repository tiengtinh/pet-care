const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const PET_TYPE_OPTIONS = [
  { value: 'dog', label: 'Chó' },
  { value: 'cat', label: 'Mèo' },
  { value: 'fish', label: 'Cá' },
  { value: 'bird', label: 'Chim' },
  { value: 'other', label: 'Khác' },
] as const;

export const SCHEDULE_TYPE_OPTIONS = [
  { value: 'water_change', label: 'Thay nước' },
  { value: 'feeding', label: 'Cho ăn' },
  { value: 'checkup', label: 'Khám bệnh' },
  { value: 'vaccine', label: 'Tiêm phòng' },
  { value: 'deworm', label: 'Tẩy giun' },
] as const;

function parseCalendarDate(value: string) {
  const datePortion = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

  if (datePortion) {
    const [year, month, day] = datePortion.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function getPetTypeLabel(type: string) {
  return PET_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getScheduleTypeLabel(type: string) {
  return (
    SCHEDULE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parseCalendarDate(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

export function formatNumber(value?: number | null) {
  if (value == null) {
    return '0';
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatGrams(value?: number | null) {
  return `${formatNumber(value)}g`;
}

export function describeDueDate(value: string) {
  const today = startOfDay(new Date());
  const target = startOfDay(parseCalendarDate(value));
  const diffInDays = Math.round(
    (target.getTime() - today.getTime()) / DAY_IN_MS,
  );

  if (diffInDays === 0) {
    return 'Hôm nay';
  }

  if (diffInDays === 1) {
    return 'Ngày mai';
  }

  if (diffInDays > 1) {
    return `Còn ${diffInDays} ngày`;
  }

  return `Quá hạn ${Math.abs(diffInDays)} ngày`;
}

export function getInventoryTone(remainingDays: number) {
  if (remainingDays <= 3) {
    return 'critical';
  }

  if (remainingDays <= 7) {
    return 'warning';
  }

  return 'healthy';
}

export function getTomorrowDateInputValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
