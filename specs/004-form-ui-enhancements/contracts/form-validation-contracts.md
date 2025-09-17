# Form Validation API Contracts

**Date**: September 18, 2025  
**Context**: Production-grade validation schemas and component interfaces

## Overview

This document defines the API contracts, validation schemas, and component interfaces for form UI enhancements. Since this feature is primarily frontend-focused, contracts emphasize TypeScript interfaces, Zod schemas, and component APIs rather than HTTP endpoints.

## Component Interface Contracts

### 1. Enhanced Date Input Component

```typescript
// Component Props Interface
interface EnhancedDateInputProps {
  // Core props
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;

  // Enhanced functionality props
  enableClickZoneExpansion?: boolean;
  showValidationFeedback?: boolean;
  validationRules?: DateValidationRule[];

  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;

  // Event handlers
  onPickerOpen?: () => void;
  onPickerClose?: () => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;

  // Styling props
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'compact' | 'inline';
}

// Component Ref Interface
interface EnhancedDateInputRef {
  focus: () => void;
  blur: () => void;
  openPicker: () => void;
  closePicker: () => void;
  validate: () => boolean;
  getValue: () => string;
  setValue: (value: string) => void;
  reset: () => void;
}

// Usage Contract
const DateInput = forwardRef<EnhancedDateInputRef, EnhancedDateInputProps>((props, ref) => {
  // Implementation
});
```

### 2. Enhanced Budget Slider Component

```typescript
// Component Props Interface
interface EnhancedBudgetSliderProps {
  // Core props
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: Currency;

  // Enhanced functionality props
  enableRealTimeSync?: boolean;
  showFlexibleToggle?: boolean;
  flexibleMode?: boolean;
  onFlexibleToggle?: (enabled: boolean) => void;

  // Display options
  showCurrencySelector?: boolean;
  showBudgetModeToggle?: boolean;
  budgetMode?: BudgetMode;
  onBudgetModeChange?: (mode: BudgetMode) => void;

  // Performance props
  debounceMs?: number;
  enablePerformanceMonitoring?: boolean;

  // Event handlers
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onCurrencyChange?: (currency: Currency) => void;

  // Styling props
  className?: string;
  sliderClassName?: string;
  displayClassName?: string;
}

// Component Ref Interface
interface EnhancedBudgetSliderRef {
  getValue: () => number;
  setValue: (value: number) => void;
  getCurrency: () => Currency;
  setCurrency: (currency: Currency) => void;
  toggleFlexible: () => void;
  reset: () => void;
  focus: () => void;
}
```

### 3. Enhanced Preference Modal Component

```typescript
// Component Props Interface
interface EnhancedPreferenceModalProps {
  // Core props
  isOpen: boolean;
  onClose: () => void;
  inclusionType: InclusionType;

  // Form data props
  initialData?: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  onSubmit: (data: Record<string, any>) => void;

  // Enhanced functionality props
  enableInteractionFixes?: boolean;
  enableOtherInput?: boolean;
  enableMultiSelect?: boolean;
  multiSelectFields?: string[];

  // Validation props
  validationSchema?: ZodSchema<any>;
  onValidationError?: (errors: Record<string, string>) => void;

  // Accessibility props
  returnFocusTo?: HTMLElement;
  enableFocusTrap?: boolean;
  ariaLabelledBy?: string;

  // Styling props
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

// Component Ref Interface
interface EnhancedPreferenceModalRef {
  open: () => void;
  close: () => void;
  validate: () => boolean;
  getFormData: () => Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  resetForm: () => void;
  focusFirstField: () => void;
}
```

### 4. Travel Style Progressive Disclosure Component

```typescript
// Component Props Interface
interface TravelStyleProgressiveDisclosureProps {
  // Core props
  onChoiceSelect: (choice: TravelStyleChoice) => void;
  onSkipToNickname: () => void;
  onComplete: (data: TravelStyleData) => void;

  // State props
  initialChoice?: TravelStyleChoice;
  preservedData?: Partial<TravelStyleData>;

  // Configuration props
  enableProgressTracking?: boolean;
  allowBackNavigation?: boolean;
  validateOnStepChange?: boolean;

  // Custom content props
  choiceButtonTexts?: {
    answerQuestions: string;
    skipAhead: string;
  };

  // Event handlers
  onStepChange?: (step: string, data: any) => void;
  onDataPreservation?: (data: Partial<TravelStyleData>) => void;

  // Styling props
  className?: string;
  buttonClassName?: string;
  sectionClassName?: string;
}

// Component Ref Interface
interface TravelStyleProgressiveDisclosureRef {
  makeChoice: (choice: TravelStyleChoice) => void;
  showAllSections: () => void;
  skipToNickname: () => void;
  getCurrentStep: () => string;
  getPreservedData: () => Partial<TravelStyleData>;
  reset: () => void;
}
```

## Validation Schema Contracts

### 1. Date Input Validation

```typescript
import { z } from 'zod';

// Base date validation schema
const DateInputSchema = z.object({
  value: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{2}\/\d{2}\/\d{2}$/, 'Date must be in MM/DD/YY format')
    .refine((date) => {
      const parsed = parseDate(date);
      return parsed && parsed > new Date();
    }, 'Date must be in the future'),

  displayValue: z.string(),
  isValid: z.boolean(),
  validationLevel: z.enum(['none', 'warning', 'error']),
  validationMessage: z.string().optional(),
});

// Date range validation schema
const DateRangeSchema = z
  .object({
    departDate: DateInputSchema,
    returnDate: DateInputSchema,
  })
  .refine(
    (data) => {
      const depart = parseDate(data.departDate.value);
      const return_ = parseDate(data.returnDate.value);
      return depart && return_ && return_ > depart;
    },
    {
      message: 'Return date must be after departure date',
      path: ['returnDate'],
    }
  );

// Flexible dates schema
const FlexibleDatesSchema = z.object({
  isFlexible: z.boolean(),
  plannedDays: z
    .number()
    .min(1, 'Must plan at least 1 day')
    .max(31, 'Cannot plan more than 31 days')
    .optional(),
});
```

### 2. Budget Validation

```typescript
// Budget value validation schema
const BudgetValueSchema = z
  .object({
    value: z
      .number()
      .min(0, 'Budget cannot be negative')
      .max(100000, 'Budget exceeds reasonable limits'),

    currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),

    mode: z.enum(['total', 'per-person']),

    isFlexible: z.boolean(),

    // Contextual validation
    travelers: z.number().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.travelers && data.mode === 'per-person') {
        const totalBudget = data.value * data.travelers;
        return totalBudget <= 100000;
      }
      return true;
    },
    {
      message: 'Total budget exceeds reasonable limits',
      path: ['value'],
    }
  );

// Budget slider state validation
const BudgetSliderStateSchema = z.object({
  value: z.number(),
  displayValue: z.string(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  min: z.number(),
  max: z.number(),
  step: z.number(),
  isDragging: z.boolean(),
  isFlexible: z.boolean(),
  lastUpdateTime: z.number(),
  updatePending: z.boolean(),
});
```

### 3. Preference Modal Validation

```typescript
// Accommodation preferences schema
const AccommodationPreferencesSchema = z.object({
  types: z.array(z.string()).min(1, 'Select at least one accommodation type'),
  budgetRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .refine((range) => range.max >= range.min, {
      message: 'Maximum budget must be greater than or equal to minimum',
      path: ['max'],
    }),
  location: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  accessibility: z.array(z.string()).optional(),
  other: z.string().max(500, 'Other preferences must be under 500 characters').optional(),
});

// Rental car preferences schema
const RentalCarPreferencesSchema = z.object({
  vehicleTypes: z
    .array(z.string())
    .min(1, 'Select at least one vehicle type')
    .max(5, 'Too many vehicle types selected'),

  transmission: z.enum(['automatic', 'manual', 'no-preference']),

  features: z.array(z.string()).optional(),

  insurance: z
    .object({
      level: z.enum(['basic', 'comprehensive', 'premium']),
      addOns: z.array(z.string()).optional(),
    })
    .optional(),

  other: z.string().max(500, 'Other preferences must be under 500 characters').optional(),
});

// Generic modal validation schema
const PreferenceModalSchema = z.object({
  inclusionType: z.enum([
    'flights',
    'accommodations',
    'rental-car',
    'activities',
    'dining',
    'entertainment',
    'train-tickets',
    'travel-insurance',
  ]),

  formData: z.record(z.any()),

  isValid: z.boolean(),

  validationErrors: z.record(z.string()),

  showOtherInput: z.boolean(),

  otherInputValue: z.string().max(1000, 'Input too long').optional(),
});
```

### 4. Travel Style Validation

```typescript
// Travel style choice validation
const TravelStyleChoiceSchema = z.enum(['answer-questions', 'skip-ahead', 'not-selected']);

// Travel style data validation
const TravelStyleDataSchema = z.object({
  experience: z.array(z.string()),
  vibes: z.array(z.string()),
  sampleDays: z.array(z.string()),
  dinnerChoices: z.array(z.string()),
  customTexts: z.record(z.string().max(1000, 'Custom text too long')),
});

// Navigation state validation
const NavigationStateSchema = z.object({
  currentStep: z.string(),
  completedSteps: z.array(z.string()),
  choice: TravelStyleChoiceSchema,
  preservedData: TravelStyleDataSchema.partial(),
  isDirty: z.boolean(),
});
```

## Event Contracts

### 1. Component Events

```typescript
// Date input events
interface DateInputEvents {
  'value-change': { value: string; isValid: boolean };
  'picker-open': { timestamp: number };
  'picker-close': { timestamp: number; hasSelection: boolean };
  'validation-change': { isValid: boolean; message?: string; level: ValidationLevel };
  'focus-change': { hasFocus: boolean; source: 'mouse' | 'keyboard' | 'programmatic' };
}

// Budget slider events
interface BudgetSliderEvents {
  'value-change': { value: number; currency: Currency; mode: BudgetMode };
  'drag-start': { initialValue: number; timestamp: number };
  'drag-end': { finalValue: number; timestamp: number; duration: number };
  'flexible-toggle': { isFlexible: boolean; timestamp: number };
  'currency-change': { currency: Currency; previousCurrency: Currency };
  'performance-issue': { type: string; component: string; details: any };
}

// Modal events
interface PreferenceModalEvents {
  'modal-open': { inclusionType: InclusionType; timestamp: number };
  'modal-close': { inclusionType: InclusionType; hasChanges: boolean; timestamp: number };
  'form-change': { field: string; value: any; isValid: boolean };
  'validation-error': { field: string; message: string; level: ValidationLevel };
  'other-input-toggle': { visible: boolean; inclusionType: InclusionType };
  'multi-select-change': { field: string; values: string[]; action: 'add' | 'remove' };
}

// Travel style events
interface TravelStyleEvents {
  'choice-made': { choice: TravelStyleChoice; timestamp: number };
  'section-complete': { section: string; data: any; timestamp: number };
  'data-preserved': { section: string; data: any; timestamp: number };
  'navigation-change': { from: string; to: string; timestamp: number };
  'skip-to-nickname': { preservedData: Partial<TravelStyleData>; timestamp: number };
}
```

### 2. Analytics Events

```typescript
// Performance tracking events
interface PerformanceEvents {
  'component-render': {
    component: string;
    renderTime: number;
    props: Record<string, any>;
  };

  'interaction-latency': {
    component: string;
    interaction: string;
    latency: number;
    timestamp: number;
  };

  'bundle-size-impact': {
    component: string;
    sizeBytes: number;
    loadTime: number;
  };

  'memory-usage': {
    component: string;
    heapUsed: number;
    heapTotal: number;
    timestamp: number;
  };
}

// User experience events
interface UXEvents {
  'form-completion-rate': {
    section: string;
    completed: boolean;
    timeSpent: number;
  };

  'error-recovery': {
    component: string;
    errorType: string;
    recoveryAction: string;
    success: boolean;
  };

  'accessibility-usage': {
    component: string;
    method: 'keyboard' | 'screen-reader' | 'voice';
    success: boolean;
  };
}
```

## Contract Testing Interfaces

### 1. Component Contract Tests

```typescript
// Test interface for date input component
interface DateInputContractTest {
  testName: string;
  props: EnhancedDateInputProps;
  expectedBehavior: {
    rendersCorrectly: boolean;
    handlesValueChange: boolean;
    validatesInput: boolean;
    supportsAccessibility: boolean;
    handlesEdgeCases: boolean;
  };
  assertions: Array<{
    description: string;
    test: (component: any) => boolean;
  }>;
}

// Test interface for budget slider component
interface BudgetSliderContractTest {
  testName: string;
  props: EnhancedBudgetSliderProps;
  expectedBehavior: {
    syncsSmoothly: boolean;
    handlesFlexibleMode: boolean;
    supportsMultipleCurrencies: boolean;
    performsWell: boolean;
  };
  performanceThresholds: {
    maxRenderTime: number;
    maxUpdateLatency: number;
    maxMemoryUsage: number;
  };
}
```

### 2. Integration Contract Tests

```typescript
// Form integration test interface
interface FormIntegrationTest {
  testName: string;
  scenario: {
    description: string;
    steps: Array<{
      action: string;
      target: string;
      input?: any;
      expectedResult: any;
    }>;
  };
  expectedOutcome: {
    formIsValid: boolean;
    dataIsPreserved: boolean;
    performanceMeetsThresholds: boolean;
    accessibilityCompliant: boolean;
  };
}
```

## Error Handling Contracts

### 1. Error Types

```typescript
// Component error types
type FormComponentError =
  | { type: 'validation-error'; field: string; message: string; value: any }
  | { type: 'interaction-error'; component: string; action: string; details: string }
  | {
      type: 'performance-error';
      component: string;
      metric: string;
      threshold: number;
      actual: number;
    }
  | {
      type: 'accessibility-error';
      component: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    };

// Error recovery interface
interface ErrorRecovery {
  canRecover: boolean;
  recoveryActions: string[];
  fallbackComponent?: React.ComponentType<any>;
  onRecovery?: (error: FormComponentError) => void;
}
```

### 2. Error Boundaries

```typescript
// Error boundary props interface
interface FormErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
  maxRetries?: number;
}

// Error boundary state interface
interface FormErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  errorId: string;
}
```

---

**Contracts completed**: September 18, 2025  
**Constitutional compliance**: Edge-compatible, type-safe, observable  
**Ready for**: Quickstart guide and implementation tasks
