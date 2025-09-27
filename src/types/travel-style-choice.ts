// Core choice enumeration for user's travel style preference path
export enum TravelStyleChoice {
  NOT_SELECTED = 'not-selected',
  DETAILED = 'detailed',
  SKIP = 'skip'
}

// Component props for travel style choice selection
export interface TravelStyleChoiceProps {
  onChoiceSelect: (choice: TravelStyleChoice) => void;
  disabled?: boolean;
  className?: string;
}

// Props for conditional travel style component
export interface ConditionalTravelStyleProps {
  choice: TravelStyleChoice;
  onChoiceChange: (choice: TravelStyleChoice) => void;
  formData: any; // Using any to match FormData from TripDetails
  onFormChange: (data: any) => void;
  onGenerateItinerary?: () => void;
  selectedExperience?: string[];
  onExperienceChange?: (experience: string[]) => void;
  selectedVibes?: string[];
  onVibeChange?: (vibes: string[]) => void;
  customVibesText?: string;
  onCustomVibesChange?: (text: string) => void;
  selectedSampleDays?: string[];
  onSampleDaysChange?: (days: string[]) => void;
  dinnerChoices?: string[];
  onDinnerChoicesChange?: (choices: string[]) => void;
  tripNickname?: string;
  onTripNicknameChange?: (nickname: string) => void;
  contactInfo?: ContactInfo;
  onContactChange?: (contact: ContactInfo) => void;
  disabled?: boolean;
  validationErrors?: { [key: string]: string[] };
}

// Travel style form data structure
export interface TravelStyleData {
  experience: string[];
  vibes: string[];
  sampleDays: string[];
  dinnerChoices: string[];
  tripNickname: string;
  customTexts: Record<string, string>;
}

// Contact information structure
export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  subscribe?: boolean;
}
