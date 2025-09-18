Implementation Plan: Form Component Separation

I'll help you separate the TripDetailsForm into individual components while maintaining all functionality. Here's a rapid implementation approach following the HYLO principles.

## TODO: Form Component Separation - Rapid Implementation

### Implementation Sprint

- [x] Create individual form components structure
- [x] Extract shared types and utilities
- [x] Maintain state management in parent
- [x] Ensure Edge Runtime compatibility
- [x] Keep all existing functionality intact

### File Structure

```filetree
src/components/
├── TripDetails/
│   ├── index.tsx                 # Parent component (formerly TripDetailsForm)
│   ├── LocationForm.tsx           # Location input component
│   ├── DatesForm.tsx             # Dates selection component
│   ├── TravelersForm.tsx         # Travelers configuration component
│   ├── BudgetForm.tsx            # Budget settings component
│   ├── types.ts                  # Shared types
│   └── utils.ts                  # Shared utilities (dateUtils, etc.)
```

## 1. Shared Types (`types.ts`)

```typescript
// src/components/TripDetails/types.ts
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type BudgetMode = 'total' | 'per-person';

export interface FormData {
  location: string;
  departDate: string;
  returnDate: string;
  flexibleDates: boolean;
  plannedDays?: number;
  adults: number;
  children: number;
  childrenAges: number[];
  budget: number;
  currency: Currency;
  flexibleBudget?: boolean;
  accommodationOther?: string;
  rentalCarPreferences?: string[];
  travelStyleChoice?: 'answer-questions' | 'skip-to-details' | 'not-selected';
  travelStyleAnswers?: Record<string, any>;
}

export interface BaseFormProps {
  formData: FormData;
  onFormChange: (data: Partial<FormData>) => void;
}

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
```

## 2. Shared Utilities (`utils.ts`)

```typescript
// src/components/TripDetails/utils.ts
import { YEAR_THRESHOLD, YEAR_BASE_1900, YEAR_BASE_2000 } from './types';

export const dateUtils = {
  parseMMDDYY: (dateStr: string): Date | null => {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const month = parseInt(parts[0] || '0') - 1;
    const day = parseInt(parts[1] || '0');
    let year = parseInt(parts[2] || '0');

    if (year < YEAR_THRESHOLD) {
      year += YEAR_BASE_2000;
    } else if (year < 100) {
      year += YEAR_BASE_1900;
    }

    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null;

    return date;
  },

  formatToMMDDYY: (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  },

  convertToInputFormat: (dateStr: string): string => {
    if (!dateStr) return '';
    const date = dateUtils.parseMMDDYY(dateStr);
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getTodayString: (): string => {
    return new Date().toISOString().split('T')[0] || '';
  },

  calculateDaysBetween: (startDate: string, endDate: string): number | null => {
    const start = dateUtils.parseMMDDYY(startDate);
    const end = dateUtils.parseMMDDYY(endDate);

    if (!start || !end) return null;

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : null;
  },

  isReturnDateValid: (departDate: string, returnDate: string): boolean => {
    const depart = dateUtils.parseMMDDYY(departDate);
    const returnD = dateUtils.parseMMDDYY(returnDate);

    if (!depart || !returnD) return false;
    return returnD.getTime() > depart.getTime();
  },
};
```

## 3. LocationForm Component

```typescript
// src/components/TripDetails/LocationForm.tsx
import React from 'react';
import { BaseFormProps } from './types';

const LocationForm: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const handleLocationChange = (value: string) => {
    onFormChange({ location: value });
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        LOCATION(S)
      </h3>
      <input
        type="text"
        placeholder='Example: "New York", "Thailand", "Spain and Portugal"'
        value={formData.location || ''}
        onChange={(e) => handleLocationChange(e.target.value)}
        className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white placeholder-gray-500 font-bold font-raleway text-base"
        aria-label="Trip location"
      />
    </div>
  );
};

export default LocationForm;
```

## 4. DatesForm Component

```typescript
// src/components/TripDetails/DatesForm.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { BaseFormProps, MAX_PLANNED_DAYS } from './types';
import { dateUtils } from './utils';

const DatesForm: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localFlexibleDates, setLocalFlexibleDates] = useState(Boolean(formData.flexibleDates));
  const departDateRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalFlexibleDates(Boolean(formData.flexibleDates));
  }, [formData.flexibleDates]);

  const handleDateChange = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      if (value) {
        const date = new Date(value);
        const formattedDate = dateUtils.formatToMMDDYY(date);

        if (field === 'returnDate') {
          if (
            formData.departDate &&
            !dateUtils.isReturnDateValid(formData.departDate, formattedDate)
          ) {
            console.warn('Return date must be at least one day after departure date');
            onFormChange({ returnDate: '' });
            return;
          }
        }

        if (field === 'departDate' && formData.returnDate) {
          if (!dateUtils.isReturnDateValid(formattedDate, formData.returnDate)) {
            onFormChange({ [field]: formattedDate, returnDate: '' });
            return;
          }
        }

        onFormChange({ [field]: formattedDate });
      }
    },
    [formData, onFormChange]
  );

  const handleManualDateInput = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 6) cleaned = cleaned.substring(0, 6);

      let formatted = '';
      if (cleaned.length >= 1) {
        let month = cleaned.substring(0, 2);
        if (cleaned.length >= 2) {
          let monthNum = parseInt(month);
          if (monthNum > 12) month = '12';
          else if (monthNum === 0 && month.length === 2) month = '01';
        }
        formatted = month;
      }

      if (cleaned.length >= 3) {
        let day = cleaned.substring(2, 4);
        if (cleaned.length >= 4) {
          let dayNum = parseInt(day);
          if (dayNum > 31) day = '31';
          else if (dayNum === 0 && day.length === 2) day = '01';
        }
        formatted += '/' + day;
      }

      if (cleaned.length >= 5) {
        let year = cleaned.substring(4, 6);
        formatted += '/' + year;
      }

      if (formatted.length === 8) {
        if (
          field === 'returnDate' &&
          formData.departDate &&
          !dateUtils.isReturnDateValid(formData.departDate, formatted)
        ) {
          console.warn('Return date must be at least one day after departure date');
          return;
        }

        if (
          field === 'departDate' &&
          formData.returnDate &&
          !dateUtils.isReturnDateValid(formatted, formData.returnDate)
        ) {
          onFormChange({ [field]: formatted, returnDate: '' });
          return;
        }
      }

      onFormChange({ [field]: formatted });
    },
    [formData, onFormChange]
  );

  const handleFlexibleDatesChange = useCallback(
    (checked: boolean) => {
      setLocalFlexibleDates(checked);
      const updates: Partial<typeof formData> = { flexibleDates: checked };

      if (checked) {
        updates.returnDate = '';
      } else {
        delete updates.plannedDays;
      }

      onFormChange(updates);
    },
    [formData, onFormChange]
  );

  const getMinReturnDate = useCallback(() => {
    if (formData.departDate) {
      const departDate = dateUtils.parseMMDDYY(formData.departDate);
      if (departDate) {
        departDate.setDate(departDate.getDate() + 1);
        return departDate.toISOString().split('T')[0];
      }
    }
    return dateUtils.getTodayString();
  }, [formData.departDate]);

  const totalDays = dateUtils.calculateDaysBetween(formData.departDate, formData.returnDate);
  const isFlexibleDatesEnabled = localFlexibleDates;

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        DATES
      </h3>
      <div className="space-y-4">
        {/* Departure Date */}
        <div>
          <label className="block text-primary mb-2 font-bold font-raleway text-base">
            Departure Date
          </label>
          <div
            className={`relative cursor-pointer ${isFlexibleDatesEnabled ? 'hidden' : ''}`}
            onClick={() => !isFlexibleDatesEnabled && departDateRef.current?.showPicker()}
          >
            <input
              type="text"
              placeholder="mm/dd/yy"
              value={formData.departDate || ''}
              onChange={(e) => handleManualDateInput('departDate', e.target.value)}
              onFocus={(e) => e.target.select()}
              maxLength={8}
              className="w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary placeholder-gray-400 font-bold font-raleway text-base bg-white cursor-pointer"
              aria-label="Departure date"
              disabled={isFlexibleDatesEnabled}
            />
            <input
              ref={departDateRef}
              type="date"
              min={dateUtils.getTodayString()}
              value={dateUtils.convertToInputFormat(formData.departDate || '')}
              onChange={(e) => handleDateChange('departDate', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-primary mb-2 font-bold font-raleway text-base">
            Return Date
          </label>
          <div
            className={`relative ${
              isFlexibleDatesEnabled ? 'hidden cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={() => !isFlexibleDatesEnabled && returnDateRef.current?.showPicker()}
          >
            <input
              type="text"
              placeholder="mm/dd/yy"
              value={formData.returnDate || ''}
              onChange={(e) => handleManualDateInput('returnDate', e.target.value)}
              onFocus={(e) => e.target.select()}
              maxLength={8}
              disabled={isFlexibleDatesEnabled}
              className={`w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary placeholder-gray-400 font-bold font-raleway text-base ${
                isFlexibleDatesEnabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white cursor-pointer'
              }`}
              aria-label="Return date"
              aria-disabled={isFlexibleDatesEnabled}
            />
            <input
              ref={returnDateRef}
              type="date"
              min={getMinReturnDate()}
              value={dateUtils.convertToInputFormat(formData.returnDate || '')}
              onChange={(e) => handleDateChange('returnDate', e.target.value)}
              disabled={isFlexibleDatesEnabled}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Total Days Display */}
      {totalDays && !isFlexibleDatesEnabled && (
        <div className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-4 text-center mt-4">
          <span className="text-primary font-bold font-raleway text-base">Total days: </span>
          <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border-3 border-primary ml-2">
            <span className="font-bold text-primary font-raleway text-xl">{totalDays}</span>
          </div>
        </div>
      )}

      {/* Flexible Dates Switch */}
      <div className="flex items-center mt-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isFlexibleDatesEnabled}
            onChange={(e) => handleFlexibleDatesChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
              isFlexibleDatesEnabled
                ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
            }`}
          ></div>
          <span className="text-primary font-bold font-raleway text-sm">
            I'm not sure or my dates are flexible
          </span>
        </label>
      </div>

      {/* Flexible Dates Dropdown */}
      {isFlexibleDatesEnabled && (
        <div className="mt-4 transition-all duration-300 ease-in-out">
          <label className="block text-primary mb-2 font-bold font-raleway text-base">
            How many days should we plan?
          </label>
          <div className="relative">
            <select
              value={formData.plannedDays || ''}
              onChange={(e) => onFormChange({ plannedDays: parseInt(e.target.value) })}
              className="w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-base appearance-none"
            >
              <option value="">Select days</option>
              {Array.from({ length: MAX_PLANNED_DAYS }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day} {day === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatesForm;
```

## 5. TravelersForm Component

```typescript
// src/components/TripDetails/TravelersForm.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { BaseFormProps, MIN_ADULTS, MIN_CHILDREN, MAX_CHILD_AGE, UNSELECTED_AGE } from './types';

const TravelersForm: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [adults, setAdults] = useState(formData.adults || 2);
  const [children, setChildren] = useState(formData.children || 0);
  const [childrenAges, setChildrenAges] = useState<number[]>(formData.childrenAges || []);

  useEffect(() => {
    setAdults(formData.adults || 2);
    setChildren(formData.children || 0);
    setChildrenAges(formData.childrenAges || []);
  }, [formData]);

  const adjustAdults = useCallback(
    (increment: boolean) => {
      const newValue = increment ? adults + 1 : Math.max(MIN_ADULTS, adults - 1);
      setAdults(newValue);
      onFormChange({ adults: newValue });
    },
    [adults, onFormChange]
  );

  const adjustChildren = useCallback(
    (increment: boolean) => {
      const newChildrenCount = increment ? children + 1 : Math.max(MIN_CHILDREN, children - 1);

      let newChildrenAges = [...childrenAges];
      if (increment) {
        newChildrenAges.push(UNSELECTED_AGE);
      } else if (newChildrenAges.length > newChildrenCount) {
        newChildrenAges = newChildrenAges.slice(0, newChildrenCount);
      }

      setChildren(newChildrenCount);
      setChildrenAges(newChildrenAges);
      onFormChange({ children: newChildrenCount, childrenAges: newChildrenAges });
    },
    [children, childrenAges, onFormChange]
  );

  const updateChildAge = useCallback(
    (index: number, age: number) => {
      const newAges = [...childrenAges];
      while (newAges.length <= index) {
        newAges.push(UNSELECTED_AGE);
      }
      newAges[index] = age;
      setChildrenAges(newAges);
      onFormChange({ childrenAges: newAges });
    },
    [childrenAges, onFormChange]
  );

  const totalTravelers = adults + children;
  const hasUnselectedChildrenAges =
    children > 0 &&
    (childrenAges.length !== children ||
      childrenAges.some((age) => age === UNSELECTED_AGE || age === undefined));

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        TRAVELERS
      </h3>
      <div className="space-y-4">
        {/* Adults Counter */}
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold font-raleway text-base">Adults</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => adjustAdults(false)}
              className="w-8 h-8 rounded-full border-3 border-primary flex items-center justify-center bg-white hover:bg-primary hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={adults <= MIN_ADULTS}
              aria-label="Decrease adults"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-bold text-primary w-8 text-center font-raleway text-xl">
              {adults}
            </span>
            <button
              onClick={() => adjustAdults(true)}
              className="w-8 h-8 rounded-full border-3 border-primary flex items-center justify-center bg-white hover:bg-primary hover:text-white transition-colors duration-200"
              aria-label="Increase adults"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Children Counter */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary font-bold font-raleway text-base">Children</span>
            <span className="text-primary font-raleway text-sm ml-2">(0-17)</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => adjustChildren(false)}
              className="w-8 h-8 rounded-full border-3 border-primary flex items-center justify-center bg-white hover:bg-primary hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={children <= MIN_CHILDREN}
              aria-label="Decrease children"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-bold text-primary w-8 text-center font-raleway text-xl">
              {children}
            </span>
            <button
              onClick={() => adjustChildren(true)}
              className="w-8 h-8 rounded-full border-3 border-primary flex items-center justify-center bg-white hover:bg-primary hover:text-white transition-colors duration-200"
              aria-label="Increase children"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Total Travelers Display */}
      <div className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-4 text-center mt-4">
        <span className="text-primary font-bold font-raleway text-base">Total travelers: </span>
        <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border-3 border-primary ml-2">
          <span className="font-bold text-primary font-raleway text-xl">{totalTravelers}</span>
        </div>
      </div>

      {/* Children Ages */}
      {children > 0 && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: children }, (_, index) => (
            <div key={index} className="flex items-center justify-between">
              <label className="text-primary font-bold font-raleway text-sm">
                Child {index + 1} age
              </label>
              <select
                value={childrenAges[index] !== undefined ? childrenAges[index] : UNSELECTED_AGE}
                onChange={(e) => updateChildAge(index, parseInt(e.target.value))}
                className="px-3 py-2 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white text-primary font-bold font-raleway text-sm"
              >
                <option value={UNSELECTED_AGE}>Select age</option>
                {Array.from({ length: MAX_CHILD_AGE + 1 }, (_, age) => (
                  <option key={age} value={age}>
                    {age === 0 ? '< 1' : age}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {hasUnselectedChildrenAges && (
            <p className="text-sm text-red-600 font-bold font-raleway mt-2">
              Please select ages for all children
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelersForm;
```

## 6. BudgetForm Component

```typescript
// src/components/TripDetails/BudgetForm.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  BaseFormProps,
  Currency,
  BudgetMode,
  currencySymbols,
  MAX_BUDGET,
  BUDGET_STEP,
} from './types';

const BudgetForm: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [budgetRange, setBudgetRange] = useState(formData.budget || 5000);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('total');

  useEffect(() => {
    setBudgetRange(formData.budget || 5000);
  }, [formData.budget]);

  const handleBudgetChange = useCallback(
    (value: number) => {
      setBudgetRange(value);
      onFormChange({ budget: value });
    },
    [onFormChange]
  );

  const handleBudgetModeChange = useCallback((checked: boolean) => {
    setBudgetMode(checked ? 'per-person' : 'total');
  }, []);

  const getCurrencySymbol = useCallback(() => {
    return currencySymbols[formData.currency || 'USD'];
  }, [formData.currency]);

  const getBudgetDisplay = useCallback(() => {
    const symbol = getCurrencySymbol();
    if (budgetRange >= MAX_BUDGET) {
      return `${symbol}10,000+`;
    }
    return `${symbol}${budgetRange.toLocaleString()}`;
  }, [budgetRange, getCurrencySymbol]);

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
          BUDGET
        </h3>
      </div>

      {/* Budget Flexibility Toggle */}
      <div className="flex items-center mb-6">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.flexibleBudget || false}
            onChange={(e) => onFormChange({ flexibleBudget: e.target.checked })}
            className="sr-only peer"
            aria-label="Toggle budget flexibility"
          />
          <div
            className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
              formData.flexibleBudget
                ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
            }`}
          ></div>
          <span className="text-primary font-bold font-raleway text-sm">
            I'm not sure or my budget is flexible
          </span>
        </label>
      </div>

      {/* Budget Display and Slider - Hidden when flexible */}
      {!formData.flexibleBudget && (
        <>
          {/* Budget Display */}
          <div className="text-center mb-6">
            <div className="bg-primary text-white px-6 py-3 rounded-[10px] font-bold text-2xl inline-block font-raleway">
              {getBudgetDisplay()}
            </div>
          </div>

          {/* Budget Slider */}
          <div className="space-y-4">
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max={MAX_BUDGET}
                step={BUDGET_STEP}
                value={budgetRange}
                onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                onInput={(e) => handleBudgetChange(parseInt((e.target as HTMLInputElement).value))}
                className="w-full slider-primary"
                aria-label="Budget range"
                aria-valuemin={0}
                aria-valuemax={MAX_BUDGET}
                aria-valuenow={budgetRange}
              />
            </div>
            <div
              className="flex justify-between text-base font-bold font-raleway px-3"
              style={{ color: '#406170' }}
            >
              <span>{currencySymbols[formData.currency || 'USD']}0</span>
              <span>{currencySymbols[formData.currency || 'USD']}10,000+</span>
            </div>
          </div>
        </>
      )}

      {/* Currency and Budget Mode Row */}
      <div className="flex items-center justify-between gap-6 mt-6">
        {/* Currency Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={formData.currency || 'USD'}
            onChange={(e) => onFormChange({ currency: e.target.value as Currency })}
            className="px-4 py-2 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-[#ece8de] text-primary font-bold font-raleway text-base"
            aria-label="Select currency"
          >
            <option value="USD" className="font-bold font-raleway text-sm">
              $ USD
            </option>
            <option value="EUR" className="font-bold font-raleway text-sm">
              € EUR
            </option>
            <option value="GBP" className="font-bold font-raleway text-sm">
              £ GBP
            </option>
            <option value="CAD" className="font-bold font-raleway text-sm">
              C$ CAD
            </option>
            <option value="AUD" className="font-bold font-raleway text-sm">
              A$ AUD
            </option>
          </select>
        </div>

        {/* Budget Mode Switch */}
        <div className="flex items-center space-x-4">
          <span className="text-primary font-bold font-raleway text-sm">Total trip budget</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={budgetMode === 'per-person'}
              onChange={(e) => handleBudgetModeChange(e.target.checked)}
              className="sr-only peer"
              aria-label="Toggle budget mode"
            />
            <div
              className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 ${
                budgetMode === 'per-person'
                  ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                  : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
              }`}
            ></div>
          </label>
          <span className="text-primary font-bold font-raleway text-sm">Per-person budget</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;
```

## 7. Parent Component (index.tsx)

```typescript
// src/components/TripDetails/index.tsx
import React, { useCallback } from 'react';
import LocationForm from './LocationForm';
import DatesForm from './DatesForm';
import TravelersForm from './TravelersForm';
import BudgetForm from './BudgetForm';
import { FormData } from './types';

interface TripDetailsProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ formData, onFormChange }) => {
  const handleFormUpdate = useCallback(
    (updates: Partial<FormData>) => {
      onFormChange({ ...formData, ...updates });
    },
    [formData, onFormChange]
  );

  return (
    <div className="space-y-6">
      {/* Location Box */}
      <LocationForm formData={formData} onFormChange={handleFormUpdate} />

      {/* Dates and Travelers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatesForm formData={formData} onFormChange={handleFormUpdate} />
        <TravelersForm formData={formData} onFormChange={handleFormUpdate} />
      </div>

      {/* Budget Box */}
      <BudgetForm formData={formData} onFormChange={handleFormUpdate} />
    </div>
  );
};

export default TripDetails;
```

## 8. Update Parent Import

```typescript
// In the parent component that uses TripDetailsForm
// Change from:
import TripDetailsForm from '@/components/TripDetailsForm';

// To:
import TripDetails from '@/components/TripDetails';

// Update usage from:
<TripDetailsForm formData={formData} onFormChange={handleFormChange} />

// To:
<TripDetails formData={formData} onFormChange={handleFormChange} />
```

## Search Context Suggestions

To find related code patterns or implementations, search for these terms in your context:

```bash
# Search for form-related patterns
mcp:search "form validation"
mcp:search "react hook form"
mcp:search "zod schema"

# Search for component patterns
mcp:search "component separation"
mcp:search "shared types"
mcp:search "form state management"

# Search for date handling
mcp:search "date picker"
mcp:search "date utils"
mcp:search "date validation"

# Search for UI components
mcp:search "slider component"
mcp:search "toggle switch"
mcp:search "counter component"
```

## Migration Checklist

### Rapid Implementation Steps

1. [ ] Create TripDetails folder structure
2. [ ] Move shared types to types.ts
3. [ ] Move dateUtils to utils.ts
4. [ ] Create individual form components
5. [ ] Update parent component imports
6. [ ] Test all functionality works
7. [ ] Polish types and validation later

This separation maintains all existing functionality while creating a cleaner, more maintainable structure. Each component is self-contained but shares common types and utilities through imports.
