// Enhanced Travel Style Types
// Constitutional compliance: Edge-compatible, type-safe, observable

import { TravelStyleChoice, ValidationLevel } from './enhanced-form-data';

// Core travel style state interface
export interface TravelStyleState {
  // Progressive disclosure control
  showSelectionButtons: boolean; // Initial choice buttons visible
  userChoice: TravelStyleChoice; // User's selection

  // Section visibility
  showAllSections: boolean; // All travel style sections visible
  completedSections: string[]; // Sections user has completed

  // Navigation state
  canSkipToNickname: boolean; // Skip button availability
  navigationPath: string[]; // User's navigation history

  // Form data preservation
  preservedData: TravelStyleData; // Data saved during navigation
  isDirty: boolean; // Unsaved changes exist
}

// Travel style actions interface
export interface TravelStyleActions {
  makeChoice: (choice: TravelStyleChoice) => void;
  showAllSections: () => void;
  skipToNickname: () => void;
  markSectionComplete: (section: string) => void;
  preserveData: (data: Partial<TravelStyleData>) => void;
  resetState: () => void;
}

// Travel style data structure
export interface TravelStyleData {
  experience: string[];
  vibes: string[];
  sampleDays: string[];
  dinnerChoices: string[];
  customTexts: Record<string, string>;
}

// Travel style events for state management
export type TravelStyleEvent =
  | { type: 'MAKE_CHOICE'; payload: TravelStyleChoice }
  | { type: 'SHOW_ALL_SECTIONS' }
  | { type: 'SKIP_TO_NICKNAME' }
  | { type: 'SECTION_COMPLETE'; payload: string }
  | { type: 'PRESERVE_DATA'; payload: Partial<TravelStyleData> }
  | { type: 'RESET' };

// Component props interface
export interface TravelStyleProgressiveDisclosureProps {
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

// Component ref interface
export interface TravelStyleProgressiveDisclosureRef {
  makeChoice: (choice: TravelStyleChoice) => void;
  showAllSections: () => void;
  skipToNickname: () => void;
  getCurrentStep: () => string;
  getPreservedData: () => Partial<TravelStyleData>;
  reset: () => void;
}

// Travel style section configuration
export interface TravelStyleSection {
  id: string;
  title: string;
  description?: string;
  fields: TravelStyleField[];
  required: boolean;
  order: number;
}

// Field configuration for travel style sections
export interface TravelStyleField {
  name: string;
  label: string;
  type: 'multi-select' | 'single-select' | 'text' | 'textarea';
  options?: string[] | { value: string; label: string; description?: string }[];
  placeholder?: string;
  validation?: TravelStyleFieldValidation;
  customizable?: boolean; // Allow "Other" or custom text
}

export interface TravelStyleFieldValidation {
  minSelections?: number;
  maxSelections?: number;
  maxLength?: number;
  required?: boolean;
  custom?: (value: any) => boolean | string;
}

// Predefined travel style options
export interface TravelStyleOptions {
  experience: ExperienceOption[];
  vibes: VibeOption[];
  sampleDays: SampleDayOption[];
  dinnerChoices: DinnerOption[];
}

export interface ExperienceOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface VibeOption {
  value: string;
  label: string;
  description?: string;
  color?: string;
}

export interface SampleDayOption {
  value: string;
  label: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all-day';
  activity?: string;
}

export interface DinnerOption {
  value: string;
  label: string;
  priceRange?: 'budget' | 'mid-range' | 'upscale' | 'luxury';
  cuisine?: string;
}

// Progress tracking for travel style
export interface TravelStyleProgress {
  sectionsCompleted: number;
  totalSections: number;
  completionPercentage: number;
  estimatedTimeRemaining?: number;
  currentSection?: string;
}

// Travel style events for analytics
export interface TravelStyleEvents {
  'choice-made': { choice: TravelStyleChoice; timestamp: number };
  'section-complete': { section: string; data: any; timestamp: number };
  'data-preserved': { section: string; data: any; timestamp: number };
  'navigation-change': { from: string; to: string; timestamp: number };
  'skip-to-nickname': { preservedData: Partial<TravelStyleData>; timestamp: number };
}

// Choice button configuration
export interface ChoiceButtonConfig {
  choice: TravelStyleChoice;
  text: string;
  description?: string;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

// Navigation configuration
export interface NavigationConfig {
  showBackButton: boolean;
  showProgressIndicator: boolean;
  allowSkipping: boolean;
  confirmOnBack: boolean;
  saveDataOnNavigation: boolean;
}

// Contract test interface for travel style component
export interface TravelStyleContractTest {
  testName: string;
  props: TravelStyleProgressiveDisclosureProps;
  expectedBehavior: {
    showsChoiceButtons: boolean;
    handlesChoiceSelection: boolean;
    preservesData: boolean;
    allowsSkipping: boolean;
    tracksProgress: boolean;
  };
  userJourneyTests: {
    answerQuestionsFlow: boolean;
    skipAheadFlow: boolean;
    dataPreservation: boolean;
    backNavigation: boolean;
  };
}

// Data preservation utilities
export interface DataPreservation {
  save: (key: string, data: Partial<TravelStyleData>) => void;
  load: (key: string) => Partial<TravelStyleData> | null;
  clear: (key: string) => void;
  merge: (existing: Partial<TravelStyleData>, updated: Partial<TravelStyleData>) => TravelStyleData;
}

// Performance metrics for travel style component
export interface TravelStylePerformanceMetrics {
  choiceSelectionTime: number;
  sectionRenderTime: number;
  dataPreservationTime: number;
  navigationTime: number;
  totalInteractionTime: number;
}

// Validation for travel style data
export interface TravelStyleValidation {
  validateSection: (section: string, data: any) => ValidationResult;
  validateComplete: (data: TravelStyleData) => ValidationResult;
  getValidationErrors: (data: Partial<TravelStyleData>) => Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: ValidationLevel;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Constitutional compliance for travel style component
export interface TravelStyleConstitutionalCompliance {
  edgeCompatible: boolean; // No Node.js APIs
  performant: boolean; // <100ms interactions, smooth transitions
  accessible: boolean; // WCAG 2.1 AA compliant, keyboard navigation
  typeSafe: boolean; // Strict TypeScript, validated data
  observable: boolean; // Progress tracking, performance monitoring
}
