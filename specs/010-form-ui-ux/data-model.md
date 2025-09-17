# Data Model: Form UI/UX Optimization & Categorization

**Branch**: `010-form-ui-ux` | **Date**: September 17, 2025
**Design Phase**: Phase 1 - Data Structure Design

## Enhanced Form State Interfaces

### Date Section State Management

```typescript
interface DateSectionState {
  mode: 'fixed' | 'flexible';
  contextualLabels: {
    primary: string; // "Depart" → "Trip Start (Flexible)" when flexible
    secondary: string; // "Return" → "Duration" when flexible
  };
  displayState: {
    showDateInputs: boolean;
    showDurationDropdown: boolean;
    showTotalDays: boolean;
  };
}

// Usage in TripDetailsForm
interface TripDetailsFormState extends FormData {
  dateSection: DateSectionState;
}
```

### Budget Display State Management

```typescript
interface BudgetDisplayState {
  mode: 'total' | 'per-person';
  indicator: {
    visible: boolean;
    text: string;
    position: 'above' | 'beside';
  };
  synchronization: {
    sliderValue: number;
    displayValue: string;
    isUpdating: boolean;
  };
}

// Enhanced budget interface
interface BudgetSection {
  range: number;
  currency: Currency;
  mode: BudgetMode;
  displayState: BudgetDisplayState;
}
```

### Form Category Structure

```typescript
interface FormCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description?: string;
  components: FormComponentConfig[];
  order: number;
}

interface FormComponentConfig {
  component: React.ComponentType<any>;
  props: Record<string, any>;
  id: string;
  title: string;
  required: boolean;
}

// Predefined categories
const FORM_CATEGORIES: FormCategory[] = [
  {
    id: 'trip-details',
    title: 'Trip Details',
    icon: <MapPin />,
    description: 'Essential trip logistics and requirements',
    components: [
      {
        component: TripDetailsForm,
        props: {},
        id: 'trip-details-form',
        title: 'Trip Details',
        required: true,
      },
    ],
    order: 1,
  },
  {
    id: 'travel-style',
    title: 'Travel Style',
    icon: <Heart />,
    description: 'Your preferences and travel style',
    components: [
      {
        component: TravelGroupSelector,
        props: {},
        id: 'travel-group',
        title: 'Travel Group',
        required: true,
      },
      {
        component: TravelInterests,
        props: {},
        id: 'travel-interests',
        title: 'Interests',
        required: true,
      },
      // ... other components
    ],
    order: 2,
  },
];
```

### Component State Enhancements

```typescript
// Enhanced TripDetailsForm props
interface TripDetailsFormProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  // New props for enhanced functionality
  uiState?: {
    dateSection?: Partial<DateSectionState>;
    budgetSection?: Partial<BudgetDisplayState>;
  };
  onUIStateChange?: (state: any) => void;
}

// Form category wrapper component
interface FormCategoryWrapperProps {
  category: FormCategory;
  isActive: boolean;
  isCompleted: boolean;
  onCategorySelect?: (categoryId: string) => void;
  children: React.ReactNode;
  className?: string;
}
```

## Form Navigation State

```typescript
interface FormNavigationState {
  currentCategory: string;
  completedCategories: string[];
  categoryProgress: Record<
    string,
    {
      completed: boolean;
      validated: boolean;
      errorCount: number;
    }
  >;
  canProceed: boolean;
}

// Navigation context for category management
interface FormNavigationContext {
  state: FormNavigationState;
  actions: {
    setCurrentCategory: (categoryId: string) => void;
    markCategoryComplete: (categoryId: string) => void;
    validateCategory: (categoryId: string) => boolean;
    canNavigateToCategory: (categoryId: string) => boolean;
  };
}
```

## Component Enhancement Interfaces

### Flexible Date Labels

```typescript
interface DateLabelConfig {
  mode: 'fixed' | 'flexible';
  labels: {
    primary: string;
    secondary: string;
  };
  placeholders: {
    primary: string;
    secondary: string;
  };
}

const DATE_LABEL_CONFIGS: Record<string, DateLabelConfig> = {
  fixed: {
    mode: 'fixed',
    labels: { primary: 'Depart', secondary: 'Return' },
    placeholders: { primary: 'mm/dd/yy', secondary: 'mm/dd/yy' },
  },
  flexible: {
    mode: 'flexible',
    labels: { primary: 'Trip Start', secondary: 'Duration' },
    placeholders: { primary: 'Flexible dates', secondary: 'How many days?' },
  },
};
```

### Budget Mode Indicator

```typescript
interface BudgetModeConfig {
  mode: BudgetMode;
  indicator: {
    text: string;
    description: string;
    icon?: React.ReactNode;
  };
  calculation: {
    baseAmount: number;
    multiplier: number; // 1 for total, groupSize for per-person
    displayFormat: string;
  };
}

const BUDGET_MODE_CONFIGS: Record<BudgetMode, BudgetModeConfig> = {
  total: {
    mode: 'total',
    indicator: { text: 'Total Trip Budget', description: 'Budget for entire group' },
    calculation: { baseAmount: 0, multiplier: 1, displayFormat: 'Total: {amount}' },
  },
  'per-person': {
    mode: 'per-person',
    indicator: { text: 'Per-Person Budget', description: 'Budget per traveler' },
    calculation: { baseAmount: 0, multiplier: 1, displayFormat: 'Per person: {amount}' },
  },
};
```

## Validation Rules

### Form Category Validation

```typescript
interface CategoryValidationRule {
  categoryId: string;
  required: boolean;
  validator: (formData: any) => ValidationResult;
  dependencies: string[]; // Other categories that must be completed first
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
```

### Enhanced Form Validation

```typescript
// Existing FormData interface extension
interface EnhancedFormData extends FormData {
  categoryProgress: Record<string, boolean>;
  uiState: {
    dateSection: DateSectionState;
    budgetSection: BudgetDisplayState;
  };
  navigation: FormNavigationState;
}
```

## State Transitions

### Date Section State Transitions

```
Fixed Mode → Flexible Mode:
- Hide date inputs
- Show duration dropdown
- Update labels to contextual messaging
- Clear return date
- Set planned days

Flexible Mode → Fixed Mode:
- Show date inputs
- Hide duration dropdown
- Update labels to standard messaging
- Clear planned days
- Validate date range
```

### Budget Mode State Transitions

```
Total Budget → Per-Person Budget:
- Update indicator text
- Recalculate display amount (divide by group size)
- Update helper text
- Maintain slider position

Per-Person Budget → Total Budget:
- Update indicator text
- Recalculate display amount (multiply by group size)
- Update helper text
- Maintain slider position
```

## Persistence Strategy

```typescript
// Local storage keys for UI state persistence
const UI_STATE_STORAGE_KEYS = {
  FORM_CATEGORY_PROGRESS: 'hylo_form_category_progress',
  DATE_SECTION_STATE: 'hylo_date_section_state',
  BUDGET_SECTION_STATE: 'hylo_budget_section_state',
  FORM_NAVIGATION: 'hylo_form_navigation',
} as const;

// State persistence interface
interface StatePersistence {
  save: (key: string, data: any) => void;
  load: (key: string) => any | null;
  clear: (key: string) => void;
  clearAll: () => void;
}
```

---

**Data Model Complete**: All interfaces and state structures defined for enhanced form UI/UX
