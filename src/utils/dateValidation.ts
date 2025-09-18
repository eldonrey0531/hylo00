// Enhanced Date Validation Utilities
// Constitutional compliance: Edge-compatible, type-safe, performant

import { ValidationLevel } from '../types/enhanced-form-data';

// Date validation constants
const YEAR_THRESHOLD = 50;
const YEAR_BASE_1900 = 1900;
const YEAR_BASE_2000 = 2000;

// Date parsing utilities
export const dateUtils = {
  /**
   * Parse MM/DD/YY format date string to Date object
   */
  parseMMDDYY: (dateStr: string): Date | null => {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;

    const month = parseInt(parts[0]) - 1; // Month is 0-indexed
    const day = parseInt(parts[1]);
    let year = parseInt(parts[2]);

    // Convert 2-digit year to 4-digit year
    if (year < YEAR_THRESHOLD) {
      year += YEAR_BASE_2000;
    } else if (year < 100) {
      year += YEAR_BASE_1900;
    }

    const date = new Date(year, month, day);
    // Validate the date
    if (isNaN(date.getTime())) return null;

    return date;
  },

  /**
   * Format Date object to MM/DD/YY string
   */
  formatToMMDDYY: (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  },

  /**
   * Convert MM/DD/YY to HTML input format (YYYY-MM-DD)
   */
  convertToInputFormat: (dateStr: string): string => {
    if (!dateStr) return '';

    const date = dateUtils.parseMMDDYY(dateStr);
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  },

  /**
   * Get today's date string in MM/DD/YY format
   */
  getTodayString: (): string => {
    return dateUtils.formatToMMDDYY(new Date());
  },

  /**
   * Calculate days between two dates
   */
  calculateDaysBetween: (startDate: string, endDate: string): number | null => {
    const start = dateUtils.parseMMDDYY(startDate);
    const end = dateUtils.parseMMDDYY(endDate);

    if (!start || !end) return null;

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff > 0 ? daysDiff : null;
  },

  /**
   * Validate return date is after depart date
   */
  isReturnDateValid: (departDate: string, returnDate: string): boolean => {
    const days = dateUtils.calculateDaysBetween(departDate, returnDate);
    return days !== null && days > 0;
  },

  /**
   * Check if date is in the future
   */
  isFutureDate: (dateStr: string): boolean => {
    const date = dateUtils.parseMMDDYY(dateStr);
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return date >= today;
  },

  /**
   * Check if date is within valid range
   */
  isValidRange: (dateStr: string, minDate?: string, maxDate?: string): boolean => {
    const date = dateUtils.parseMMDDYY(dateStr);
    if (!date) return false;

    if (minDate) {
      const min = dateUtils.parseMMDDYY(minDate);
      if (min && date < min) return false;
    }

    if (maxDate) {
      const max = dateUtils.parseMMDDYY(maxDate);
      if (max && date > max) return false;
    }

    return true;
  },
};

// Date validation functions
export const dateValidation = {
  /**
   * Validate date format (MM/DD/YY)
   */
  validateDateFormat: (dateStr: string): boolean => {
    if (!dateStr) return true; // Empty is valid (optional field)

    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    if (!dateRegex.test(dateStr)) return false;

    const parts = dateStr.split('/');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return false;

    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Additional validation for actual date validity
    const date = new Date(year < 50 ? 2000 + year : year, month - 1, day);
    return date.getMonth() === month - 1;
  },

  /**
   * Validate date with context (depart/return relationship)
   */
  validateDateWithContext: (
    dateStr: string,
    context: { departDate?: string; returnDate?: string; field: 'departDate' | 'returnDate' }
  ): { isValid: boolean; message?: string; level: ValidationLevel } => {
    // First check basic format
    if (!dateValidation.validateDateFormat(dateStr)) {
      return {
        isValid: false,
        message: 'Please enter a valid date in MM/DD/YY format',
        level: 'error',
      };
    }

    // Check date range validity
    if (!dateUtils.isValidRange(dateStr)) {
      return {
        isValid: false,
        message: 'Date is outside the valid range',
        level: 'error',
      };
    }

    // Check depart/return date relationship
    if (context.field === 'returnDate' && context.departDate) {
      if (!dateUtils.isReturnDateValid(context.departDate, dateStr)) {
        return {
          isValid: false,
          message: 'Return date must be after departure date',
          level: 'error',
        };
      }
    }

    // Check if date is too far in the future (optional warning)
    if (dateUtils.isFutureDate(dateStr)) {
      const days = dateUtils.calculateDaysBetween(dateUtils.getTodayString(), dateStr);
      if (days && days > 365) {
        return {
          isValid: true,
          message: 'Date is more than a year in the future',
          level: 'warning',
        };
      }
    }

    return { isValid: true, level: 'none' };
  },

  /**
   * Get validation level for a date string
   */
  getValidationLevel: (dateStr: string): ValidationLevel => {
    if (!dateStr) return 'none';
    return dateValidation.validateDateFormat(dateStr) ? 'none' : 'error';
  },
};

// Performance monitoring for date operations
export const datePerformance = {
  /**
   * Measure date parsing performance
   */
  measureParseTime: (dateStr: string): number => {
    const start = performance.now();
    dateUtils.parseMMDDYY(dateStr);
    return performance.now() - start;
  },

  /**
   * Measure validation performance
   */
  measureValidationTime: (dateStr: string): number => {
    const start = performance.now();
    dateValidation.validateDateFormat(dateStr);
    return performance.now() - start;
  },
};
