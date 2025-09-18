# Data Model: Form UI Enhancement

## Overview

This data model defines the enhanced interfaces, state structures, and type definitions required for implementing form UI improvements in the TripDetailsForm component. All enhancements maintain backward compatibility with existing form data structures.

## Enhanced Core Entities

### 1. Enhanced FormData Interface

```typescript
// Extended from existing FormData interface
interface EnhancedFormData extends FormData {
  // Existing fields preserved
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

  // New enhanced fields
  flexibleBudget?: boolean;
  accommodationOther?: string;
  rentalCarPreferences?: string[];
  travelStyleChoice?: TravelStyleChoice;
  travelStyleAnswers?: TravelStyleAnswers;
}

// Supporting types
type TravelStyleChoice = 'answer-questions' | 'skip-to-details' | 'not-selected';

interface TravelStyleAnswers {
  [key: string]: any; // Flexible structure for travel style responses
}
```

### 2. Date Input Enhancement State

```typescript
interface DateInputState {
  // Core input state
  value: string;
  displayValue: string;
  isValid: boolean;

  // Enhanced interaction state
  isPickerOpen: boolean;
  clickZoneActive: boolean;
  hasFocus: boolean;

  // Validation state
  validationLevel: ValidationLevel;
  validationMessage?: string;

  // Accessibility state
  ariaLabel: string;
  ariaDescribedBy?: string;
}

interface DateInputActions {
  setValue: (value: string) => void;
  openPicker: () => void;
  closePicker: () => void;
  setFocus: (focused: boolean) => void;
  togglePicker: () => void;
  clearValue: () => void;
  validate: () => boolean;
}

type ValidationLevel = 'none' | 'warning' | 'error';

// Date input events
type DateInputEvent =
  | { type: 'VALUE_CHANGE'; payload: string }
  | { type: 'PICKER_OPEN' }
  | { type: 'PICKER_CLOSE' }
  | { type: 'FOCUS_CHANGE'; payload: boolean }
  | { type: 'VALIDATE' }
  | { type: 'CLEAR' };
```

### 3. Enhanced Budget Slider State

```typescript
interface BudgetSliderState {
  // Core budget values
  value: number;
  displayValue: string;
  currency: Currency;

  // Slider properties
  min: number;
  max: number;
  step: number;

  // Interaction state
  isDragging: boolean;
  isHovered: boolean;

  // Enhanced functionality
  isFlexible: boolean;
  flexibleLabel: string;

  // Synchronization state
  lastUpdateTime: number;
  updatePending: boolean;

  // Performance tracking
  renderCount: number;
}

interface BudgetSliderActions {
  setValue: (value: number) => void;
  setDragging: (dragging: boolean) => void;
  setHovered: (hovered: boolean) => void;
  toggleFlexible: () => void;
  setCurrency: (currency: Currency) => void;
  formatDisplay: (value: number, currency: Currency) => string;
  reset: () => void;
}

// Budget mode types
type BudgetMode = 'total' | 'per-person';
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

// Budget slider events
type BudgetSliderEvent =
  | { type: 'VALUE_UPDATE'; payload: number }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_END' }
  | { type: 'HOVER_CHANGE'; payload: boolean }
  | { type: 'TOGGLE_FLEXIBLE' }
  | { type: 'CURRENCY_CHANGE'; payload: Currency }
  | { type: 'RESET' };
```

### 4. Preference Modal Enhancement State

```typescript
interface PreferenceModalState {
  // Modal state
  isOpen: boolean;
  currentSection: PreferenceSection;

  // Interaction state
  buttonsEnabled: boolean;
  fieldsEnabled: boolean;

  // Data state
  preferences: PreferenceData;
  hasUnsavedChanges: boolean;

  // Error state
  validationErrors: ValidationError[];
  submitError?: string;
}

interface PreferenceModalActions {
  openModal: (section: PreferenceSection) => void;
  closeModal: () => void;
  updatePreferences: (data: Partial<PreferenceData>) => void;
  enableInteractions: () => void;
  disableInteractions: () => void;
  validateAndSubmit: () => Promise<boolean>;
  resetToDefaults: () => void;
}

type PreferenceSection = 'accommodations' | 'rental-car' | 'activities' | 'dining';

interface PreferenceData {
  accommodations?: {
    type: string;
    other?: string;
  };
  rentalCar?: {
    vehicleTypes: string[];
    other?: string;
  };
  activities?: string[];
  dining?: string[];
}

interface ValidationError {
  field: string;
  message: string;
  level: ValidationLevel;
}
```

### 5. Travel Style Progressive Disclosure State

```typescript
interface TravelStyleState {
  // Choice state
  userChoice: TravelStyleChoice;
  showQuestions: boolean;

  // Question state
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: TravelStyleAnswers;

  // UI state
  isExpanded: boolean;
  isAnimating: boolean;
  canProceed: boolean;

  // Progress tracking
  completionPercentage: number;
  startTime?: number;
  choiceTimestamp?: number;
}

interface TravelStyleActions {
  selectChoice: (choice: TravelStyleChoice) => void;
  expandQuestions: () => void;
  collapseQuestions: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  updateAnswer: (questionId: string, answer: any) => void;
  skipToEnd: () => void;
  resetProgress: () => void;
}

interface TravelStyleQuestion {
  id: string;
  title: string;
  type: 'single-select' | 'multi-select' | 'text' | 'scale';
  options?: string[];
  required: boolean;
  description?: string;
}

// Travel style events
type TravelStyleEvent =
  | { type: 'CHOICE_SELECTED'; payload: TravelStyleChoice }
  | { type: 'QUESTIONS_EXPANDED' }
  | { type: 'QUESTIONS_COLLAPSED' }
  | { type: 'ANSWER_UPDATED'; payload: { questionId: string; answer: any } }
  | { type: 'SKIP_TO_END' }
  | { type: 'RESET' };
```

## State Management Patterns

### 1. Custom Hooks Architecture

```typescript
// Date input management hook
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
      togglePicker: () => {
        dispatch(state.isPickerOpen ? { type: 'PICKER_CLOSE' } : { type: 'PICKER_OPEN' });
      },
      clearValue: () => dispatch({ type: 'CLEAR' }),
      validate: () => {
        dispatch({ type: 'VALIDATE' });
        return state.isValid;
      },
    }),
    [state.isValid, state.isPickerOpen]
  );

  return [state, actions];
}

// Budget slider management hook
function useBudgetSlider(
  initialValue: number = 5000,
  currency: Currency = 'USD'
): [BudgetSliderState, BudgetSliderActions] {
  const [state, dispatch] = useReducer(budgetSliderReducer, {
    value: initialValue,
    displayValue: formatCurrency(initialValue, currency),
    currency,
    min: 0,
    max: 10000,
    step: 250,
    isDragging: false,
    isHovered: false,
    isFlexible: false,
    flexibleLabel: "I'm not sure or my budget is flexible",
    lastUpdateTime: Date.now(),
    updatePending: false,
    renderCount: 0,
  });

  const actions = useMemo(
    () => ({
      setValue: (value: number) => dispatch({ type: 'VALUE_UPDATE', payload: value }),
      setDragging: (dragging: boolean) =>
        dispatch({
          type: dragging ? 'DRAG_START' : 'DRAG_END',
        }),
      setHovered: (hovered: boolean) =>
        dispatch({
          type: 'HOVER_CHANGE',
          payload: hovered,
        }),
      toggleFlexible: () => dispatch({ type: 'TOGGLE_FLEXIBLE' }),
      setCurrency: (currency: Currency) =>
        dispatch({
          type: 'CURRENCY_CHANGE',
          payload: currency,
        }),
      formatDisplay: (value: number, currency: Currency) => formatCurrency(value, currency),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  );

  return [state, actions];
}

// Preference modal management hook
function usePreferenceModal(): [PreferenceModalState, PreferenceModalActions] {
  // Implementation follows similar pattern
}

// Travel style management hook
function useTravelStyle(): [TravelStyleState, TravelStyleActions] {
  // Implementation follows similar pattern
}
```

### 2. Reducer Functions

```typescript
// Date input reducer
function dateInputReducer(state: DateInputState, action: DateInputEvent): DateInputState {
  switch (action.type) {
    case 'VALUE_CHANGE':
      return {
        ...state,
        value: action.payload,
        displayValue: action.payload,
        isValid: validateDateFormat(action.payload),
        validationLevel: validateDateFormat(action.payload) ? 'none' : 'error',
      };

    case 'PICKER_OPEN':
      return {
        ...state,
        isPickerOpen: true,
        clickZoneActive: true,
      };

    case 'PICKER_CLOSE':
      return {
        ...state,
        isPickerOpen: false,
        clickZoneActive: false,
      };

    case 'FOCUS_CHANGE':
      return {
        ...state,
        hasFocus: action.payload,
      };

    case 'VALIDATE':
      const isValid = validateDateFormat(state.value);
      return {
        ...state,
        isValid,
        validationLevel: isValid ? 'none' : 'error',
        validationMessage: isValid ? undefined : 'Please enter a valid date',
      };

    case 'CLEAR':
      return {
        ...state,
        value: '',
        displayValue: '',
        isValid: true,
        validationLevel: 'none',
        validationMessage: undefined,
      };

    default:
      return state;
  }
}

// Budget slider reducer
function budgetSliderReducer(
  state: BudgetSliderState,
  action: BudgetSliderEvent
): BudgetSliderState {
  switch (action.type) {
    case 'VALUE_UPDATE':
      return {
        ...state,
        value: action.payload,
        displayValue: formatCurrency(action.payload, state.currency),
        lastUpdateTime: Date.now(),
        updatePending: false,
      };

    case 'DRAG_START':
      return {
        ...state,
        isDragging: true,
      };

    case 'DRAG_END':
      return {
        ...state,
        isDragging: false,
      };

    case 'TOGGLE_FLEXIBLE':
      return {
        ...state,
        isFlexible: !state.isFlexible,
      };

    case 'CURRENCY_CHANGE':
      return {
        ...state,
        currency: action.payload,
        displayValue: formatCurrency(state.value, action.payload),
      };

    default:
      return state;
  }
}
```

## Utility Functions

### 1. Validation Functions

```typescript
// Date validation
function validateDateFormat(dateStr: string): boolean {
  if (!dateStr) return true; // Empty is valid (optional field)

  const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  if (!dateRegex.test(dateStr)) return false;

  const parts = dateStr.split('/');
  const month = parseInt(parts[0]);
  const day = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Additional validation for actual date validity
  const date = new Date(year < 50 ? 2000 + year : year, month - 1, day);
  return date.getMonth() === month - 1;
}

// Budget validation
function validateBudgetRange(value: number, min: number = 0, max: number = 10000): boolean {
  return value >= min && value <= max && value % 250 === 0;
}
```

### 2. Formatting Functions

```typescript
// Currency formatting
function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
  };

  return `${symbols[currency]}${amount.toLocaleString()}`;
}

// Date formatting
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}
```

## Integration Interfaces

### 1. Component Props

```typescript
// Enhanced TripDetailsForm props
interface EnhancedTripDetailsFormProps {
  formData: EnhancedFormData;
  onFormChange: (data: EnhancedFormData) => void;

  // Enhancement flags
  enableEnhancedDateInput?: boolean;
  enableBudgetSliderSync?: boolean;
  enablePreferenceModal?: boolean;
  enableTravelStyleProgressive?: boolean;

  // Event handlers
  onDateInputChange?: (field: 'departDate' | 'returnDate', value: string) => void;
  onBudgetChange?: (value: number, isFlexible: boolean) => void;
  onPreferenceChange?: (section: PreferenceSection, data: PreferenceData) => void;
  onTravelStyleChoice?: (choice: TravelStyleChoice) => void;
}
```

### 2. Event Interfaces

```typescript
// Form interaction events
interface FormInteractionEvent {
  type: string;
  component: string;
  timestamp: number;
  data?: any;
}

// Performance tracking
interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  interactionLatency: number;
  memoryUsage?: number;
}
```

## Backward Compatibility

### 1. Existing Interface Preservation

All existing `FormData` properties and methods are preserved. New functionality is additive and optional through feature flags and optional properties.

### 2. Gradual Migration Strategy

```typescript
// Migration helper types
type LegacyFormData = {
  // Original FormData interface
};

type MigrationFormData = LegacyFormData & Partial<EnhancedFormData>;

// Migration utility
function migrateFormData(legacy: LegacyFormData): EnhancedFormData {
  return {
    ...legacy,
    flexibleBudget: false,
    travelStyleChoice: 'not-selected',
    // Other default values for new fields
  };
}
```

## Type Exports

```typescript
// Main exports for external consumption
export type {
  EnhancedFormData,
  DateInputState,
  DateInputActions,
  BudgetSliderState,
  BudgetSliderActions,
  PreferenceModalState,
  PreferenceModalActions,
  TravelStyleState,
  TravelStyleActions,
  TravelStyleChoice,
  ValidationLevel,
  Currency,
  BudgetMode,
  PreferenceSection,
};

// Hook exports
export { useDateInput, useBudgetSlider, usePreferenceModal, useTravelStyle };

// Utility exports
export {
  validateDateFormat,
  validateBudgetRange,
  formatCurrency,
  formatDateDisplay,
  migrateFormData,
};
```
