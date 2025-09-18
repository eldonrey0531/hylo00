// Enhanced Currency Formatting Utilities
// Constitutional compliance: Edge-compatible, type-safe, performant

import { Currency } from '../types/enhanced-form-data';

// Currency formatting constants
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
};

const CURRENCY_LOCALE: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

// Currency formatting utilities
export const currencyFormatting = {
  /**
   * Format number to currency string
   */
  formatCurrency: (
    amount: number,
    currency: Currency,
    options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      useGrouping?: boolean;
    }
  ): string => {
    const {
      minimumFractionDigits = 0,
      maximumFractionDigits = 0,
      useGrouping = true,
    } = options || {};

    try {
      const formatter = new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: 'currency',
        currency: currency,
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping,
      });

      return formatter.format(amount);
    } catch (error) {
      // Fallback to simple formatting if Intl fails
      const symbol = CURRENCY_SYMBOLS[currency];
      const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping,
      });
      return `${symbol}${formattedAmount}`;
    }
  },

  /**
   * Format currency for display with symbol only
   */
  formatCurrencySymbol: (amount: number, currency: Currency): string => {
    const symbol = CURRENCY_SYMBOLS[currency];
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    });
    return `${symbol}${formattedAmount}`;
  },

  /**
   * Format currency for compact display (e.g., $1.2K, $1.5M)
   */
  formatCurrencyCompact: (amount: number, currency: Currency): string => {
    const symbol = CURRENCY_SYMBOLS[currency];

    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
      return currencyFormatting.formatCurrency(amount, currency);
    }
  },

  /**
   * Parse currency string back to number
   */
  parseCurrency: (currencyStr: string, currency: Currency): number | null => {
    if (!currencyStr) return null;

    try {
      // Remove currency symbol and formatting
      const symbol = CURRENCY_SYMBOLS[currency];
      let cleanStr = currencyStr.replace(symbol, '').trim();

      // Remove grouping separators and convert to number
      cleanStr = cleanStr.replace(/,/g, '');
      const amount = parseFloat(cleanStr);

      return isNaN(amount) ? null : amount;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get currency symbol
   */
  getCurrencySymbol: (currency: Currency): string => {
    return CURRENCY_SYMBOLS[currency];
  },

  /**
   * Get currency name
   */
  getCurrencyName: (currency: Currency): string => {
    return CURRENCY_NAMES[currency];
  },

  /**
   * Get currency locale
   */
  getCurrencyLocale: (currency: Currency): string => {
    return CURRENCY_LOCALE[currency];
  },

  /**
   * Convert between currencies (simplified - would need real exchange rates)
   */
  convertCurrency: (
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRate: number
  ): number => {
    if (fromCurrency === toCurrency) return amount;
    return Math.round(amount * exchangeRate * 100) / 100;
  },

  /**
   * Format budget range
   */
  formatBudgetRange: (min: number, max: number, currency: Currency): string => {
    const minFormatted = currencyFormatting.formatCurrency(min, currency);
    const maxFormatted = currencyFormatting.formatCurrency(max, currency);
    return `${minFormatted} - ${maxFormatted}`;
  },

  /**
   * Format per-person budget
   */
  formatPerPersonBudget: (totalBudget: number, personCount: number, currency: Currency): string => {
    const perPerson = Math.round(totalBudget / personCount);
    const perPersonFormatted = currencyFormatting.formatCurrency(perPerson, currency);
    const totalFormatted = currencyFormatting.formatCurrency(totalBudget, currency);
    return `${perPersonFormatted} per person (${totalFormatted} total)`;
  },
};

// Currency validation utilities
export const currencyValidation = {
  /**
   * Validate currency amount
   */
  validateAmount: (amount: number): boolean => {
    return !isNaN(amount) && amount >= 0 && amount <= 10000000; // Reasonable upper limit
  },

  /**
   * Validate currency string format
   */
  validateCurrencyString: (currencyStr: string, currency: Currency): boolean => {
    const parsed = currencyFormatting.parseCurrency(currencyStr, currency);
    return parsed !== null && currencyValidation.validateAmount(parsed);
  },

  /**
   * Check if amount is within budget range
   */
  isWithinBudget: (amount: number, minBudget: number, maxBudget: number): boolean => {
    return amount >= minBudget && amount <= maxBudget;
  },
};

// Currency display preferences
export const currencyDisplay = {
  /**
   * Get display preferences for currency
   */
  getDisplayPreferences: (currency: Currency) => {
    return {
      symbol: CURRENCY_SYMBOLS[currency],
      name: CURRENCY_NAMES[currency],
      locale: CURRENCY_LOCALE[currency],
      position: 'before' as const, // All our currencies have symbol before amount
      decimalPlaces: 0, // For budget amounts, we typically don't show cents
      grouping: true,
    };
  },

  /**
   * Get all available currencies
   */
  getAvailableCurrencies: (): Currency[] => {
    return Object.keys(CURRENCY_SYMBOLS) as Currency[];
  },

  /**
   * Get currency options for select dropdown
   */
  getCurrencyOptions: () => {
    return Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => ({
      value: code as Currency,
      label: `${symbol} ${CURRENCY_NAMES[code as Currency]}`,
      symbol,
    }));
  },
};

// Performance monitoring for currency operations
export const currencyPerformance = {
  /**
   * Measure formatting performance
   */
  measureFormatTime: (amount: number, currency: Currency): number => {
    const start = performance.now();
    currencyFormatting.formatCurrency(amount, currency);
    return performance.now() - start;
  },

  /**
   * Measure parsing performance
   */
  measureParseTime: (currencyStr: string, currency: Currency): number => {
    const start = performance.now();
    currencyFormatting.parseCurrency(currencyStr, currency);
    return performance.now() - start;
  },
};
