# Component Contracts: Form UI/UX Optimization

**Branch**: `010-form-ui-ux` | **Date**: September 17, 2025
**Contract Phase**: Phase 1 - Component Interface Definitions

## TripDetailsForm Contract Enhancement

### Props Interface

```typescript
interface TripDetailsFormProps {
  // Existing props (maintained for backward compatibility)
  formData: FormData;
  onFormChange: (data: FormData) => void;

  // New props for enhanced functionality
  uiState?: {
    dateSection?: Partial<DateSectionState>;
    budgetSection?: Partial<BudgetDisplayState>;
  };
  onUIStateChange?: (state: Partial<TripDetailsFormUIState>) => void;

  // Configuration props
  config?: {
    enableFlexibleDateLabels?: boolean;
    enableBudgetModeIndicator?: boolean;
    dateLabels?: DateLabelConfig;
    budgetLabels?: BudgetModeConfig;
  };
}
```

### Expected Behaviors

```typescript
interface TripDetailsFormBehaviors {
  // Date section behaviors
  onFlexibleDatesToggle: (enabled: boolean) => {
    // MUST update labels contextually
    // MUST hide/show appropriate inputs
    // MUST clear conflicting form data
    // MUST update UI state
  };

  // Budget section behaviors
  onBudgetModeToggle: (mode: BudgetMode) => {
    // MUST show visual indicator
    // MUST update display calculation
    // MUST maintain slider synchronization
    // MUST update helper text
  };

  onBudgetSliderChange: (value: number) => {
    // MUST update display in real-time (<50ms)
    // MUST maintain mode indicator
    // MUST trigger parent onChange
    // MUST update local state
  };
}
```

## FormCategoryWrapper Contract

### Component Interface

```typescript
interface FormCategoryWrapperProps {
  // Category definition
  category: FormCategory;

  // State management
  isActive: boolean;
  isCompleted: boolean;
  hasErrors?: boolean;
  errorCount?: number;

  // Event handlers
  onCategorySelect?: (categoryId: string) => void;
  onCategoryComplete?: (categoryId: string, isComplete: boolean) => void;

  // Children and styling
  children: React.ReactNode;
  className?: string;

  // Configuration
  config?: {
    showProgress?: boolean;
    allowNavigation?: boolean;
    showErrorIndicator?: boolean;
  };
}
```

### Expected Behaviors

```typescript
interface FormCategoryWrapperBehaviors {
  // Visual state management
  renderActiveState: () => {
    // MUST show active styling
    // MUST ensure proper z-index
    // MUST highlight category header
  };

  renderCompletedState: () => {
    // MUST show completion indicator
    // MUST maintain completed styling
    // MUST show success feedback
  };

  renderErrorState: () => {
    // MUST show error indicators
    // MUST highlight problem areas
    // MUST provide error context
  };

  // Navigation behaviors
  handleCategorySelection: (categoryId: string) => {
    // MUST validate navigation permissions
    // MUST trigger appropriate events
    // MUST update visual state
  };
}
```

## App.tsx Integration Contract

### Form Organization Interface

```typescript
interface FormOrganizationProps {
  // Category management
  categories: FormCategory[];
  currentCategory: string;
  categoryProgress: Record<string, CategoryProgress>;

  // Data management (existing)
  formData: TravelFormData;
  onFormDataChange: (data: TravelFormData) => void;

  // New UI state management
  uiState: FormUIState;
  onUIStateChange: (state: Partial<FormUIState>) => void;

  // Configuration
  config?: {
    enableCategoryNavigation?: boolean;
    showProgressIndicator?: boolean;
    validateOnCategoryChange?: boolean;
  };
}
```

### Expected Integration Behaviors

```typescript
interface AppIntegrationBehaviors {
  // Category navigation
  navigateToCategory: (categoryId: string) => {
    // MUST validate navigation permissions
    // MUST preserve form data
    // MUST update URL/history if applicable
    // MUST trigger validation
  };

  // State synchronization
  synchronizeFormState: () => {
    // MUST maintain data consistency
    // MUST preserve UI state
    // MUST handle state conflicts
  };

  // Validation coordination
  validateCategoryTransition: (
    from: string,
    to: string
  ) => {
    // MUST check completion requirements
    // MUST validate form data
    // MUST show appropriate feedback
  };
}
```

## Event Contracts

### Date Section Events

```typescript
interface DateSectionEvents {
  onFlexibleDatesChange: {
    payload: { enabled: boolean; previousState: DateSectionState };
    requirements: [
      'MUST update labels within 100ms',
      'MUST preserve existing date data where possible',
      'MUST trigger parent form change event'
    ];
  };

  onDateInput: {
    payload: { field: 'departDate' | 'returnDate'; value: string };
    requirements: [
      'MUST validate date format',
      'MUST check date logic (return > depart)',
      'MUST update total days calculation'
    ];
  };
}
```

### Budget Section Events

```typescript
interface BudgetSectionEvents {
  onBudgetModeChange: {
    payload: { mode: BudgetMode; previousMode: BudgetMode; groupSize: number };
    requirements: [
      'MUST show mode indicator immediately',
      'MUST recalculate display amount',
      'MUST maintain slider position'
    ];
  };

  onBudgetSliderChange: {
    payload: { value: number; mode: BudgetMode; currency: Currency };
    requirements: [
      'MUST update display within 50ms',
      'MUST format currency correctly',
      'MUST trigger parent form change'
    ];
  };
}
```

### Category Navigation Events

```typescript
interface CategoryNavigationEvents {
  onCategorySelect: {
    payload: { categoryId: string; previousCategory: string };
    requirements: [
      'MUST validate transition permissions',
      'MUST preserve form state',
      'MUST update visual indicators'
    ];
  };

  onCategoryComplete: {
    payload: { categoryId: string; isComplete: boolean; validationResults: ValidationResult };
    requirements: [
      'MUST update progress indicators',
      'MUST enable next category if applicable',
      'MUST persist completion state'
    ];
  };
}
```

## Error Handling Contracts

### Component Error Boundaries

```typescript
interface FormErrorBoundaryContract {
  // Error handling
  catchComponentError: (
    error: Error,
    errorInfo: ErrorInfo
  ) => {
    // MUST preserve form data
    // MUST show user-friendly error message
    // MUST provide recovery options
    // MUST log error details
  };

  // Recovery mechanisms
  recoverFromError: () => {
    // MUST restore last known good state
    // MUST preserve user input where possible
    // MUST show recovery confirmation
  };
}
```

### Validation Error Contracts

```typescript
interface ValidationErrorContract {
  // Field-level validation
  validateField: (field: string, value: any) => ValidationResult;

  // Category-level validation
  validateCategory: (categoryId: string, formData: any) => ValidationResult;

  // Cross-category validation
  validateFormConsistency: (formData: TravelFormData) => ValidationResult;

  // Error display
  displayErrors: (errors: ValidationError[]) => {
    // MUST show errors near relevant fields
    // MUST provide clear error messages
    // MUST offer correction guidance
  };
}
```

## Performance Contracts

### Rendering Performance

```typescript
interface PerformanceContract {
  // Re-render optimization
  shouldComponentUpdate: (prevProps: any, nextProps: any) => boolean;

  // Event throttling
  throttleEvents: {
    budgetSliderChange: 50; // ms
    dateInput: 100; // ms
    categoryNavigation: 200; // ms
  };

  // Memory management
  cleanup: () => {
    // MUST remove event listeners
    // MUST clear timeouts/intervals
    // MUST release references
  };
}
```

### State Update Performance

```typescript
interface StateUpdateContract {
  // Batch updates
  batchStateUpdates: (updates: StateUpdate[]) => {
    // MUST minimize re-renders
    // MUST maintain update order
    // MUST handle conflicts
  };

  // Debounced operations
  debouncedOperations: {
    formDataPersistence: 500; // ms
    validationCheck: 300; // ms
    uiStateSync: 100; // ms
  };
}
```

---

**Component Contracts Complete**: All interface definitions and behavioral requirements specified
