// Enhanced Form Data Types for Form UI Enhancement
// Extends existing FormData with new fields for enhanced functionality

// Currency type definition
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

// Enhanced FormData interface extending the existing one
export interface EnhancedFormData {
  // Existing fields preserved
  location: string;
  departDate: string;
  returnDate: string;
  flexibleDates: boolean;
  plannedDays?: number;
  adults: number;
  children: number;
  childrenAges: number[];
  budget: number;
  currency: Currency;

  // New enhanced fields
  flexibleBudget?: boolean;
  accommodationOther?: string;
  rentalCarPreferences?: string[];
  travelStyleChoice?: TravelStyleChoice;
  travelStyleAnswers?: TravelStyleAnswers;
}

// Supporting types for enhanced functionality
export type TravelStyleChoice = 'answer-questions' | 'skip-to-details' | 'not-selected';

export interface TravelStyleAnswers {
  [key: string]: any; // Flexible structure for travel style responses
}

// Validation level for form fields
export type ValidationLevel = 'none' | 'warning' | 'error';

// Inclusion types for preference modal
export type InclusionType =
  | 'flights'
  | 'accommodations'
  | 'rental-car'
  | 'activities'
  | 'dining'
  | 'entertainment'
  | 'train-tickets'
  | 'travel-insurance';

// Budget mode types
export type BudgetMode = 'total' | 'per-person';

// Travel style question interface
export interface TravelStyleQuestion {
  id: string;
  title: string;
  type: 'single-select' | 'multi-select' | 'text' | 'scale';
  options?: string[];
  required: boolean;
  description?: string;
}

// Form interaction event types
export interface FormInteractionEvent {
  type: string;
  component: string;
  timestamp: number;
  data?: any;
}

// Performance metrics interface
export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  interactionLatency: number;
  memoryUsage?: number;
}
