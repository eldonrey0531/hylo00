/**
 * Type Contracts: Travel Style Choice System
 * Feature: 003-group-travel-style
 * Generated: September 19, 2025
 */

// Core choice enumeration
export enum TravelStyleChoice {
  NOT_SELECTED = 'not-selected',
  DETAILED = 'detailed',
  SKIP = 'skip'
}

// Choice state management
export interface ConditionalDisplayState {
  choice: TravelStyleChoice;
  showDetailedForms: boolean;
  showNicknameOnly: boolean;
  preservedFormData: Partial<TravelStyleData>;
  isChoiceMade: boolean;
}

// Button configuration for choice selection
export interface ChoiceButtonConfig {
  id: string;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  onClick: () => void;
  isRecommended?: boolean;
  disabled?: boolean;
}

// Component prop interfaces
export interface TravelStyleChoiceProps {
  onChoiceSelect: (choice: TravelStyleChoice) => void;
  disabled?: boolean;
  className?: string;
}

export interface ConditionalTravelStyleProps {
  // Existing form data (preserved for compatibility)
  formData: any;
  onFormChange: (data: any) => void;
  
  // Travel style specific props
  selectedExperience: string[];
  onExperienceChange: (experience: string[]) => void;
  selectedVibes: string[];
  onVibeChange: (vibes: string[]) => void;
  customVibesText: string;
  onCustomVibesChange: (text: string) => void;
  selectedSampleDays: string[];
  onSampleDaysChange: (days: string[]) => void;
  dinnerChoices: string[];
  onDinnerChoicesChange: (choices: string[]) => void;
  tripNickname: string;
  onTripNicknameChange: (nickname: string) => void;
  contactInfo: any;
  onContactChange: (contact: any) => void;
}

// Event handler contracts
export interface TravelStyleChoiceHandlers {
  handleChoiceSelect: (choice: TravelStyleChoice) => void;
  handleFormDataPreservation: (data: Partial<TravelStyleData>) => void;
  handlePathNavigation: (path: 'detailed' | 'skip') => void;
}

// Form data preservation contract
export interface FormDataPreservation {
  preserveData: (data: any) => void;
  restoreData: () => any;
  clearData: () => void;
  hasPreservedData: () => boolean;
}

// Choice button styling contract (matches GenerateItineraryButton pattern)
export interface ChoiceButtonStyling {
  containerClass: string; // bg-gradient-to-r from-primary to-[#2a4552] rounded-[36px] p-8 text-white
  buttonClass: string;    // bg-white text-primary hover:shadow-2xl border-4 border-white
  iconClass: string;      // h-6 w-6
  labelClass: string;     // font-bold font-raleway text-xl
  disabledClass: string;  // bg-white/20 text-white/60 cursor-not-allowed
}

// Integration contract with App.tsx
export interface AppIntegrationContract {
  // Required state additions
  travelStyleChoice: TravelStyleChoice;
  setTravelStyleChoice: (choice: TravelStyleChoice) => void;
  
  // Preserved existing state (no modifications)
  formData: any;
  setFormData: (data: any) => void;
  selectedExperience: string[];
  setSelectedExperience: (exp: string[]) => void;
  selectedVibes: string[];
  setSelectedVibes: (vibes: string[]) => void;
  customVibesText: string;
  setCustomVibesText: (text: string) => void;
  selectedSampleDays: string[];
  setSelectedSampleDays: (days: string[]) => void;
  dinnerChoices: string[];
  setDinnerChoices: (choices: string[]) => void;
  tripNickname: string;
  setTripNickname: (nickname: string) => void;
  contactInfo: any;
  setContactInfo: (contact: any) => void;
}

// Component rendering contracts
export interface ConditionalRenderingContract {
  renderChoiceButtons: () => JSX.Element;
  renderDetailedForms: () => JSX.Element;
  renderNicknameOnly: () => JSX.Element;
  renderGenerateButton: () => JSX.Element;
  shouldShowChoice: () => boolean;
  shouldShowDetailed: () => boolean;
  shouldShowSkip: () => boolean;
}

// Validation contracts
export interface ChoiceValidationContract {
  validateChoice: (choice: TravelStyleChoice) => boolean;
  validateDetailedPath: (data: TravelStyleData) => ValidationResult;
  validateSkipPath: (nickname: string) => ValidationResult;
  canProceedToGenerate: (choice: TravelStyleChoice, data: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Existing types (referenced for completeness)
export interface TravelStyleData {
  experience: string[];
  vibes: string[];
  vibesOther?: string;
  sampleDays: string[];
  dinnerChoices: string[];
  customTexts: Record<string, string>;
}

export interface TripNicknameData {
  tripNickname: string;
  contactInfo: any;
}