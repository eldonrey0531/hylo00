# Code Patterns - Hylo Travel AI Platform

This document contains code patterns and snippets collected from the Hylo Travel AI Platform codebase, organized by category for reference and reuse.

## Form Patterns

### Form Validation

```typescript
// From TripDetailsForm.tsx - Form validation with error handling
const validateForm = (formData: TravelFormData): ValidationResult => {
  const errors: string[] = [];

  if (!formData.location?.trim()) {
    errors.push('Location is required');
  }

  if (!formData.departDate) {
    errors.push('Departure date is required');
  }

  if (!formData.flexibleDates && !formData.returnDate) {
    errors.push('Return date is required when dates are not flexible');
  }

  if (formData.flexibleDates && !formData.plannedDays) {
    errors.push('Number of planned days is required when dates are flexible');
  }

  if ((formData.adults || 0) + (formData.children || 0) < 1) {
    errors.push('At least one traveler is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### React Hook Form Integration

```typescript
// From TripDetailsForm.tsx - Form state management with parent callbacks
const TripDetailsForm: React.FC<TripDetailsFormProps> = ({
  formData,
  onFormChange,
  onValidationChange,
}) => {
  // Local state for form sections
  const [adults, setAdults] = useState(formData.adults || 2);
  const [children, setChildren] = useState(formData.children || 0);
  const [isFlexibleDatesEnabled, setIsFlexibleDatesEnabled] = useState(
    Boolean(formData.flexibleDates)
  );

  // Handle input changes and notify parent
  const handleInputChange = useCallback(
    (field: keyof TravelFormData, value: any) => {
      const updatedData = { ...formData, [field]: value };
      onFormChange(updatedData);
    },
    [formData, onFormChange]
  );
};
```

### Zod Schema Validation

```typescript
// From formSchemas.ts - Zod schema definitions
export const tripDetailsSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  departDate: z.string().optional(),
  returnDate: z.string().optional(),
  flexibleDates: z.boolean().optional(),
  plannedDays: z.number().min(1).max(30).optional(),
  adults: z.number().min(1).max(20),
  children: z.number().min(0).max(10),
  childrenAges: z.array(z.number()).optional(),
  budget: z.number().min(0).max(100000),
  flexibleBudget: z.boolean().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
});

// From travelStyleSchemas.ts - Travel style validation
export const travelStyleSchema = z.object({
  travelGroup: z.array(z.string()),
  interests: z.array(z.string()),
  experience: z.string().optional(),
  vibe: z.array(z.string()),
  sampleDays: z.array(z.string()),
  dinnerChoice: z.array(z.string()),
  nickname: z.string().optional(),
  contact: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
});
```

## Component Patterns

### Component Separation

```typescript
// From TripDetailsForm.tsx - Large form component structure
const TripDetailsForm: React.FC<TripDetailsFormProps> = ({
  formData,
  onFormChange,
  onValidationChange,
}) => {
  // Component logic here
  return (
    <div className="space-y-6">
      {/* Location Section */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        {/* Location form fields */}
      </div>

      {/* Dates Section */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        {/* Date form fields */}
      </div>

      {/* Travelers Section */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        {/* Travelers form fields */}
      </div>

      {/* Budget Section */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        {/* Budget form fields */}
      </div>
    </div>
  );
};
```

### Shared Types

```typescript
// From types/index.ts - Shared type definitions
export interface TravelFormData {
  location?: string;
  departDate?: string;
  returnDate?: string;
  flexibleDates?: boolean;
  plannedDays?: number;
  adults?: number;
  children?: number;
  childrenAges?: number[];
  budget?: number;
  flexibleBudget?: boolean;
  currency?: Currency;
  // Travel style data
  travelGroup?: string[];
  interests?: string[];
  experience?: string;
  vibe?: string[];
  sampleDays?: string[];
  dinnerChoice?: string[];
  nickname?: string;
  contact?: ContactInfo;
}

export interface ContactInfo {
  name: string;
  email: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
```

### Form State Management

```typescript
// From TripDetailsForm.tsx - State management with parent callbacks
const TripDetailsForm: React.FC<TripDetailsFormProps> = ({
  formData,
  onFormChange,
  onValidationChange,
}) => {
  // Local state management
  const [localState, setLocalState] = useState(initialState);

  // Callback to parent for state updates
  const handleInputChange = useCallback(
    (field: keyof TravelFormData, value: any) => {
      const updatedData = { ...formData, [field]: value };
      onFormChange(updatedData);
    },
    [formData, onFormChange]
  );

  // Effect to sync with parent state
  useEffect(() => {
    setLocalState(formData.someField || defaultValue);
  }, [formData.someField]);

  return (
    <input
      value={localState}
      onChange={(e) => {
        setLocalState(e.target.value);
        handleInputChange('someField', e.target.value);
      }}
    />
  );
};
```

## Date Patterns

### Date Picker Component

```typescript
// From EnhancedDatePicker.tsx - Custom date picker with overlay
export function EnhancedDatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  className = '',
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDisplayDate = (dateString: string | undefined): string => {
    if (!dateString) return placeholder;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return placeholder;
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        readOnly
        value={formatDisplayDate(value)}
        onClick={handleInputClick}
        className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white placeholder-gray-500 font-bold font-raleway text-base cursor-pointer"
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />

      {/* Native date picker overlay */}
      {isOpen && (
        <input
          type="date"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(false);
          }}
          onBlur={() => setIsOpen(false)}
          autoFocus
        />
      )}
    </div>
  );
}
```

### Date Utils

```typescript
// From TripDetailsForm.tsx - Date utility functions
const dateUtils = {
  parseMMDDYY: (input: string): Date | null => {
    const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (!match) return null;

    const [, month, day, year] = match;
    const fullYear =
      year.length === 2 ? (parseInt(year) > 50 ? 1900 : 2000) + parseInt(year) : parseInt(year);

    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    return date;
  },

  formatToMMDDYY: (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  },

  convertToInputFormat: (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
};
```

### Date Validation

```typescript
// From TripDetailsForm.tsx - Date validation functions
const validateDateInput = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const validateFutureDate = (dateString: string): boolean => {
  if (!validateDateInput(dateString)) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

const validateReturnDate = (departDate: string, returnDate: string): boolean => {
  if (!validateDateInput(departDate) || !validateDateInput(returnDate)) return false;
  const depart = new Date(departDate);
  const returnD = new Date(returnDate);
  return returnD > depart;
};

// From date-input-schema.ts - Zod date validation
export const dateInputSchema = z
  .string()
  .refine((val) => validateDateInput(val), {
    message: 'Please enter a valid date',
  })
  .refine((val) => validateFutureDate(val), {
    message: 'Date must be in the future',
  });

export const dateRangeSchema = z
  .object({
    departDate: dateInputSchema,
    returnDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.returnDate && !validateReturnDate(data.departDate, data.returnDate)) {
        return false;
      }
      return true;
    },
    {
      message: 'Return date must be after departure date',
      path: ['returnDate'],
    }
  );
```

## UI Components

### Slider Component

```typescript
// From TripDetailsForm.tsx - Budget slider implementation
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
  <div className="flex justify-between text-base font-bold font-raleway px-3" style={{ color: '#406170' }}>
    <span>{getCurrencySymbol()}0</span>
    <span>{getCurrencySymbol()}10,000+</span>
  </div>
</div>

// From index.css - Slider styling
.slider-primary {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.slider-primary:hover {
  opacity: 1;
}

.slider-primary::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

### Toggle Switch

```typescript
// From TripDetailsForm.tsx - Flexible dates toggle
<div className="flex items-center mt-4">
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={isFlexibleDatesEnabled}
      onChange={(e) => handleFlexibleDatesChange(e.target.checked)}
      className="sr-only peer"
    />
    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
      isFlexibleDatesEnabled
        ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
        : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
    }`}></div>
    <span className="text-primary font-bold font-raleway text-sm">
      I'm not sure or my dates are flexible
    </span>
  </label>
</div>

// From TripDetailsForm.tsx - Flexible budget toggle
<div className="flex items-center mb-6">
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={formData.flexibleBudget || false}
      onChange={(e) => handleInputChange('flexibleBudget', e.target.checked)}
      className="sr-only peer"
      aria-label="Toggle budget flexibility"
    />
    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
      formData.flexibleBudget
        ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
        : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
    }`}></div>
    <span className="text-primary font-bold font-raleway text-sm">
      I'm not sure or my budget is flexible
    </span>
  </label>
</div>
```

### Counter Component

```typescript
// From TripDetailsForm.tsx - Adults/Children counter implementation
<div className="space-y-4">
  {/* Adults Counter */}
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
      <span className="text-xl font-bold w-8 text-center text-primary font-raleway">{adults}</span>
      <button
        onClick={() => adjustAdults(true)}
        className="w-8 h-8 rounded-full border-3 border-primary bg-white hover:bg-primary/10 text-primary flex items-center justify-center transition-all duration-200"
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
</div>;

// Counter adjustment functions
const adjustAdults = (increment: boolean) => {
  const newValue = increment ? adults + 1 : Math.max(MIN_ADULTS, adults - 1);
  setAdults(newValue);
  handleInputChange('adults', newValue);
};

const adjustChildren = (increment: boolean) => {
  const newValue = increment ? children + 1 : Math.max(MIN_CHILDREN, children - 1);
  setChildren(newValue);
  handleInputChange('children', newValue);
};
```

## Additional Resources

### Budget Slider Schema

```typescript
// From budget-slider-schema.ts - Comprehensive slider validation
export const BudgetSliderStateSchema = z.object({
  value: BudgetValueSchema,
  displayValue: z.string(),
  currency: CurrencySchema,
  min: z.number().min(0),
  max: z.number().min(1),
  step: z.number().min(1),
  isDragging: z.boolean(),
  isHovered: z.boolean(),
  isFlexible: z.boolean(),
  flexibleLabel: z.string(),
  lastUpdateTime: z.number(),
  updatePending: z.boolean(),
});

export const BudgetSliderPropsSchema = z.object({
  value: BudgetValueSchema,
  onChange: z.function().args(z.number()).returns(z.void()),
  min: z.number().min(0).optional(),
  max: z.number().min(1).optional(),
  step: z.number().min(1).optional(),
  currency: CurrencySchema.optional(),
  enableRealTimeSync: z.boolean().optional(),
  showFlexibleToggle: z.boolean().optional(),
  flexibleMode: z.boolean().optional(),
  showCurrencySelector: z.boolean().optional(),
  showBudgetModeToggle: z.boolean().optional(),
  budgetMode: BudgetModeSchema.optional(),
  debounceMs: z.number().min(0).max(1000).optional(),
  enablePerformanceMonitoring: z.boolean().optional(),
  className: z.string().optional(),
  sliderClassName: z.string().optional(),
  displayClassName: z.string().optional(),
});
```

### Component Architecture Patterns

```typescript
// From implementation_plan.md - Component separation example
// src/components/TripDetails/
// ├── index.tsx                 # Parent component
// ├── LocationForm.tsx           # Location input component
// ├── DatesForm.tsx             # Dates selection component
// ├── TravelersForm.tsx         # Travelers configuration component
// ├── BudgetForm.tsx            # Budget settings component
// ├── types.ts                  # Shared types
// └── utils.ts                  # Shared utilities (dateUtils, etc.)
```

This collection represents the key patterns and implementations found in the Hylo Travel AI Platform codebase. These patterns follow the platform's constitutional requirements for Edge Runtime compatibility, type safety, and rapid development practices.
