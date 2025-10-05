import type { TripFormData } from '@/types';

type InclusionCategory = {
  key: string;
  emoji: string;
  label: string;
};

const INCLUSION_MAPPING: Record<string, InclusionCategory> = {
  flights: { key: 'flights', emoji: '✈️', label: 'Flights' },
  accommodations: { key: 'accommodations', emoji: '🏨', label: 'Accommodations' },
  'rental-car': { key: 'rentalCar', emoji: '🚗', label: 'Rental Car' },
  activities: { key: 'activities', emoji: '🛶', label: 'Activities & Tours' },
  dining: { key: 'dining', emoji: '🍽️', label: 'Dining' },
  entertainment: { key: 'entertainment', emoji: '🪇', label: 'Entertainment' },
  nature: { key: 'nature', emoji: '🌲', label: 'Nature' },
  train: { key: 'trainTickets', emoji: '🚆', label: 'Train Tickets' },
  cruise: { key: 'cruise', emoji: '🛳️', label: 'Cruise' },
  other: { key: 'other', emoji: '✨', label: 'Other' },
};

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function buildCustomCategory(id: string): InclusionCategory | null {
  const normalized = toTrimmedString(id?.replace?.(/[_-]+/g, ' ') ?? id);
  if (!normalized) {
    return null;
  }

  const words = normalized.split(' ');
  const key = words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
  const label = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return {
    key: key || 'custom',
    emoji: '✨',
    label: label || 'Custom Recommendation',
  };
}

export type ExtendedTripFormData = TripFormData & Record<string, unknown>;

export function resolveRecommendationCategories(formData: ExtendedTripFormData): InclusionCategory[] {
  const selectedInclusions = Array.isArray(formData.selectedInclusions)
    ? (formData.selectedInclusions as unknown[])
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value): value is string => Boolean(value))
    : [];

  const inclusionMap = new Map<string, InclusionCategory>();
  selectedInclusions.forEach((id) => {
    const mapped = INCLUSION_MAPPING[id] ?? buildCustomCategory(id);
    if (mapped && !inclusionMap.has(mapped.key)) {
      inclusionMap.set(mapped.key, mapped);
    }
  });

  if (inclusionMap.size > 0) {
    return Array.from(inclusionMap.values());
  }

  return Object.values(INCLUSION_MAPPING);
}

export function parseIsoDate(value: unknown): Date | null {
  const text = toTrimmedString(value);
  if (!text) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = text.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function computeInferredDayCount(
  formData: ExtendedTripFormData,
  departDate: Date | null,
  returnDate: Date | null,
): number {
  const plannedDaysValue =
    typeof formData.plannedDays === 'number' && Number.isFinite(formData.plannedDays) && formData.plannedDays > 0
      ? Math.round(formData.plannedDays)
      : null;

  if (plannedDaysValue) {
    return plannedDaysValue;
  }

  if (departDate && returnDate) {
    const diffMs = returnDate.getTime() - departDate.getTime();
    if (diffMs >= 0) {
      return Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)) + 1);
    }
  }

  if (departDate && !returnDate) {
    return 1;
  }

  return 3;
}

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
