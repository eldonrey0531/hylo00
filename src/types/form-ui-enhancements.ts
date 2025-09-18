// Enhanced Form UI State Interfaces
// Supporting flexible dates, budget indicators, and form categorization

import { ReactNode } from 'react';

// =======================
// Base Types for Enhanced Components
// =======================

export type ValidationLevel = 'none' | 'warning' | 'error';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type TravelStyleChoice = 'answer-questions' | 'skip-ahead' | 'not-selected';

export type InclusionType =
  | 'flights'
  | 'accommodations'
  | 'rental-car'
  | 'activities'
  | 'dining'
  | 'entertainment'
  | 'train-tickets'
  | 'travel-insurance';

// Form navigation interfaces
export interface NavigationStep {
  step: string;
  timestamp: number;
  choice?: TravelStyleChoice;
}

// =======================
// Enhanced Component State Interfaces
// =======================

// Date Input Enhancement State
export interface DateInputState {
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

export interface DateInputActions {
  setValue: (value: string) => void;
  openPicker: () => void;
  closePicker: () => void;
  setFocus: (focused: boolean) => void;
  togglePicker: () => void;
  clearValue: () => void;
  validate: () => boolean;
}

// Budget Slider Enhancement State
export interface BudgetSliderState {
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

export interface BudgetSliderActions {
  setValue: (value: number) => void;
  setDragging: (dragging: boolean) => void;
  setHovered: (hovered: boolean) => void;
  toggleFlexible: () => void;
  setCurrency: (currency: Currency) => void;
  formatDisplay: (value: number, currency: Currency) => string;
  reset: () => void;
}

// Preference Modal Enhancement State
export interface PreferenceModalState {
  // Modal state
  isOpen: boolean;
  currentSection: InclusionType;

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

export interface PreferenceModalActions {
  openModal: (section: InclusionType) => void;
  closeModal: () => void;
  updatePreferences: (data: Partial<PreferenceData>) => void;
  enableInteractions: () => void;
  disableInteractions: () => void;
  validateAndSubmit: () => Promise<boolean>;
  resetToDefaults: () => void;
}

export interface PreferenceData {
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

// Travel Style Progressive Disclosure State
export interface TravelStyleState {
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

export interface TravelStyleActions {
  selectChoice: (choice: TravelStyleChoice) => void;
  expandQuestions: () => void;
  collapseQuestions: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  updateAnswer: (questionId: string, answer: any) => void;
  skipToEnd: () => void;
  resetProgress: () => void;
}

export interface TravelStyleAnswers {
  [key: string]: any; // Flexible structure for travel style responses
}

// =======================
// Event Types
// =======================

// Date input events
export type DateInputEvent =
  | { type: 'VALUE_CHANGE'; payload: string }
  | { type: 'PICKER_OPEN' }
  | { type: 'PICKER_CLOSE' }
  | { type: 'FOCUS_CHANGE'; payload: boolean }
  | { type: 'VALIDATE' }
  | { type: 'CLEAR' };

// Budget slider events
export type BudgetSliderEvent =
  | { type: 'VALUE_UPDATE'; payload: number }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_END' }
  | { type: 'HOVER_CHANGE'; payload: boolean }
  | { type: 'TOGGLE_FLEXIBLE' }
  | { type: 'CURRENCY_CHANGE'; payload: Currency }
  | { type: 'RESET' };

// Travel style events
export type TravelStyleEvent =
  | { type: 'CHOICE_SELECTED'; payload: TravelStyleChoice }
  | { type: 'QUESTIONS_EXPANDED' }
  | { type: 'QUESTIONS_COLLAPSED' }
  | { type: 'ANSWER_UPDATED'; payload: { questionId: string; answer: any } }
  | { type: 'SKIP_TO_END' }
  | { type: 'RESET' };

// =======================
// Date Section Interfaces
// =======================

// =======================
// Date Section Interfaces
// =======================

export interface DateSectionState {
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

export interface DateLabelConfig {
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

// =======================
// Budget Section Interfaces
// =======================

export type BudgetMode = 'total' | 'per-person';

export interface BudgetDisplayState {
  mode: BudgetMode;
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

export interface BudgetModeConfig {
  mode: BudgetMode;
  indicator: {
    text: string;
    description: string;
    icon?: ReactNode;
  };
  calculation: {
    baseAmount: number;
    multiplier: number; // 1 for total, groupSize for per-person
    displayFormat: string;
  };
}

// =======================
// Form Category Interfaces
// =======================

export interface FormCategory {
  id: string;
  title: string;
  icon: ReactNode;
  description?: string;
  components: FormComponentConfig[];
  order: number;
}

export interface FormComponentConfig {
  component: React.ComponentType<any>;
  props: Record<string, any>;
  id: string;
  title: string;
  required: boolean;
}

export interface CategoryProgress {
  completed: boolean;
  validated: boolean;
  errorCount: number;
}

export interface FormNavigationState {
  currentCategory: string;
  completedCategories: string[];
  categoryProgress: Record<string, CategoryProgress>;
  canProceed: boolean;
}

// =======================
// Enhanced Component Props
// =======================

export interface TripDetailsFormUIState {
  dateSection: DateSectionState;
  budgetSection: BudgetDisplayState;
}

export interface EnhancedTripDetailsFormProps {
  // Existing props (maintained for backward compatibility)
  formData: any; // Will reference existing FormData interface
  onFormChange: (data: any) => void;

  // New props for enhanced functionality
  uiState?: Partial<TripDetailsFormUIState>;
  onUIStateChange?: (state: Partial<TripDetailsFormUIState>) => void;

  // Configuration props
  config?: {
    enableFlexibleDateLabels?: boolean;
    enableBudgetModeIndicator?: boolean;
    dateLabels?: DateLabelConfig;
    budgetLabels?: BudgetModeConfig;
  };
}

export interface FormCategoryWrapperProps {
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
  children: ReactNode;
  className?: string;

  // Configuration
  config?: {
    showProgress?: boolean;
    allowNavigation?: boolean;
    showErrorIndicator?: boolean;
  };
}

// =======================
// Form Organization Interfaces
// =======================

export interface FormOrganizationProps {
  // Category management
  categories: FormCategory[];
  currentCategory: string;
  categoryProgress: Record<string, CategoryProgress>;

  // Data management (existing)
  formData: any; // Will reference existing TravelFormData interface
  onFormDataChange: (data: any) => void;

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

export interface FormUIState {
  dateSection: DateSectionState;
  budgetSection: BudgetDisplayState;
  navigation: FormNavigationState;
}

// =======================
// Validation Interfaces
// =======================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// =======================
// Constants and Configurations
// =======================

export const DATE_LABEL_CONFIGS: Record<string, DateLabelConfig> = {
  fixed: {
    mode: 'fixed',
    labels: { primary: 'Depart', secondary: 'Return' },
    placeholders: { primary: 'mm/dd/yy', secondary: 'mm/dd/yy' },
  },
  flexible: {
    mode: 'flexible',
    labels: { primary: 'Trip Start (Flexible)', secondary: 'Duration' },
    placeholders: { primary: 'Flexible dates', secondary: 'How many days?' },
  },
};

export const BUDGET_MODE_CONFIGS: Record<BudgetMode, BudgetModeConfig> = {
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

// =======================
// Utility Types
// =======================

export type StateUpdate<T = any> = {
  field: keyof T;
  value: any;
  timestamp: number;
};

export type EventPayload<T = any> = {
  type: string;
  payload: T;
  metadata?: Record<string, any>;
};

// =======================
// Storage Keys
// =======================

export const UI_STATE_STORAGE_KEYS = {
  FORM_CATEGORY_PROGRESS: 'hylo_form_category_progress',
  DATE_SECTION_STATE: 'hylo_date_section_state',
  BUDGET_SECTION_STATE: 'hylo_budget_section_state',
  FORM_NAVIGATION: 'hylo_form_navigation',
} as const;
