import React, { useRef, useEffect, useCallback, useReducer, useMemo, useState, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Minus, Calendar, ChevronDown } from 'lucide-react';

// Enhanced Zod schema for form validation
const tripDetailsSchema = z.object({
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location too long'),
  departDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().optional(),
  flexibleDates: z.boolean(),
  plannedDays: z.number().min(1).max(31).optional(),
  adults: z.number().min(1, 'At least 1 adult required').max(10, 'Maximum 10 adults'),
  children: z.number().min(0).max(10, 'Maximum 10 children'),
  childrenAges: z.array(z.number().min(0).max(17)).optional(),
  budget: z.number().min(0).max(50000),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  flexibleBudget: z.boolean().optional(),
  accommodationOther: z.string().optional(),
  rentalCarPreferences: z.array(z.string()).optional(),
  travelStyleChoice: z.enum(['answer-questions', 'skip-to-details', 'not-selected']).optional(),
  travelStyleAnswers: z.record(z.any()).optional(),
});

// Type inference from Zod schema
type TripDetailsFormData = z.infer<typeof tripDetailsSchema>;

// Legacy types for compatibility
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

// Action types for reducer
type BudgetAction =
  | { type: 'SET_FLEXIBLE'; payload: boolean }
  | { type: 'SET_BUDGET'; payload: number }
  | { type: 'SET_BUDGET_MODE'; payload: 'total' | 'per-person' }
  | { type: 'RESET_BUDGET' };

// Budget reducer for complex state management
const budgetReducer = (
  state: { isFlexible: boolean; budget: number; mode: 'total' | 'per-person' },
  action: BudgetAction
) => {
  switch (action.type) {
    case 'SET_FLEXIBLE':
      return {
        ...state,
        isFlexible: action.payload,
        budget: action.payload ? 0 : Math.max(state.budget, 5000),
      };
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'SET_BUDGET_MODE':
      return { ...state, mode: action.payload };
    case 'RESET_BUDGET':
      return { isFlexible: false, budget: 5000, mode: 'total' as const };
    default:
      return state;
  }
};

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

    const [month, day, year] = parts;
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    let yearNum = parseInt(year, 10);

    // Handle two-digit years
    if (yearNum <= YEAR_THRESHOLD) {
      yearNum += YEAR_BASE_2000;
    } else if (yearNum < 100) {
      yearNum += YEAR_BASE_1900;
    }

    // Validate date components
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return null;
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);

    // Check if the date is valid (handles edge cases like Feb 30)
    if (date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
      return null;
    }

    return date;
  },

  convertToInputFormat: (dateStr: string): string => {
    const date = dateUtils.parseMMDDYY(dateStr);
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  },

  getTodayString: (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

const TripDetailsForm: React.FC<TripDetailsFormProps> = memo(({ formData, onFormChange }) => {
  // Initialize React Hook Form with Zod resolver
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<TripDetailsFormData>({
    resolver: zodResolver(tripDetailsSchema),
    defaultValues: {
      location: formData.location || '',
      departDate: formData.departDate || '',
      returnDate: formData.returnDate || '',
      flexibleDates: formData.flexibleDates || false,
      plannedDays: formData.plannedDays || undefined,
      adults: formData.adults || 2,
      children: formData.children || 0,
      childrenAges: formData.childrenAges || [],
      budget: formData.budget || 5000,
      currency: formData.currency || 'USD',
      flexibleBudget: formData.flexibleBudget || false,
      accommodationOther: formData.accommodationOther || '',
      rentalCarPreferences: formData.rentalCarPreferences || [],
      travelStyleChoice: formData.travelStyleChoice || 'not-selected',
      travelStyleAnswers: formData.travelStyleAnswers || {},
    },
    mode: 'onChange', // Real-time validation
  });

  // Enhanced reducer for budget state
  const [budgetState, dispatchBudget] = useReducer(budgetReducer, {
    isFlexible: Boolean(formData.flexibleBudget),
    budget: formData.budget || 5000,
    mode: 'total' as const,
  });

  // Watch form values for reactive updates
  const watchedValues = watch();
  const watchedFlexibleDates = watch('flexibleDates');
  const watchedFlexibleBudget = watch('flexibleBudget');

  // Refs for calendar inputs
  const departDateRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);

  // Memoized budget display calculation
  const budgetDisplay = useMemo(() => {
    const symbol = currencySymbols[watchedValues.currency || 'USD'];
    const budget = watchedValues.budget || 0;

    if (budget >= MAX_BUDGET) {
      return `${symbol}10,000+`;
    }
    return `${symbol}${budget.toLocaleString()}`;
  }, [watchedValues.currency, watchedValues.budget]);

  // Sync with parent form data when form changes
  useEffect(() => {
    if (isDirty) {
      onFormChange(watchedValues as FormData);
    }
  }, [watchedValues, isDirty, onFormChange]);

  // Update React Hook Form when parent data changes
  useEffect(() => {
    reset({
      location: formData.location || '',
      departDate: formData.departDate || '',
      returnDate: formData.returnDate || '',
      flexibleDates: formData.flexibleDates || false,
      plannedDays: formData.plannedDays || undefined,
      adults: formData.adults || 2,
      children: formData.children || 0,
      childrenAges: formData.childrenAges || [],
      budget: formData.budget || 5000,
      currency: formData.currency || 'USD',
      flexibleBudget: formData.flexibleBudget || false,
      accommodationOther: formData.accommodationOther || '',
      rentalCarPreferences: formData.rentalCarPreferences || [],
      travelStyleChoice: formData.travelStyleChoice || 'not-selected',
      travelStyleAnswers: formData.travelStyleAnswers || {},
    });
  }, [formData, reset]);

  // Enhanced handlers with React Hook Form
  const handleBudgetChange = useCallback(
    (value: number) => {
      setValue('budget', value, { shouldValidate: true, shouldDirty: true });
      dispatchBudget({ type: 'SET_BUDGET', payload: value });
    },
    [setValue, dispatchBudget]
  );

  const handleFlexibleBudgetToggle = useCallback(
    (checked: boolean) => {
      setValue('flexibleBudget', checked, { shouldValidate: true, shouldDirty: true });
      dispatchBudget({ type: 'SET_FLEXIBLE', payload: checked });
    },
    [setValue, dispatchBudget]
  );

  const handleBudgetModeChange = useCallback(
    (checked: boolean) => {
      const mode = checked ? 'per-person' : 'total';
      dispatchBudget({ type: 'SET_BUDGET_MODE', payload: mode });
    },
    [dispatchBudget]
  );

  const adjustAdults = useCallback(
    (increment: boolean) => {
      const currentAdults = watchedValues.adults || 2;
      const newValue = increment ? currentAdults + 1 : Math.max(MIN_ADULTS, currentAdults - 1);
      setValue('adults', newValue, { shouldValidate: true, shouldDirty: true });
    },
    [watchedValues.adults, setValue]
  );

  const adjustChildren = useCallback(
    (increment: boolean) => {
      const currentChildren = watchedValues.children || 0;
      const newChildrenCount = increment
        ? currentChildren + 1
        : Math.max(MIN_CHILDREN, currentChildren - 1);

      // Adjust children ages array
      const currentAges = watchedValues.childrenAges || [];
      let newChildrenAges = [...currentAges];
      if (increment) {
        // Add a new unselected age when adding a child
        newChildrenAges.push(UNSELECTED_AGE);
      } else if (newChildrenAges.length > newChildrenCount) {
        // Remove the last age when removing a child
        newChildrenAges = newChildrenAges.slice(0, newChildrenCount);
      }

      setValue('children', newChildrenCount, { shouldValidate: true, shouldDirty: true });
      setValue('childrenAges', newChildrenAges, { shouldValidate: true, shouldDirty: true });
    },
    [watchedValues.children, watchedValues.childrenAges, setValue]
  );

  const updateChildAge = useCallback(
    (index: number, age: number) => {
      const currentAges = watchedValues.childrenAges || [];
      const newAges = [...currentAges];
      // Ensure the array is long enough
      while (newAges.length <= index) {
        newAges.push(UNSELECTED_AGE);
      }
      newAges[index] = age;
      setValue('childrenAges', newAges, { shouldValidate: true, shouldDirty: true });
    },
    [watchedValues.childrenAges, setValue]
  );

  const handleDateChange = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      setValue(field, value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  const handleFlexibleDatesChange = useCallback(
    (checked: boolean) => {
      setValue('flexibleDates', checked, { shouldValidate: true, shouldDirty: true });
      if (checked) {
        // Clear return date when enabling flexible dates
        setValue('returnDate', '', { shouldValidate: true, shouldDirty: true });
      } else {
        // Clear planned days when disabling flexible dates
        setValue('plannedDays', undefined, { shouldValidate: true, shouldDirty: true });
      }
    },
    [setValue]
  );

  const handleManualDateInput = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      setValue(field, value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  // Form submission handler
  const onSubmit = useCallback(
    (data: TripDetailsFormData) => {
      console.log('Enhanced form submitted with data:', data);
      onFormChange(data as FormData);
    },
    [onFormChange]
  );

  // Computed values
  const getCurrencySymbol = useCallback(() => {
    return currencySymbols[watchedValues.currency || 'USD'];
  }, [watchedValues.currency]);

  const totalTravelers = (watchedValues.adults || 0) + (watchedValues.children || 0);
  const totalDays = dateUtils.calculateDaysBetween(
    watchedValues.departDate || '',
    watchedValues.returnDate || ''
  );
  const isFlexibleDatesEnabled = watchedFlexibleDates;
  const isFlexibleBudgetEnabled = watchedFlexibleBudget;

  const getBudgetDisplay = useCallback(() => {
    const symbol = getCurrencySymbol();
    const budget = watchedValues.budget || 0;

    if (budget >= MAX_BUDGET) {
      return `${symbol}10,000+`;
    }

    return `${symbol}${budget.toLocaleString()}`;
  }, [watchedValues.budget, getCurrencySymbol]);

  const getMinReturnDate = useCallback(() => {
    if (watchedValues.departDate) {
      const departDate = dateUtils.parseMMDDYY(watchedValues.departDate);
      if (departDate) {
        departDate.setDate(departDate.getDate() + 1); // Minimum 1 day trip
        return departDate.toISOString().split('T')[0];
      }
    }
    return dateUtils.getTodayString();
  }, [watchedValues.departDate]);

  const hasUnselectedChildrenAges = (watchedValues.childrenAges || []).some(
    (age) => age === UNSELECTED_AGE
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Location Box */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
          LOCATION(S)
        </h3>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <div>
              <input
                {...field}
                type="text"
                placeholder='Example: "New York", "Thailand", "Spain and Portugal"'
                onFocus={(e) => e.target.select()}
                className={`w-full px-4 py-3 border-3 rounded-[10px] focus:ring-2 focus:ring-primary transition-all duration-200 text-primary bg-white placeholder-gray-500 font-bold font-raleway text-base ${
                  errors.location
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-primary focus:border-primary'
                }`}
                aria-label="Trip location"
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? 'location-error' : undefined}
              />
              {errors.location && (
                <p id="location-error" className="text-red-500 text-sm mt-2 font-raleway">
                  {errors.location.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Enhanced Dates Box */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
            DATES
          </h3>
        </div>

        {/* Only show date controls when flexible dates is disabled */}
        {!watchedFlexibleDates && (
          <>
            {/* Departure Date */}
            <div className="mb-6">
              <label className="block text-primary font-bold font-raleway text-base mb-2">
                Departure Date
              </label>
              <Controller
                name="departDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    min={dateUtils.getTodayString()}
                    className={`w-full px-4 py-3 border-3 rounded-[10px] focus:ring-2 focus:ring-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-base ${
                      errors.departDate
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-primary focus:border-primary'
                    }`}
                    aria-label="Departure date"
                    aria-invalid={!!errors.departDate}
                    aria-describedby={errors.departDate ? 'depart-date-error' : undefined}
                  />
                )}
              />
              {errors.departDate && (
                <p id="depart-date-error" className="text-red-500 text-sm mt-2 font-raleway">
                  {errors.departDate.message}
                </p>
              )}
            </div>

            {/* Return Date */}
            <div className="mb-6">
              <label className="block text-primary font-bold font-raleway text-base mb-2">
                Return Date (Optional)
              </label>
              <Controller
                name="returnDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    min={getMinReturnDate()}
                    className={`w-full px-4 py-3 border-3 rounded-[10px] focus:ring-2 focus:ring-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-base ${
                      errors.returnDate
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-primary focus:border-primary'
                    }`}
                    aria-label="Return date"
                    aria-invalid={!!errors.returnDate}
                    aria-describedby={errors.returnDate ? 'return-date-error' : undefined}
                  />
                )}
              />
              {errors.returnDate && (
                <p id="return-date-error" className="text-red-500 text-sm mt-2 font-raleway">
                  {errors.returnDate.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Flexible Dates Toggle */}
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <Controller
              name="flexibleDates"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle flexible dates"
                />
              )}
            />
            <div
              className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
                watchedFlexibleDates
                  ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                  : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
              }`}
            ></div>
            <span className="text-primary font-bold font-raleway text-sm">
              I'm flexible with dates
            </span>
          </label>
        </div>
      </div>

      {/* Enhanced Budget Box with React Hook Form */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
            BUDGET
          </h3>
        </div>

        {/* Only show budget controls when flexible budget is disabled */}
        {!isFlexibleBudgetEnabled && (
          <>
            {/* Budget Display */}
            <div className="text-center mb-6">
              <div className="bg-primary text-white px-6 py-3 rounded-[10px] font-bold text-2xl inline-block font-raleway">
                {getBudgetDisplay()}
              </div>
            </div>

            {/* Budget Slider with Controller */}
            <div className="space-y-4">
              <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max={MAX_BUDGET}
                      step={BUDGET_STEP}
                      value={field.value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(value);
                        handleBudgetChange(value);
                      }}
                      onInput={(e) => {
                        const value = parseInt((e.target as HTMLInputElement).value);
                        field.onChange(value);
                        handleBudgetChange(value);
                      }}
                      className="w-full slider-primary"
                      aria-label="Budget range"
                      aria-valuemin={0}
                      aria-valuemax={MAX_BUDGET}
                      aria-valuenow={field.value}
                    />
                  </div>
                )}
              />

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
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
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
                  )}
                />
              </div>

              {/* Budget Mode Switch */}
              <div className="flex items-center space-x-4">
                <span className="text-primary font-bold font-raleway text-sm">
                  Total trip budget
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetState.mode === 'per-person'}
                    onChange={(e) => handleBudgetModeChange(e.target.checked)}
                    className="sr-only peer"
                    aria-label="Toggle budget mode"
                  />
                  <div
                    className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 ${
                      budgetState.mode === 'per-person'
                        ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                        : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
                    }`}
                  ></div>
                </label>
                <span className="text-primary font-bold font-raleway text-sm">
                  Per-person budget
                </span>
              </div>
            </div>
          </>
        )}

        {/* Flexible Budget Toggle - Always visible */}
        <div
          className={`flex items-center ${
            !isFlexibleBudgetEnabled ? 'mt-6 pt-4 border-t border-gray-200' : ''
          }`}
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <Controller
              name="flexibleBudget"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => {
                    field.onChange(e.target.checked);
                    handleFlexibleBudgetToggle(e.target.checked);
                  }}
                  className="sr-only peer"
                  aria-label="Toggle budget flexibility"
                />
              )}
            />
            <div
              className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
                isFlexibleBudgetEnabled
                  ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                  : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
              }`}
            ></div>
            <span className="text-primary font-bold font-raleway text-sm">
              I'm not sure or my budget is flexible
            </span>
          </label>
        </div>
      </div>

      {/* Enhanced Travelers Box */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
            TRAVELERS
          </h3>
        </div>

        {/* Adults Section */}
        <div className="mb-6">
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            Adults (18+ years)
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => adjustAdults(false)}
              disabled={(watchedValues.adults || 2) <= MIN_ADULTS}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
              aria-label="Decrease number of adults"
            >
              <Minus className="w-5 h-5" />
            </button>

            <Controller
              name="adults"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min={MIN_ADULTS}
                  max={10}
                  value={field.value || 2}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || MIN_ADULTS;
                    field.onChange(Math.max(MIN_ADULTS, Math.min(10, value)));
                  }}
                  className="w-20 text-center px-3 py-2 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-lg"
                  aria-label="Number of adults"
                  aria-invalid={!!errors.adults}
                  aria-describedby={errors.adults ? 'adults-error' : undefined}
                />
              )}
            />

            <button
              type="button"
              onClick={() => adjustAdults(true)}
              disabled={(watchedValues.adults || 2) >= 10}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
              aria-label="Increase number of adults"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {errors.adults && (
            <p id="adults-error" className="text-red-500 text-sm mt-2 font-raleway">
              {errors.adults.message}
            </p>
          )}
        </div>

        {/* Children Section */}
        <div className="mb-6">
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            Children (0-17 years)
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => adjustChildren(false)}
              disabled={(watchedValues.children || 0) <= MIN_CHILDREN}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
              aria-label="Decrease number of children"
            >
              <Minus className="w-5 h-5" />
            </button>

            <Controller
              name="children"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min={MIN_CHILDREN}
                  max={10}
                  value={field.value || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || MIN_CHILDREN;
                    field.onChange(Math.max(MIN_CHILDREN, Math.min(10, value)));
                  }}
                  className="w-20 text-center px-3 py-2 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-lg"
                  aria-label="Number of children"
                  aria-invalid={!!errors.children}
                  aria-describedby={errors.children ? 'children-error' : undefined}
                />
              )}
            />

            <button
              type="button"
              onClick={() => adjustChildren(true)}
              disabled={(watchedValues.children || 0) >= 10}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
              aria-label="Increase number of children"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {errors.children && (
            <p id="children-error" className="text-red-500 text-sm mt-2 font-raleway">
              {errors.children.message}
            </p>
          )}
        </div>

        {/* Children Ages Section - Only show if there are children */}
        {(watchedValues.children || 0) > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <label className="block text-primary font-bold font-raleway text-base mb-3">
              Children's Ages
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: watchedValues.children || 0 }, (_, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-sm text-primary font-raleway font-bold mb-1">
                    Child {index + 1}
                  </label>
                  <Controller
                    name={`childrenAges.${index}`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value ?? UNSELECTED_AGE}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(value);
                          updateChildAge(index, value);
                        }}
                        className="px-3 py-2 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-sm"
                        aria-label={`Age of child ${index + 1}`}
                      >
                        <option value={UNSELECTED_AGE} disabled>
                          Select age
                        </option>
                        {Array.from({ length: 18 }, (_, age) => (
                          <option key={age} value={age} className="font-bold font-raleway text-sm">
                            {age} {age === 1 ? 'year' : 'years'} old
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              ))}
            </div>
            {hasUnselectedChildrenAges && (
              <p className="text-amber-600 text-sm mt-3 font-raleway">
                ⚠️ Please select ages for all children
              </p>
            )}
          </div>
        )}

        {/* Total Travelers Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-primary/10 rounded-[10px] p-4">
            <div className="text-center">
              <div className="text-primary font-bold font-raleway text-lg">
                Total Travelers: {(watchedValues.adults || 2) + (watchedValues.children || 0)}
              </div>
              <div className="text-primary font-raleway text-sm mt-1">
                {watchedValues.adults || 2} Adult{(watchedValues.adults || 2) !== 1 ? 's' : ''},{' '}
                {watchedValues.children || 0} Child
                {(watchedValues.children || 0) !== 1 ? 'ren' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[36px] p-6 mt-6">
          <h4 className="text-red-600 font-bold font-raleway text-lg mb-3">
            Please review the following:
          </h4>
          <ul className="space-y-2">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-red-600 font-raleway text-sm flex items-center">
                <span className="mr-2">•</span>
                {String(error?.message || `${field} is required`)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enhanced Form Status */}
      <div className="bg-green-50 border border-green-200 rounded-[36px] p-4 mt-6">
        <div className="flex items-center justify-between text-sm font-raleway">
          <span className="text-green-600">
            Form Status: {isValid ? '✅ Valid' : '⚠️ Has Validation Errors'}
          </span>
          <span className="text-green-600">Changes: {isDirty ? '📝 Modified' : '✨ Pristine'}</span>
        </div>
      </div>
    </form>
  );
});

export default TripDetailsForm;
