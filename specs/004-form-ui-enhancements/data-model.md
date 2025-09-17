# Data Model: Form UI Enhancements

**Date**: September 18, 2025  
**Context**: Production-grade data structures for enhanced form interactions

## Overview

This document defines the data models, interfaces, and state management structures required for implementing form UI enhancements while maintaining constitutional compliance and production-grade quality.

## Core Entities

### 1. Enhanced Date Input State

```typescript
interface DateInputState {
  // Core date values
  value: string; // MM/DD/YY format
  displayValue: string; // User-visible formatted value
  isValid: boolean; // Validation status

  // Interaction state
  isPickerOpen: boolean; // Calendar picker visibility
  clickZoneActive: boolean; // Enhanced click zone status
  hasFocus: boolean; // Input focus state

  // Validation feedback
  validationMessage?: string; // Error message if invalid
  validationLevel: 'none' | 'warning' | 'error';

  // Accessibility
  ariaLabel: string; // Screen reader label
  ariaDescribedBy?: string; // Associated help text ID
}

interface DateInputActions {
  setValue: (value: string) => void;
  openPicker: () => void;
  closePicker: () => void;
  setFocus: (focused: boolean) => void;
  validate: () => boolean;
  clearValue: () => void;
}

// State transitions
type DateInputEvent =
  | { type: 'VALUE_CHANGE'; payload: string }
  | { type: 'PICKER_OPEN' }
  | { type: 'PICKER_CLOSE' }
  | { type: 'FOCUS_CHANGE'; payload: boolean }
  | { type: 'VALIDATE' }
  | { type: 'CLEAR' };
```

### 2. Budget Slider State

```typescript
interface BudgetSliderState {
  // Core budget values
  value: number; // Current budget amount
  displayValue: string; // Formatted display (e.g., "$5,000")
  currency: Currency; // USD, EUR, GBP, CAD, AUD

  // Slider properties
  min: number; // Minimum budget (0)
  max: number; // Maximum budget (10000)
  step: number; // Increment step (250)

  // Interaction state
  isDragging: boolean; // User actively dragging
  isHovered: boolean; // Hover state for styling

  // Flexible budget mode
  isFlexible: boolean; // Flexible budget toggle state
  flexibleLabel: string; // "I'm not sure or my budget is flexible"

  // Synchronization
  lastUpdateTime: number; // Performance tracking
  updatePending: boolean; // Async update in progress
}

interface BudgetSliderActions {
  setValue: (value: number) => void;
  setDragging: (dragging: boolean) => void;
  setHovered: (hovered: boolean) => void;
  toggleFlexible: () => void;
  setCurrency: (currency: Currency) => void;
  formatDisplay: (value: number, currency: Currency) => string;
}

// Budget mode types
type BudgetMode = 'total' | 'per-person';
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

type BudgetSliderEvent =
  | { type: 'VALUE_UPDATE'; payload: number }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_END' }
  | { type: 'HOVER_CHANGE'; payload: boolean }
  | { type: 'TOGGLE_FLEXIBLE' }
  | { type: 'CURRENCY_CHANGE'; payload: Currency };
```

### 3. Preference Modal State

```typescript
interface PreferenceModalState {
  // Modal visibility and interaction
  isOpen: boolean; // Modal open/closed state
  inclusionType: InclusionType; // Which preference modal is active

  // Form interaction state
  canInteract: boolean; // Fix for non-responsive controls
  focusedElement?: string; // Currently focused form element

  // Form data
  formData: Record<string, any>; // Modal-specific form values
  validationErrors: Record<string, string>; // Field validation errors

  // Special cases
  showOtherInput: boolean; // "Other" text input visibility
  otherInputValue: string; // Content of "Other" text input

  // Multi-select support (for rental car preferences)
  multiSelectValues: string[]; // Selected vehicle types

  // Accessibility
  returnFocusTo?: HTMLElement; // Element to focus when modal closes
  trapFocus: boolean; // Focus trap activation
}

interface PreferenceModalActions {
  openModal: (type: InclusionType) => void;
  closeModal: () => void;
  updateFormData: (field: string, value: any) => void;
  toggleOtherInput: () => void;
  setOtherInputValue: (value: string) => void;
  addMultiSelectValue: (value: string) => void;
  removeMultiSelectValue: (value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

type InclusionType =
  | 'flights'
  | 'accommodations'
  | 'rental-car'
  | 'activities'
  | 'dining'
  | 'entertainment'
  | 'train-tickets'
  | 'travel-insurance';

type PreferenceModalEvent =
  | { type: 'OPEN_MODAL'; payload: InclusionType }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: any } }
  | { type: 'TOGGLE_OTHER' }
  | { type: 'SET_OTHER_VALUE'; payload: string }
  | { type: 'ADD_MULTI_SELECT'; payload: string }
  | { type: 'REMOVE_MULTI_SELECT'; payload: string }
  | { type: 'VALIDATE' }
  | { type: 'RESET' };
```

### 4. Travel Style Progressive Disclosure State

```typescript
interface TravelStyleState {
  // Progressive disclosure control
  showSelectionButtons: boolean; // Initial choice buttons visible
  userChoice: TravelStyleChoice; // User's selection

  // Section visibility
  showAllSections: boolean; // All travel style sections visible
  completedSections: string[]; // Sections user has completed

  // Navigation state
  canSkipToNickname: boolean; // Skip button availability
  navigationPath: NavigationStep[]; // User's navigation history

  // Form data preservation
  preservedData: TravelStyleData; // Data saved during navigation
  isDirty: boolean; // Unsaved changes exist
}

interface TravelStyleActions {
  makeChoice: (choice: TravelStyleChoice) => void;
  showAllSections: () => void;
  skipToNickname: () => void;
  markSectionComplete: (section: string) => void;
  preserveData: (data: Partial<TravelStyleData>) => void;
  resetState: () => void;
}

type TravelStyleChoice = 'answer-questions' | 'skip-ahead' | 'not-selected';

interface TravelStyleData {
  experience: string[];
  vibes: string[];
  sampleDays: string[];
  dinnerChoices: string[];
  customTexts: Record<string, string>;
}

interface NavigationStep {
  step: string;
  timestamp: number;
  choice?: TravelStyleChoice;
}

type TravelStyleEvent =
  | { type: 'MAKE_CHOICE'; payload: TravelStyleChoice }
  | { type: 'SHOW_ALL_SECTIONS' }
  | { type: 'SKIP_TO_NICKNAME' }
  | { type: 'SECTION_COMPLETE'; payload: string }
  | { type: 'PRESERVE_DATA'; payload: Partial<TravelStyleData> }
  | { type: 'RESET' };
```

### 5. Form Global State Integration

```typescript
interface EnhancedFormState {
  // Enhanced components state
  dateInputs: {
    departDate: DateInputState;
    returnDate: DateInputState;
  };

  budgetSlider: BudgetSliderState;

  preferenceModals: Record<InclusionType, PreferenceModalState>;

  travelStyle: TravelStyleState;

  // Global form state
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  validationSummary: ValidationSummary;

  // Performance tracking
  interactionMetrics: InteractionMetrics;
}

interface ValidationSummary {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  fieldErrors: Record<string, string>;
  globalErrors: string[];
}

interface InteractionMetrics {
  datePickerActivations: number;
  budgetSliderInteractions: number;
  modalOpenCount: number;
  averageInteractionTime: number;
  performanceIssues: PerformanceIssue[];
}

interface PerformanceIssue {
  type: 'slow-response' | 'memory-usage' | 'render-time';
  component: string;
  timestamp: number;
  details: string;
}
```

## State Management Patterns

### 1. Component-Level State (React Hooks)

```typescript
// Custom hook for date input management
function useDateInput(initialValue: string = ''): [DateInputState, DateInputActions] {
  const [state, dispatch] = useReducer(dateInputReducer, {
    value: initialValue,
    displayValue: initialValue,
    isValid: true,
    isPickerOpen: false,
    clickZoneActive: false,
    hasFocus: false,
    validationLevel: 'none',
    ariaLabel: 'Select date',
  });

  const actions = useMemo(
    () => ({
      setValue: (value: string) => dispatch({ type: 'VALUE_CHANGE', payload: value }),
      openPicker: () => dispatch({ type: 'PICKER_OPEN' }),
      closePicker: () => dispatch({ type: 'PICKER_CLOSE' }),
      setFocus: (focused: boolean) => dispatch({ type: 'FOCUS_CHANGE', payload: focused }),
      validate: () => {
        dispatch({ type: 'VALIDATE' });
        return state.isValid;
      },
      clearValue: () => dispatch({ type: 'CLEAR' }),
    }),
    [state.isValid]
  );

  return [state, actions];
}

// Custom hook for budget slider management
function useBudgetSlider(initialValue: number = 5000): [BudgetSliderState, BudgetSliderActions] {
  // Implementation similar to useDateInput
}
```

### 2. Form Context Provider

```typescript
interface FormContextType {
  state: EnhancedFormState;
  actions: FormActions;
  subscribe: (callback: (state: EnhancedFormState) => void) => () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const contextValue = useMemo(
    () => ({
      state,
      actions: createFormActions(dispatch),
      subscribe: (callback) => {
        // Subscription logic for performance monitoring
      },
    }),
    [state]
  );

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
}
```

### 3. Persistence Strategy

```typescript
interface FormPersistence {
  save: (key: string, data: any) => void;
  load: (key: string) => any | null;
  clear: (key: string) => void;
  getAllKeys: () => string[];
}

// Edge-compatible persistence using sessionStorage
const sessionPersistence: FormPersistence = {
  save: (key, data) => {
    try {
      sessionStorage.setItem(`hylo-form-${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Form persistence failed:', error);
    }
  },

  load: (key) => {
    try {
      const data = sessionStorage.getItem(`hylo-form-${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Form data loading failed:', error);
      return null;
    }
  },

  clear: (key) => {
    try {
      sessionStorage.removeItem(`hylo-form-${key}`);
    } catch (error) {
      console.warn('Form data clearing failed:', error);
    }
  },

  getAllKeys: () => {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('hylo-form-')) {
        keys.push(key.replace('hylo-form-', ''));
      }
    }
    return keys;
  },
};
```

## Validation Rules

### Date Input Validation

```typescript
interface DateValidationRule {
  name: string;
  validate: (value: string, context?: any) => boolean;
  message: string;
  level: 'warning' | 'error';
}

const dateValidationRules: DateValidationRule[] = [
  {
    name: 'required',
    validate: (value) => value.trim().length > 0,
    message: 'Date is required',
    level: 'error',
  },
  {
    name: 'format',
    validate: (value) => /^\d{2}\/\d{2}\/\d{2}$/.test(value),
    message: 'Date must be in MM/DD/YY format',
    level: 'error',
  },
  {
    name: 'future-date',
    validate: (value) => {
      const date = parseDate(value);
      return date && date > new Date();
    },
    message: 'Date must be in the future',
    level: 'error',
  },
  {
    name: 'return-after-depart',
    validate: (value, context) => {
      if (!context?.departDate) return true;
      const returnDate = parseDate(value);
      const departDate = parseDate(context.departDate);
      return returnDate && departDate && returnDate > departDate;
    },
    message: 'Return date must be after departure date',
    level: 'error',
  },
];
```

### Budget Validation

```typescript
const budgetValidationRules = {
  minimumBudget: {
    validate: (value: number) => value >= 0,
    message: 'Budget cannot be negative',
    level: 'error' as const,
  },

  maximumBudget: {
    validate: (value: number) => value <= 50000,
    message: 'Budget seems unusually high',
    level: 'warning' as const,
  },

  reasonableBudget: {
    validate: (value: number, travelers: number = 1) => {
      const perPersonBudget = value / travelers;
      return perPersonBudget >= 100; // Minimum $100 per person
    },
    message: 'Budget may be too low for planned activities',
    level: 'warning' as const,
  },
};
```

## Performance Optimizations

### Memoization Strategy

```typescript
// Memoized selectors for expensive computations
const selectDateInputState = createSelector(
  (state: EnhancedFormState) => state.dateInputs,
  (dateInputs) => ({
    isValid: Object.values(dateInputs).every((input) => input.isValid),
    hasErrors: Object.values(dateInputs).some((input) => input.validationLevel === 'error'),
    completionPercentage:
      (Object.values(dateInputs).filter((input) => input.value).length / 2) * 100,
  })
);

// Debounced validation
const useDebouncedValidation = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

### Bundle Size Optimization

```typescript
// Lazy loading for complex modal components
const AccommodationPreferences = lazy(() =>
  import('./modals/AccommodationPreferences').then((module) => ({
    default: module.AccommodationPreferences,
  }))
);

// Tree-shakable utility functions
export const dateUtils = {
  parse: (dateStr: string) => parseDate(dateStr),
  format: (date: Date) => formatDate(date),
  validate: (dateStr: string) => validateDate(dateStr),
  isInFuture: (dateStr: string) => isDateInFuture(dateStr),
} as const;
```

## Constitutional Compliance

### Edge-Runtime Compatibility

- All data structures use JSON-serializable types
- No Node.js-specific APIs (Buffer, fs, etc.)
- Web API compatibility for storage (sessionStorage)
- Bundle size optimizations for edge deployment

### Type Safety

- Strict TypeScript for all interfaces
- Runtime validation with Zod schemas
- Discriminated unions for type safety
- Immutable data patterns where applicable

### Observability

- Performance metrics collection
- Error boundary integration
- User interaction analytics
- Accessibility compliance tracking

---

**Data model completed**: September 18, 2025  
**Constitutional compliance**: Verified for edge-runtime compatibility  
**Ready for**: API contracts and implementation planning
