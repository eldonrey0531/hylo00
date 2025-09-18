// Enhanced Preference Modal Types
// Constitutional compliance: Edge-compatible, type-safe, observable

import { InclusionType, ValidationLevel } from './enhanced-form-data';
import { z } from 'zod';

// Core preference modal state interface
export interface PreferenceModalState {
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

// Preference modal actions interface
export interface PreferenceModalActions {
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

// Preference modal events for state management
export type PreferenceModalEvent =
  | { type: 'OPEN_MODAL'; payload: InclusionType }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: any } }
  | { type: 'TOGGLE_OTHER' }
  | { type: 'SET_OTHER_VALUE'; payload: string }
  | { type: 'ADD_MULTI_SELECT'; payload: string }
  | { type: 'REMOVE_MULTI_SELECT'; payload: string }
  | { type: 'VALIDATE' }
  | { type: 'RESET' };

// Component props interface
export interface EnhancedPreferenceModalProps {
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
  validationSchema?: z.ZodSchema<any>;
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

// Component ref interface
export interface EnhancedPreferenceModalRef {
  open: () => void;
  close: () => void;
  validate: () => boolean;
  getFormData: () => Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  resetForm: () => void;
  focusFirstField: () => void;
}

// Specific preference schemas

// Accommodation preferences
export interface AccommodationPreferences {
  types: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  location?: string;
  amenities: string[];
  accessibility: string[];
  other?: string;
}

// Rental car preferences
export interface RentalCarPreferences {
  vehicleTypes: string[]; // Multi-select
  transmission: 'automatic' | 'manual' | 'no-preference';
  features: string[];
  insurance?: {
    level: 'basic' | 'comprehensive' | 'premium';
    addOns: string[];
  };
  other?: string;
}

// Flight preferences
export interface FlightPreferences {
  seatClass: 'economy' | 'premium-economy' | 'business' | 'first';
  airlines: string[];
  maxLayovers: number;
  departureTimePreference: 'morning' | 'afternoon' | 'evening' | 'no-preference';
  other?: string;
}

// Activities preferences
export interface ActivityPreferences {
  types: string[];
  intensity: 'low' | 'moderate' | 'high' | 'mixed';
  group: 'individual' | 'small-group' | 'large-group' | 'no-preference';
  duration: 'half-day' | 'full-day' | 'multi-day' | 'flexible';
  other?: string;
}

// Union type for all preference types
export type PreferenceData =
  | AccommodationPreferences
  | RentalCarPreferences
  | FlightPreferences
  | ActivityPreferences
  | Record<string, any>; // Generic fallback

// Modal configuration for each inclusion type
export interface PreferenceModalConfig {
  inclusionType: InclusionType;
  title: string;
  description?: string;
  fields: PreferenceField[];
  validationSchema: z.ZodSchema<any>;
  enableOtherInput: boolean;
  multiSelectFields: string[];
}

// Field configuration for preference forms
export interface PreferenceField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'multi-select' | 'checkbox' | 'radio' | 'range' | 'textarea';
  options?: string[] | { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  validation?: PreferenceFieldValidation;
}

export interface PreferenceFieldValidation {
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// Preference modal events for analytics
export interface PreferenceModalEvents {
  'modal-open': { inclusionType: InclusionType; timestamp: number };
  'modal-close': { inclusionType: InclusionType; hasChanges: boolean; timestamp: number };
  'form-change': { field: string; value: any; isValid: boolean };
  'validation-error': { field: string; message: string; level: ValidationLevel };
  'other-input-toggle': { visible: boolean; inclusionType: InclusionType };
  'multi-select-change': { field: string; values: string[]; action: 'add' | 'remove' };
}

// Focus management for modals
export interface FocusManagement {
  firstFocusable?: HTMLElement;
  lastFocusable?: HTMLElement;
  previouslyFocused?: HTMLElement;
  trapEnabled: boolean;
}

// Contract test interface for preference modal
export interface PreferenceModalContractTest {
  testName: string;
  props: EnhancedPreferenceModalProps;
  expectedBehavior: {
    rendersInteractiveElements: boolean;
    handlesOtherInput: boolean;
    supportsMultiSelect: boolean;
    trapsFocus: boolean;
    validatesData: boolean;
  };
  accessibilityRequirements: {
    hasProperARIA: boolean;
    keyboardNavigable: boolean;
    screenReaderCompatible: boolean;
  };
}

// Error handling for preference modals
export interface PreferenceModalError {
  type: 'validation' | 'interaction' | 'focus' | 'data';
  field?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  recoverable: boolean;
}

// Performance metrics for preference modal
export interface PreferenceModalPerformanceMetrics {
  openTime: number;
  closeTime: number;
  formValidationTime: number;
  focusTrapSetupTime: number;
  renderTime: number;
}

// Constitutional compliance for preference modal
export interface PreferenceModalConstitutionalCompliance {
  edgeCompatible: boolean; // No Node.js APIs
  performant: boolean; // <100ms interactions
  accessible: boolean; // WCAG 2.1 AA compliant
  typeSafe: boolean; // Strict TypeScript + Zod validation
  observable: boolean; // Performance monitoring enabled
}
