// src/components/TravelStyle/types.ts
// Comprehensive shared types and constants for TravelStyle components

// Core preference typesravelStyle/types.ts
// Comprehensive shared types and constants for TravelStyle components

import {
  validateTravelStyleData as zodValidateTravelStyleData,
  validateCoreRequiredSections,
} from '../../schemas/travelStyleSchemas';

// Core preference typesonents/TravelStyle/types.ts
// Comprehensive shared types and constants for TravelStyle components

import {
  validateTravelStyleData,
  validateCoreRequiredSections,
  travelStyleDataSchema,
  type TravelStyleDataType,
} from '../../schemas/travelStyleSchemas';

// Core preference types
export type TravelPace = 'fast' | 'moderate' | 'slow' | 'flexible';
export type ActivityLevel = 'very-active' | 'active' | 'moderate' | 'relaxed';
export type PlanningPreference = 'structured' | 'flexible' | 'spontaneous';
export type BudgetStyle = 'budget' | 'moderate' | 'comfort' | 'luxury';
export type GroupStyle = 'solo' | 'couple' | 'family' | 'friends' | 'mixed';
export type CulturalInterest = 'high' | 'medium' | 'low';
export type TravelExperience = 'first-time' | 'occasional' | 'frequent' | 'expert';
export type PhotoImportance = 'not-important' | 'somewhat' | 'very-important';
export type LocalInteraction = 'minimal' | 'some' | 'immersive';

// Main TravelStyle data interface
export interface TravelStyleData {
  // Core single-select preferences
  pace?: TravelPace;
  activityLevel?: ActivityLevel;
  planningPreference?: PlanningPreference;
  budgetStyle?: BudgetStyle;
  groupStyle?: GroupStyle;
  culturalInterest?: CulturalInterest;
  travelExperience?: TravelExperience;
  photoImportance?: PhotoImportance;
  localInteraction?: LocalInteraction;

  // Multi-select preferences arrays
  accommodationTypes?: string[];
  diningPreferences?: string[];
  transportPreferences?: string[];
  interests?: string[];
  tripPurpose?: string[];
  budgetPriorities?: string[];
  experiencePriorities?: string[];
  accessibility?: string[];
  mustHaves?: string[];
  avoidances?: string[];

  // Form state tracking
  isComplete?: boolean;
  completedSections?: string[];
}

// Base props interface for all TravelStyle form components
export interface BaseStyleFormProps {
  styleData: TravelStyleData;
  onStyleChange: (data: Partial<TravelStyleData>) => void;
  validationErrors?: Record<string, string>;
  onValidation?: (field: string, isValid: boolean, errors?: string[]) => void;
}

// Option interfaces for type safety
export interface OptionItem {
  value: string;
  label: string;
  icon: string;
  description?: string;
}

export interface SelectableOption {
  id: string;
  label: string;
  emoji?: string;
  description?: string;
}

// Travel Pace Options
export const TRAVEL_PACE_OPTIONS: OptionItem[] = [
  {
    value: 'fast',
    label: 'Fast-Paced',
    icon: '🏃',
    description: 'Pack in as much as possible',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    icon: '🚶',
    description: 'Balance of activities and rest',
  },
  {
    value: 'slow',
    label: 'Slow Travel',
    icon: '🧘',
    description: 'Deep dive into fewer places',
  },
  {
    value: 'flexible',
    label: 'Flexible',
    icon: '🔄',
    description: 'Adapt based on mood',
  },
];

// Activity Level Options
export const ACTIVITY_LEVELS: OptionItem[] = [
  {
    value: 'very-active',
    label: 'Very Active',
    icon: '🏔️',
    description: 'Physical challenges daily',
  },
  {
    value: 'active',
    label: 'Active',
    icon: '🥾',
    description: 'Regular activities and exploration',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    icon: '🚴',
    description: 'Mix of active and leisure time',
  },
  {
    value: 'relaxed',
    label: 'Relaxed',
    icon: '🏖️',
    description: 'Minimal physical activity',
  },
];

// Planning Style Options
export const PLANNING_STYLES: OptionItem[] = [
  {
    value: 'structured',
    label: 'Fully Planned',
    icon: '📋',
    description: 'Every detail scheduled',
  },
  {
    value: 'flexible',
    label: 'Flexible',
    icon: '🗺️',
    description: 'Basic plan with room for spontaneity',
  },
  {
    value: 'spontaneous',
    label: 'Spontaneous',
    icon: '🎲',
    description: 'Minimal planning, go with the flow',
  },
];

// Budget Style Options
export const BUDGET_STYLES: OptionItem[] = [
  {
    value: 'budget',
    label: 'Budget',
    icon: '💰',
    description: 'Cost-conscious choices',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    icon: '💳',
    description: 'Balance of value and comfort',
  },
  {
    value: 'comfort',
    label: 'Comfort',
    icon: '💎',
    description: 'Prioritize comfort and convenience',
  },
  {
    value: 'luxury',
    label: 'Luxury',
    icon: '👑',
    description: 'Premium experiences',
  },
];

// Cultural Interest Options
export const CULTURAL_INTEREST_OPTIONS: OptionItem[] = [
  {
    value: 'high',
    label: 'High Interest',
    icon: '🏛️',
    description: 'Deep cultural immersion',
  },
  {
    value: 'medium',
    label: 'Some Interest',
    icon: '🎭',
    description: 'Balanced cultural experiences',
  },
  {
    value: 'low',
    label: 'Minimal Interest',
    icon: '🌆',
    description: 'Focus on other activities',
  },
];

// Accommodation Types
export const ACCOMMODATION_TYPES: SelectableOption[] = [
  { id: 'luxury', label: 'Luxury Hotels', emoji: '⭐' },
  { id: 'boutique', label: 'Boutique Hotels', emoji: '🏩' },
  { id: 'chain', label: 'Chain Hotels', emoji: '🏨' },
  { id: 'bnb', label: 'Bed & Breakfast', emoji: '🏠' },
  { id: 'hostels', label: 'Hostels', emoji: '🛏️' },
  { id: 'vacation-rentals', label: 'Vacation Rentals', emoji: '🏡' },
  { id: 'resorts', label: 'Resorts', emoji: '🏖️' },
  { id: 'camping', label: 'Camping', emoji: '⛺' },
  { id: 'unique', label: 'Unique Stays', emoji: '🏰' },
  { id: 'homestays', label: 'Local Homestays', emoji: '🏘️' },
];

// Dining Preferences
export const DINING_PREFERENCES: SelectableOption[] = [
  { id: 'fine-dining', label: 'Fine Dining', emoji: '🍽️' },
  { id: 'street-food', label: 'Local Street Food', emoji: '🌮' },
  { id: 'casual', label: 'Casual Restaurants', emoji: '🍕' },
  { id: 'markets', label: 'Markets & Food Halls', emoji: '🛒' },
  { id: 'vegetarian', label: 'Vegetarian/Vegan', emoji: '🥗' },
  { id: 'cooking-classes', label: 'Cooking Classes', emoji: '👨‍🍳' },
  { id: 'hotel-dining', label: 'Hotel Restaurants', emoji: '🏨' },
  { id: 'quick-bites', label: 'Quick Bites', emoji: '🥪' },
  { id: 'food-tours', label: 'Food Tours', emoji: '🚌' },
  { id: 'self-catering', label: 'Self-Catering', emoji: '🍳' },
];

// Transport Preferences
export const TRANSPORT_PREFERENCES: SelectableOption[] = [
  { id: 'rental-car', label: 'Rental Car', emoji: '🚗' },
  { id: 'public-transit', label: 'Public Transit', emoji: '🚇' },
  { id: 'walking', label: 'Walking', emoji: '🚶' },
  { id: 'taxi-uber', label: 'Taxi/Uber', emoji: '🚕' },
  { id: 'domestic-flights', label: 'Domestic Flights', emoji: '✈️' },
  { id: 'trains', label: 'Trains', emoji: '🚆' },
  { id: 'bikes-scooters', label: 'Bikes/Scooters', emoji: '🛵' },
  { id: 'private-driver', label: 'Private Driver', emoji: '🚙' },
  { id: 'tour-bus', label: 'Tour Bus', emoji: '🚌' },
  { id: 'boats-ferries', label: 'Boats/Ferries', emoji: '⛴️' },
];

// Travel Interests
export const TRAVEL_INTERESTS: SelectableOption[] = [
  { id: 'history-culture', label: 'History & Culture', emoji: '🏛️' },
  { id: 'adventure-sports', label: 'Adventure Sports', emoji: '🏔️' },
  { id: 'beach-water', label: 'Beach & Water', emoji: '🏖️' },
  { id: 'nature-wildlife', label: 'Nature & Wildlife', emoji: '🦋' },
  { id: 'food-wine', label: 'Food & Wine', emoji: '🍷' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'wellness-spa', label: 'Wellness & Spa', emoji: '🧘‍♀️' },
  { id: 'architecture', label: 'Architecture', emoji: '🏗️' },
  { id: 'local-festivals', label: 'Local Festivals', emoji: '🎭' },
  { id: 'art-museums', label: 'Art & Museums', emoji: '🖼️' },
];

// Trip Purpose Options
export const TRIP_PURPOSES: SelectableOption[] = [
  { id: 'relaxation', label: 'Relaxation', emoji: '😌' },
  { id: 'adventure', label: 'Adventure', emoji: '🎒' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
  { id: 'family-bonding', label: 'Family Bonding', emoji: '👨‍👩‍👧‍👦' },
  { id: 'cultural-exploration', label: 'Cultural Exploration', emoji: '🌍' },
  { id: 'business-leisure', label: 'Business & Leisure', emoji: '💼' },
  { id: 'celebration', label: 'Celebration', emoji: '🎉' },
  { id: 'solo-discovery', label: 'Solo Discovery', emoji: '🧭' },
  { id: 'friends-reunion', label: 'Friends Reunion', emoji: '👯‍♀️' },
  { id: 'honeymoon', label: 'Honeymoon', emoji: '💒' },
];

// Form validation helpers
export const REQUIRED_SECTIONS = [
  'pace',
  'activityLevel',
  'planningPreference',
  'budgetStyle',
  'culturalInterest',
];

export const validateTravelStyleCompletion = (data: TravelStyleData): boolean => {
  return REQUIRED_SECTIONS.every((section) => data[section as keyof TravelStyleData]);
};

export const getTravelStyleProgress = (
  data: TravelStyleData
): { completed: number; total: number; percentage: number } => {
  const completed = REQUIRED_SECTIONS.filter(
    (section) => data[section as keyof TravelStyleData]
  ).length;
  const total = REQUIRED_SECTIONS.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
};
