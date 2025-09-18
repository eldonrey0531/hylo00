// Enhanced Budget Slider Types
// Constitutional compliance: Edge-compatible, type-safe, observable

import { Currency, BudgetMode, ValidationLevel } from './enhanced-form-data';

// Core budget slider state interface
export interface BudgetSliderState {
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

// Budget slider actions interface
export interface BudgetSliderActions {
  setValue: (value: number) => void;
  setDragging: (dragging: boolean) => void;
  setHovered: (hovered: boolean) => void;
  toggleFlexible: () => void;
  setCurrency: (currency: Currency) => void;
  formatDisplay: (value: number, currency: Currency) => string;
}

// Budget slider events for state management
export type BudgetSliderEvent =
  | { type: 'VALUE_UPDATE'; payload: number }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_END' }
  | { type: 'HOVER_CHANGE'; payload: boolean }
  | { type: 'TOGGLE_FLEXIBLE' }
  | { type: 'CURRENCY_CHANGE'; payload: Currency };

// Component props interface
export interface EnhancedBudgetSliderProps {
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

// Component ref interface
export interface EnhancedBudgetSliderRef {
  getValue: () => number;
  setValue: (value: number) => void;
  getCurrency: () => Currency;
  setCurrency: (currency: Currency) => void;
  toggleFlexible: () => void;
  reset: () => void;
  focus: () => void;
}

// Budget validation rules
export interface BudgetValidationRule {
  name: string;
  validate: (value: number, context?: BudgetValidationContext) => boolean;
  message: string;
  level: ValidationLevel;
}

export interface BudgetValidationContext {
  travelers?: number;
  mode?: BudgetMode;
  currency?: Currency;
  minBudget?: number;
  maxBudget?: number;
}

// Budget slider events for analytics
export interface BudgetSliderEvents {
  'value-change': { value: number; currency: Currency; mode: BudgetMode };
  'drag-start': { initialValue: number; timestamp: number };
  'drag-end': { finalValue: number; timestamp: number; duration: number };
  'flexible-toggle': { isFlexible: boolean; timestamp: number };
  'currency-change': { currency: Currency; previousCurrency: Currency };
  'performance-issue': { type: string; component: string; details: any };
}

// Performance metrics for budget slider
export interface BudgetSliderPerformanceMetrics {
  syncLatency: number;
  dragResponseTime: number;
  renderTime: number;
  memoryUsage: number;
}

// Currency formatting configuration
export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  locale: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

// Budget mode configuration
export interface BudgetModeConfig {
  mode: BudgetMode;
  label: string;
  description: string;
  calculation: (baseAmount: number, travelers: number) => number;
  displayFormat: (amount: number, currency: Currency) => string;
}

// Contract test interface for budget slider
export interface BudgetSliderContractTest {
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

// Flexible budget state
export interface FlexibleBudgetState {
  isEnabled: boolean;
  preservedValue?: number;
  preservedCurrency?: Currency;
  toggleTime: number;
}

// Budget range configuration
export interface BudgetRange {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  currency: Currency;
  suggestions?: number[]; // Common budget amounts
}

// Budget calculation utilities
export interface BudgetCalculations {
  convertCurrency: (amount: number, from: Currency, to: Currency) => Promise<number>;
  calculatePerPerson: (totalBudget: number, travelers: number) => number;
  calculateTotal: (perPersonBudget: number, travelers: number) => number;
  validateBudgetRange: (amount: number, min: number, max: number) => boolean;
  formatCurrency: (amount: number, currency: Currency) => string;
}

// Constitutional compliance for budget slider
export interface BudgetSliderConstitutionalCompliance {
  edgeCompatible: boolean; // No Node.js APIs
  performant: boolean; // <50ms sync, <16ms renders
  accessible: boolean; // WCAG 2.1 AA compliant
  typeSafe: boolean; // Strict TypeScript
  observable: boolean; // Performance monitoring enabled
  costConscious: boolean; // Optimized rendering
}
