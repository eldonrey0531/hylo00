import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Minus, Calendar, ChevronDown } from 'lucide-react';

// Type definitions
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
type BudgetMode = 'total' | 'per-person';

interface FormData {
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
  // Enhanced fields
  flexibleBudget?: boolean;
  accommodationOther?: string;
  rentalCarPreferences?: string[];
  travelStyleChoice?: 'answer-questions' | 'skip-to-details' | 'not-selected';
  travelStyleAnswers?: Record<string, any>;
}

interface TripDetailsFormProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
}

// Constants
const YEAR_THRESHOLD = 50;
const YEAR_BASE_1900 = 1900;
const YEAR_BASE_2000 = 2000;
const MAX_BUDGET = 10000;
const BUDGET_STEP = 250;
const MIN_ADULTS = 1;
const MIN_CHILDREN = 0;
const MAX_CHILD_AGE = 17;
const MAX_PLANNED_DAYS = 31;
const UNSELECTED_AGE = -1;

// Utility functions
const dateUtils = {
  parseMMDDYY: (dateStr: string): Date | null => {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const month = parseInt(parts[0] || '0') - 1; // Month is 0-indexed
    const day = parseInt(parts[1] || '0');
    let year = parseInt(parts[2] || '0');

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

    // Return date must be at least one day after departure date
    return returnD.getTime() > depart.getTime();
  },
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

const TripDetailsForm: React.FC<TripDetailsFormProps> = ({ formData, onFormChange }) => {
  // Local state
  const [localFlexibleDates, setLocalFlexibleDates] = useState(Boolean(formData.flexibleDates));
  const [budgetRange, setBudgetRange] = useState(formData.budget || 5000);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('total');
  const [adults, setAdults] = useState(formData.adults || 2);
  const [children, setChildren] = useState(formData.children || 0);
  const [childrenAges, setChildrenAges] = useState<number[]>(formData.childrenAges || []);

  const departDateRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);

  // Sync local state when formData changes from parent
  useEffect(() => {
    setLocalFlexibleDates(Boolean(formData.flexibleDates));
    setAdults(formData.adults || 2);
    setChildren(formData.children || 0);
    setChildrenAges(formData.childrenAges || []);
    setBudgetRange(formData.budget || 5000);
  }, [formData]);

  // Memoized handlers
  const handleInputChange = useCallback(
    (field: keyof FormData, value: any) => {
      onFormChange({ ...formData, [field]: value });
    },
    [formData, onFormChange]
  );

  const handleBudgetChange = useCallback(
    (value: number) => {
      setBudgetRange(value);
      handleInputChange('budget', value);
    },
    [handleInputChange]
  );

  const adjustAdults = useCallback(
    (increment: boolean) => {
      const newValue = increment ? adults + 1 : Math.max(MIN_ADULTS, adults - 1);
      setAdults(newValue);
      handleInputChange('adults', newValue);
    },
    [adults, handleInputChange]
  );

  const adjustChildren = useCallback(
    (increment: boolean) => {
      const newChildrenCount = increment ? children + 1 : Math.max(MIN_CHILDREN, children - 1);

      // Adjust children ages array
      let newChildrenAges = [...childrenAges];
      if (increment) {
        // Add a new unselected age when adding a child
        newChildrenAges.push(UNSELECTED_AGE);
      } else if (newChildrenAges.length > newChildrenCount) {
        // Remove the last age when removing a child
        newChildrenAges = newChildrenAges.slice(0, newChildrenCount);
      }

      // Update local state
      setChildren(newChildrenCount);
      setChildrenAges(newChildrenAges);

      // Update parent formData with both children count and ages in a single call
      onFormChange({
        ...formData,
        children: newChildrenCount,
        childrenAges: newChildrenAges,
      });
    },
    [children, childrenAges, formData, onFormChange]
  );

  const updateChildAge = useCallback(
    (index: number, age: number) => {
      const newAges = [...childrenAges];
      // Ensure the array is long enough
      while (newAges.length <= index) {
        newAges.push(UNSELECTED_AGE);
      }
      newAges[index] = age;
      setChildrenAges(newAges);
      handleInputChange('childrenAges', newAges);
    },
    [childrenAges, handleInputChange]
  );

  const handleDateChange = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      if (value) {
        const date = new Date(value);
        const formattedDate = dateUtils.formatToMMDDYY(date);

        // Special validation for return date
        if (field === 'returnDate') {
          // Check if return date is valid (at least one day after departure)
          if (
            formData.departDate &&
            !dateUtils.isReturnDateValid(formData.departDate, formattedDate)
          ) {
            // Invalid return date - clear it and show user feedback
            console.warn('Return date must be at least one day after departure date');
            handleInputChange('returnDate', '');
            return;
          }
        }

        // If we're updating departure date and there's already a return date, validate it
        if (field === 'departDate' && formData.returnDate) {
          if (!dateUtils.isReturnDateValid(formattedDate, formData.returnDate)) {
            // Clear the return date if it becomes invalid
            onFormChange({
              ...formData,
              [field]: formattedDate,
              returnDate: '',
            });
            return;
          }
        }

        handleInputChange(field, formattedDate);
      }
    },
    [formData, handleInputChange, onFormChange]
  );

  const handleManualDateInput = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      // Remove all non-digits first
      let cleaned = value.replace(/\D/g, '');

      // Limit to 6 digits (MMDDYY)
      if (cleaned.length > 6) {
        cleaned = cleaned.substring(0, 6);
      }

      // Format as MM/DD/YY with proper validation
      let formatted = '';

      if (cleaned.length >= 1) {
        // Month part (01-12)
        let month = cleaned.substring(0, 2);
        if (cleaned.length >= 2) {
          let monthNum = parseInt(month);
          if (monthNum > 12) {
            month = '12';
          } else if (monthNum === 0 && month.length === 2) {
            month = '01';
          }
        }
        formatted = month;
      }

      if (cleaned.length >= 3) {
        // Day part (01-31)
        let day = cleaned.substring(2, 4);
        if (cleaned.length >= 4) {
          let dayNum = parseInt(day);
          if (dayNum > 31) {
            day = '31';
          } else if (dayNum === 0 && day.length === 2) {
            day = '01';
          }
        }
        formatted += '/' + day;
      }

      if (cleaned.length >= 5) {
        // Year part (last 2 digits)
        let year = cleaned.substring(4, 6);
        formatted += '/' + year;
      }

      // Validate the complete date if it's fully formatted
      if (formatted.length === 8) {
        // Special validation for return date
        if (field === 'returnDate') {
          if (formData.departDate && !dateUtils.isReturnDateValid(formData.departDate, formatted)) {
            // Invalid return date - don't update
            console.warn('Return date must be at least one day after departure date');
            return;
          }
        }

        // If we're updating departure date and there's already a return date, validate it
        if (field === 'departDate' && formData.returnDate) {
          if (!dateUtils.isReturnDateValid(formatted, formData.returnDate)) {
            // Clear the return date if it becomes invalid
            onFormChange({
              ...formData,
              [field]: formatted,
              returnDate: '',
            });
            return;
          }
        }
      }

      handleInputChange(field, formatted);
    },
    [formData, handleInputChange, onFormChange]
  );

  const handleFlexibleDatesChange = useCallback(
    (checked: boolean) => {
      try {
        // Update local state immediately for responsive UI
        setLocalFlexibleDates(checked);

        // Create updated form data
        const updatedFormData: FormData = { ...formData };
        updatedFormData.flexibleDates = checked;

        if (checked) {
          // Clear only return date when enabling flexible dates
          updatedFormData.returnDate = '';
        } else {
          // Clear planned days when disabling flexible dates
          delete updatedFormData.plannedDays;
        }

        // Update parent with all changes at once
        onFormChange(updatedFormData);
      } catch (error) {
        console.error('Error toggling flexible dates:', error);
        // Reset local state on error
        setLocalFlexibleDates(!checked);
      }
    },
    [formData, onFormChange]
  );

  const handleBudgetModeChange = useCallback((checked: boolean) => {
    setBudgetMode(checked ? 'per-person' : 'total');
  }, []);

  // Computed values
  const getCurrencySymbol = useCallback(() => {
    return currencySymbols[formData.currency || 'USD'];
  }, [formData.currency]);

  const totalTravelers = adults + children;
  const totalDays = dateUtils.calculateDaysBetween(formData.departDate, formData.returnDate);
  const isFlexibleDatesEnabled = localFlexibleDates;

  const getBudgetDisplay = useCallback(() => {
    const symbol = getCurrencySymbol();

    if (budgetRange >= MAX_BUDGET) {
      return `${symbol}10,000+`;
    }

    return `${symbol}${budgetRange.toLocaleString()}`;
  }, [budgetRange, getCurrencySymbol]);

  const getMinReturnDate = useCallback(() => {
    if (formData.departDate) {
      const departDate = dateUtils.parseMMDDYY(formData.departDate);
      if (departDate) {
        departDate.setDate(departDate.getDate() + 1); // Minimum 1 day trip
        return departDate.toISOString().split('T')[0];
      }
    }
    return dateUtils.getTodayString();
  }, [formData.departDate]);

  // Validation state
  const hasUnselectedChildrenAges =
    children > 0 &&
    (childrenAges.length !== children ||
      childrenAges.some((age) => age === UNSELECTED_AGE || age === undefined));

  return (
    <div className="space-y-6">
      {/* Location Box */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
          LOCATION(S)
        </h3>
        <input
          type="text"
          placeholder='Example: "New York", "Thailand", "Spain and Portugal"'
          value={formData.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white placeholder-gray-500 font-bold font-raleway text-base"
          aria-label="Trip location"
        />
      </div>

      {/* Dates and Travelers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dates Box */}
        <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
          <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
            DATES
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-primary mb-2 font-bold font-raleway text-base">
                {isFlexibleDatesEnabled ? 'Trip Start (flexible)' : 'Depart'}
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    !isFlexibleDatesEnabled && departDateRef.current?.showPicker();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors z-10 hover:bg-gray-100 cursor-pointer text-primary"
                  aria-label="Open departure date picker"
                  disabled={isFlexibleDatesEnabled}
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-primary mb-2 font-bold font-raleway text-base">
                {isFlexibleDatesEnabled ? 'Duration' : 'Return'}
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    !isFlexibleDatesEnabled && returnDateRef.current?.showPicker();
                  }}
                  disabled={isFlexibleDatesEnabled}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors z-10 ${
                    isFlexibleDatesEnabled
                      ? 'cursor-not-allowed text-gray-400'
                      : 'hover:bg-gray-100 cursor-pointer text-primary'
                  }`}
                  aria-label="Open return date picker"
                  aria-disabled={isFlexibleDatesEnabled}
                >
                  <Calendar className="h-5 w-5" />
                </button>
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
                  onChange={(e) =>
                    handleInputChange(
                      'plannedDays',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 pr-10 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-base appearance-none"
                  aria-label="Number of planned days"
                >
                  <option value="" className="font-bold font-raleway">
                    Select number of days
                  </option>
                  {Array.from({ length: MAX_PLANNED_DAYS }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day} className="font-bold font-raleway">
                      {day} {day === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Travelers Box */}
        <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
          <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
            TRAVELERS
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold font-raleway text-base">Adults</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => adjustAdults(false)}
                  disabled={adults <= MIN_ADULTS}
                  className="w-8 h-8 rounded-full border-3 border-primary bg-white hover:bg-primary/10 text-primary flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease adults"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center text-primary font-raleway">
                  {adults}
                </span>
                <button
                  onClick={() => adjustAdults(true)}
                  className="w-8 h-8 rounded-full border-3 border-primary bg-white hover:bg-primary/10 text-primary flex items-center justify-center transition-all duration-200"
                  aria-label="Increase adults"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-primary font-bold font-raleway text-base">Children</span>
                <div className="text-sm text-primary/70 font-bold font-raleway">Ages 0-17</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => adjustChildren(false)}
                  disabled={children <= MIN_CHILDREN}
                  className="w-8 h-8 rounded-full border-3 border-primary bg-white hover:bg-primary/10 text-primary flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease children"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center text-primary font-raleway">
                  {children}
                </span>
                <button
                  onClick={() => adjustChildren(true)}
                  className="w-8 h-8 rounded-full border-3 border-primary bg-white hover:bg-primary/10 text-primary flex items-center justify-center transition-all duration-200"
                  aria-label="Increase children"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

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
                  <span className="text-primary font-bold font-raleway text-lg">
                    Child {index + 1}
                  </span>
                  <div className="relative">
                    <select
                      value={
                        childrenAges[index] === UNSELECTED_AGE || childrenAges[index] === undefined
                          ? ''
                          : childrenAges[index]
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          updateChildAge(index, UNSELECTED_AGE);
                        } else {
                          updateChildAge(index, parseInt(value));
                        }
                      }}
                      className={`px-3 py-2 pr-8 border-3 rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-[#ece8de] text-primary font-bold font-raleway text-base appearance-none min-w-[140px] ${
                        childrenAges[index] === UNSELECTED_AGE || childrenAges[index] === undefined
                          ? 'border-red-400 text-gray-500'
                          : 'border-primary'
                      }`}
                      aria-label={`Age for child ${index + 1}`}
                      aria-invalid={
                        childrenAges[index] === UNSELECTED_AGE || childrenAges[index] === undefined
                      }
                    >
                      <option value="" className="font-bold font-raleway text-base">
                        Select age
                      </option>
                      <option value={0} className="font-bold font-raleway text-base">
                        Under 1
                      </option>
                      {Array.from({ length: MAX_CHILD_AGE }, (_, age) => age + 1).map((age) => (
                        <option key={age} value={age} className="font-bold font-raleway text-base">
                          {age} {age === 1 ? 'year' : 'years'} old
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
                  </div>
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
      </div>

      {/* Budget Box */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
            BUDGET
          </h3>
        </div>

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

          {/* Budget labels */}
          <div
            className="flex justify-between text-base font-bold font-raleway px-3"
            style={{ color: '#406170' }}
          >
            <span>{getCurrencySymbol()}0</span>
            <span>{getCurrencySymbol()}10,000+</span>
          </div>
        </div>

        {/* Currency and Budget Mode Row */}
        <div className="flex items-center justify-between gap-6 mt-6">
          {/* Currency Dropdown */}
          <div className="flex items-center space-x-2">
            <select
              value={formData.currency || 'USD'}
              onChange={(e) => handleInputChange('currency', e.target.value as Currency)}
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

          {/* Budget Flexibility Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-primary font-bold font-raleway text-sm">Budget flexibility</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.flexibleBudget || false}
                onChange={(e) => handleInputChange('flexibleBudget', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle budget flexibility"
              />
              <div
                className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 ${
                  formData.flexibleBudget
                    ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                    : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
                }`}
              ></div>
            </label>
          </div>
        </div>
      </div>

      {/* Travel Style Progressive Disclosure */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200 mt-6">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
          TRAVEL STYLE
        </h3>
        <p className="text-primary font-raleway text-base mb-6">
          Help us personalize your trip by telling us about your travel preferences
        </p>

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => {
              // Show travel style questions logic can be added here
              console.log('Answer style questions selected');
            }}
            className="bg-primary text-white px-8 py-4 rounded-[10px] font-bold font-raleway text-base hover:bg-primary/90 transition-colors duration-200 min-w-[200px]"
          >
            Answer style questions
          </button>

          <button
            type="button"
            onClick={() => {
              // Skip to trip details logic can be added here
              console.log('Skip to trip details selected');
            }}
            className="bg-[#ece8de] text-primary border-2 border-primary px-8 py-4 rounded-[10px] font-bold font-raleway text-base hover:bg-primary hover:text-white transition-colors duration-200 min-w-[200px]"
          >
            Skip to trip details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsForm;
