/**
 * Component API Contracts: Travel Style Choice System
 * Feature: 003-group-travel-style
 * Generated: September 19, 2025
 */

import { TravelStyleChoice, ConditionalDisplayState, ChoiceButtonConfig } from './types';

/**
 * TravelStyleChoice Component API Contract
 * 
 * Purpose: Displays two choice buttons using GenerateItineraryButton styling
 * Responsibilities: Choice selection, button styling, user interaction
 */
export interface TravelStyleChoiceAPI {
  // Props
  props: {
    onChoiceSelect: (choice: TravelStyleChoice) => void;
    disabled?: boolean;
    className?: string;
  };

  // Public Methods (testable behaviors)
  methods: {
    handleDetailedChoice: () => void;
    handleSkipChoice: () => void;
    getButtonConfigs: () => ChoiceButtonConfig[];
  };

  // Events Emitted
  events: {
    'choice:selected': { choice: TravelStyleChoice; timestamp: number };
    'button:clicked': { buttonId: string; choice: TravelStyleChoice };
  };

  // Styling Contract (matches GenerateItineraryButton)
  styling: {
    container: 'bg-gradient-to-br from-[#406170] to-[#2a4552] rounded-[36px] p-8 text-white';
    button: 'bg-white text-primary hover:shadow-2xl hover:shadow-white/30 border-4 border-white';
    buttonHover: 'transform hover:scale-105 transition-all duration-300';
    buttonFont: 'font-bold font-raleway text-xl';
    icon: 'h-6 w-6';
    spacing: 'px-12 py-6 rounded-[20px]';
  };
}

/**
 * ConditionalTravelStyle Component API Contract
 * 
 * Purpose: Container component managing conditional form display
 * Responsibilities: State management, form rendering, integration
 */
export interface ConditionalTravelStyleAPI {
  // Props (extensive due to form integration requirements)
  props: {
    // Choice state
    choice: TravelStyleChoice;
    onChoiceChange: (choice: TravelStyleChoice) => void;
    
    // Form data (existing patterns preserved)
    formData: any;
    onFormChange: (data: any) => void;
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
  };

  // Public Methods
  methods: {
    getDisplayState: () => ConditionalDisplayState;
    shouldRenderDetailedForms: () => boolean;
    shouldRenderNicknameOnly: () => boolean;
    preserveFormData: (data: any) => void;
    restoreFormData: () => any;
  };

  // Internal State Contract
  state: {
    displayState: ConditionalDisplayState;
    preservedData: Partial<any>;
    hasUserInteracted: boolean;
  };

  // Rendering Rules
  rendering: {
    'NOT_SELECTED': ['TravelStyleChoice'];
    'DETAILED': ['TravelExperience', 'TripVibe', 'SampleDays', 'DinnerChoice', 'TripNickname', 'GenerateItineraryButton'];
    'SKIP': ['TripNickname', 'GenerateItineraryButton'];
  };
}

/**
 * App.tsx Integration Contract
 * 
 * Purpose: Defines integration points with existing App component
 * Responsibilities: State management, event handling, data flow
 */
export interface AppTravelStyleIntegration {
  // Required State Additions
  newState: {
    travelStyleChoice: TravelStyleChoice;
  };

  // Required Event Handlers
  newHandlers: {
    handleTravelStyleChoice: (choice: TravelStyleChoice) => void;
  };

  // Preserved State (no modifications)
  preservedState: {
    formData: any;
    selectedExperience: string[];
    selectedVibes: string[];
    customVibesText: string;
    selectedSampleDays: string[];
    dinnerChoices: string[];
    tripNickname: string;
    contactInfo: any;
    // ... all existing state variables
  };

  // Preserved Handlers (no modifications)
  preservedHandlers: {
    setFormData: (data: any) => void;
    setSelectedExperience: (exp: string[]) => void;
    setSelectedVibes: (vibes: string[]) => void;
    setCustomVibesText: (text: string) => void;
    setSelectedSampleDays: (days: string[]) => void;
    setDinnerChoices: (choices: string[]) => void;
    setTripNickname: (nickname: string) => void;
    setContactInfo: (contact: any) => void;
    handleGenerateItinerary: () => void;
    // ... all existing handlers
  };

  // Integration Points (line numbers approximate)
  replacementSections: {
    travelStyleHeader: { start: 124, end: 132 }; // Preserve header
    travelStyleDescription: { start: 133, end: 142 }; // Include in choice
    travelStyleForms: { start: 143, end: 200 }; // Replace with conditional
    generateButton: { start: 206, end: 206 }; // Move inside conditional
  };
}

/**
 * Form Component Integration Contract
 * 
 * Purpose: Ensures existing form components work within conditional system
 * Responsibilities: Props compatibility, styling preservation
 */
export interface FormComponentIntegration {
  // Components requiring NO changes
  unchanged: {
    TravelExperience: {
      props: ['selectedExperience', 'onSelectionChange'];
      styling: 'bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200';
    };
    TripVibe: {
      props: ['selectedVibes', 'onSelectionChange', 'otherText', 'onOtherTextChange'];
      styling: 'bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200';
    };
    SampleDays: {
      props: ['selectedDays', 'onSelectionChange'];
      styling: 'bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200';
    };
    DinnerChoice: {
      props: ['selectedChoice', 'onSelectionChange'];
      styling: 'bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200';
    };
    TripNickname: {
      props: ['tripNickname', 'onNicknameChange', 'contactInfo', 'onContactChange'];
      styling: 'bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200';
    };
    GenerateItineraryButton: {
      props: ['isSubmitting', 'onClick'];
      styling: 'w-full px-8 py-4 rounded-[36px] font-raleway font-bold text-xl';
    };
  };

  // Wrapper Contract (conditional rendering only)
  wrapper: {
    preservation: {
      allProps: 'MUST be passed through unchanged';
      styling: 'MUST be preserved exactly';
      functionality: 'MUST work identically to current implementation';
    };
  };
}

/**
 * Test Contract Specifications
 * 
 * Purpose: Defines testable behaviors for each component
 * Responsibilities: Component isolation, integration testing, user flows
 */
export interface TestContracts {
  // Unit Test Contracts
  unit: {
    TravelStyleChoice: {
      'renders two choice buttons': void;
      'calls onChoiceSelect with DETAILED when first button clicked': void;
      'calls onChoiceSelect with SKIP when second button clicked': void;
      'applies disabled state correctly': void;
      'matches GenerateItineraryButton styling': void;
    };
    ConditionalTravelStyle: {
      'renders choice component when choice is NOT_SELECTED': void;
      'renders detailed forms when choice is DETAILED': void;
      'renders nickname only when choice is SKIP': void;
      'preserves form data during choice changes': void;
      'passes all props correctly to child components': void;
    };
  };

  // Integration Test Contracts
  integration: {
    'App.tsx with ConditionalTravelStyle': {
      'preserves all existing form functionality': void;
      'maintains generate button behavior': void;
      'handles choice state changes correctly': void;
      'preserves form validation': void;
    };
  };

  // E2E Test Contracts
  e2e: {
    'User chooses detailed path': {
      'can complete all forms and generate itinerary': void;
      'form data persists through session': void;
    };
    'User chooses skip path': {
      'can enter nickname and generate itinerary': void;
      'skips detailed forms correctly': void;
    };
  };
}