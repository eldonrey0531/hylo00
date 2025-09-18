// Date Input Validation Schema - Simplified
// Constitutional compliance: Edge-compatible, type-safe, observable

import { z } from 'zod';

// Core date string validation
const dateStringRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/;

// Date input value schema
export const DateInputValueSchema = z
  .string()
  .refine(
    (value) => {
      if (value === '') return true; // Allow empty
      return dateStringRegex.test(value);
    },
    {
      message: 'Date must be in MM/DD/YY format'
    }
  );

// Date input state schema
export const DateInputStateSchema = z.object({
  value: DateInputValueSchema,
  displayValue: z.string(),
  isValid: z.boolean(),
  isPickerOpen: z.boolean(),
  clickZoneActive: z.boolean(),
  hasFocus: z.boolean(),
  validationMessage: z.string().optional(),
  validationLevel: z.enum(['none', 'warning', 'error']),
  ariaLabel: z.string(),
  ariaDescribedBy: z.string().optional()
});

// Date input props schema
export const DateInputPropsSchema = z.object({
  value: z.string(),
  onChange: z.function().args(z.string()).returns(z.void()),
  placeholder: z.string().optional(),
  disabled: z.boolean().optional(),
  readonly: z.boolean().optional(),
  enableClickZoneExpansion: z.boolean().optional(),
  showValidationFeedback: z.boolean().optional(),
  'aria-label': z.string().optional(),
  'aria-describedby': z.string().optional(),
  id: z.string().optional(),
  className: z.string().optional(),
  variant: z.enum(['default', 'compact', 'inline']).optional()
});

// Validation functions
export const validateDateInput = (value: string): { isValid: boolean; message?: string } => {
  try {
    DateInputValueSchema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        message: error.errors[0]?.message || 'Invalid date'
      };
    }
    return { isValid: false, message: 'Validation error' };
  }
};

export const validateFutureDate = (value: string): { isValid: boolean; message?: string } => {
  const dateValidation = validateDateInput(value);
  if (!dateValidation.isValid || value === '') {
    return dateValidation;
  }
  
  const parts = value.split('/');
  if (parts.length !== 3) return { isValid: false, message: 'Invalid date format' };
  
  const month = parseInt(parts[0]!);
  const day = parseInt(parts[1]!);
  const year = parseInt(parts[2]!);
  
  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    return { isValid: false, message: 'Invalid date' };
  }
  
  const fullYear = year < 50 ? 2000 + year : 1900 + year;
  const inputDate = new Date(fullYear, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (inputDate <= today) {
    return { isValid: false, message: 'Date must be in the future' };
  }
  
  return { isValid: true };
};

// Performance validation
export const validateSchemaPerformance = (schema: z.ZodSchema, testData: any): boolean => {
  const iterations = 1000;
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    try {
      schema.parse(testData);
    } catch {
      // Ignore errors, just measure performance
    }
  }
  
  const endTime = performance.now();
  const averageTime = (endTime - startTime) / iterations;
  
  return averageTime < 1; // Should take less than 1ms on average
};