// src/components/TripDetails/types.ts
import { TripDetailsFormData, tripDetailsSchema } from '../../schemas/formSchemas';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type BudgetMode = 'total' | 'per-person';

// Use the validated FormData from schemas
export type FormData = TripDetailsFormData;

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  fieldErrors: Record<string, string>;
}

export interface BaseFormProps {
  formData: FormData;
  onFormChange: (data: Partial<FormData>) => void;
  validationErrors?: Record<string, string>;
  onValidation?: (field: string, isValid: boolean, errors?: string[]) => void;
}

// Export schema for validation
export { tripDetailsSchema };

// Constants
export const YEAR_THRESHOLD = 50;
export const YEAR_BASE_1900 = 1900;
export const YEAR_BASE_2000 = 2000;
export const MAX_BUDGET = 10000;
export const BUDGET_STEP = 250;
export const MIN_ADULTS = 1;
export const MIN_CHILDREN = 0;
export const MAX_CHILD_AGE = 17;
export const MAX_PLANNED_DAYS = 31;
export const UNSELECTED_AGE = -1;

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};
