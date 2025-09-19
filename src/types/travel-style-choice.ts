/**
 * Travel Style Choice Types
 * Feature: 003-group-travel-style
 * 
 * Type definitions for the conditional travel style section system.
 * Provides enum-based choice states and component prop interfaces.
 */

// Core choice enumeration for user's travel style preference path
export enum TravelStyleChoice {
  NOT_SELECTED = 'not-selected',
  DETAILED = 'detailed',
  SKIP = 'skip'
}

// State management for conditional display logic
export interface ConditionalDisplayState {
  choice: TravelStyleChoice;
  showDetailedForms: boolean;
  showNicknameOnly: boolean;
  preservedFormData: Partial<TravelStyleData>;
  isChoiceMade: boolean;
}

// Button configuration for choice selection using GenerateItineraryButton pattern
export interface ChoiceButtonConfig {
  id: string;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  onClick: () => void;
  isRecommended?: boolean;
  disabled?: boolean;
}

// Props for TravelStyleChoice component
export interface TravelStyleChoiceProps {
  onChoiceSelect: (choice: TravelStyleChoice) => void;
  disabled?: boolean;
  className?: string;
}

// Props for ConditionalTravelStyle component (preserves existing form patterns)
export interface ConditionalTravelStyleProps {
  // Choice state management
  choice: TravelStyleChoice;
  onChoiceChange: (choice: TravelStyleChoice) => void;
  
  // Existing form data (preserved for compatibility)
  formData: any;
  onFormChange: (data: any) => void;
  
  // Travel style specific props (existing patterns)
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
  
  // Component state
  disabled?: boolean;
  contactInfo: any;
  onContactChange: (contact: any) => void;
  
  // Itinerary generation functionality
  onGenerateItinerary?: () => void;
  isGenerating?: boolean;
}

// Existing travel style data interface (for reference and type safety)
export interface TravelStyleData {
  experience: string[];
  vibes: string[];
  vibesOther?: string;
  sampleDays: string[];
  dinnerChoices: string[];
  customTexts: Record<string, string>;
}

// T003: Enhanced travel style data interface for comprehensive data gathering
export interface EnhancedTravelStyleData {
  // Travel experience level options
  travelExperience: string[];
  
  // Trip vibe preferences with Other option
  tripVibes: string[];
  customVibeText?: string;
  
  // Sample travel days selections
  sampleDays: string[];
  
  // Dinner preference selections
  dinnerPreferences: string[];
  
  // Additional custom responses
  customTexts?: Record<string, string>;
}

// T003: Budget configuration interface
export interface BudgetConfiguration {
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  mode: 'total' | 'per-person';
  isFlexible: boolean;
  calculatedPerPerson?: number;
  calculatedTotal?: number;
}

// T003: Selection with Other option pattern interface
export interface SelectionWithOther {
  predefinedSelections: string[];
  hasOtherSelected: boolean;
  customText?: string;
}

// T003: Contact information interface (simplified)
export interface ContactInformation {
  tripNickname: string;
  name: string;
  email: string;
}

// Trip nickname data interface (for reference)
export interface TripNicknameData {
  tripNickname: string;
  contactInfo: any;
}

// Styling contract to ensure consistency with GenerateItineraryButton
export interface ChoiceButtonStyling {
  containerClass: string; // bg-gradient-to-br from-[#406170] to-[#2a4552] rounded-[36px] p-8 text-white
  buttonClass: string;    // bg-white text-primary hover:shadow-2xl border-4 border-white
  iconClass: string;      // h-6 w-6
  labelClass: string;     // font-bold font-raleway text-xl
  disabledClass: string;  // bg-white/20 text-white/60 cursor-not-allowed
}