// Enhanced Date Input Types
// Constitutional compliance: Edge-compatible, type-safe, observable

import React from 'react';
import { ValidationLevel } from './enhanced-form-data';

// Core date input state interface
export interface DateInputState {
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
  validationLevel: ValidationLevel;

  // Accessibility
  ariaLabel: string; // Screen reader label
  ariaDescribedBy?: string; // Associated help text ID
}

// Date input actions interface
export interface DateInputActions {
  setValue: (value: string) => void;
  openPicker: () => void;
  closePicker: () => void;
  setFocus: (focused: boolean) => void;
  validate: () => boolean;
  clearValue: () => void;
}

// Date input validation rules
export interface DateValidationRule {
  name: string;
  validate: (value: string, context?: any) => boolean;
  message: string;
  level: ValidationLevel;
}

// Component props interface
export interface EnhancedDateInputProps {
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

// Component ref interface
export interface EnhancedDateInputRef {
  focus: () => void;
  blur: () => void;
  openPicker: () => void;
  closePicker: () => void;
  validate: () => boolean;
  getValue: () => string;
  setValue: (value: string) => void;
  reset: () => void;
}

// State transitions for date input
export type DateInputEvent =
  | { type: 'VALUE_CHANGE'; payload: string }
  | { type: 'PICKER_OPEN' }
  | { type: 'PICKER_CLOSE' }
  | { type: 'FOCUS_CHANGE'; payload: boolean }
  | { type: 'VALIDATE' }
  | { type: 'CLEAR' };

// Date input events for analytics
export interface DateInputEvents {
  'value-change': { value: string; isValid: boolean };
  'picker-open': { timestamp: number };
  'picker-close': { timestamp: number; hasSelection: boolean };
  'validation-change': { isValid: boolean; message?: string; level: ValidationLevel };
  'focus-change': { hasFocus: boolean; source: 'mouse' | 'keyboard' | 'programmatic' };
}

// Performance metrics for date input
export interface DateInputPerformanceMetrics {
  pickerOpenTime: number;
  validationTime: number;
  renderTime: number;
  interactionLatency: number;
}

// Date formatting utilities type
export interface DateFormatting {
  parse: (dateStr: string) => Date | null;
  format: (date: Date) => string;
  validate: (dateStr: string) => boolean;
  isInFuture: (dateStr: string) => boolean;
  isValidRange: (startDate: string, endDate: string) => boolean;
}

// Date range validation context
export interface DateRangeContext {
  departDate?: string;
  returnDate?: string;
  minDate?: string;
  maxDate?: string;
  allowPastDates?: boolean;
}

// Enhanced date input with flexible mode support
export interface FlexibleDateInputState extends DateInputState {
  isFlexible: boolean;
  flexibleDuration?: number; // Days
  flexibleLabel?: string;
}

export interface FlexibleDateInputProps extends EnhancedDateInputProps {
  enableFlexibleMode?: boolean;
  onFlexibleToggle?: (isFlexible: boolean) => void;
  flexibleDuration?: number;
  onDurationChange?: (days: number) => void;
}

// Contract test interface for date input
export interface DateInputContractTest {
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

// Constitutional compliance for date input
export interface DateInputConstitutionalCompliance {
  edgeCompatible: boolean; // No Node.js APIs
  performant: boolean; // <16ms renders, <50ms interactions
  accessible: boolean; // WCAG 2.1 AA compliant
  typeSafe: boolean; // Strict TypeScript
  observable: boolean; // Performance monitoring enabled
}
