export interface Destination {
  city: string;
  country: string;
  description?: string;
}

export interface ItineraryFormData {
  destinations: string[];
  startDate: string;
  endDate: string;
  travelGroup: string;
  travelGroupOther?: string; // Added for custom travel group
  groupSize: number;
  budget: number;
  budgetType: 'total' | 'per-person'; // Added to track budget type
  currency: string;
  interests: string[];
  interestsOther?: string; // Added for custom interests
  pace: 'slow' | 'moderate' | 'fast';
  accommodation: 'hotel' | 'airbnb' | 'hostel' | 'resort' | 'camping';
  transportation: string[];
  dietary: string[];
  accessibility: string[];
  activities: string[];
  vibe: string;
  vibeOther?: string; // Added for custom vibe
  preferences: {
    flights: boolean;
    hotels: boolean;
    restaurants: boolean;
    activities: boolean;
    transportation: boolean;
    shopping: boolean;
    nightlife: boolean;
    culture: boolean;
    nature: boolean;
    adventure: boolean;
    relaxation: boolean;
    photography: boolean;
  };
  preferenceDetails?: Record<string, string>; // Added to store preference details
  budgetInfo?: {
    // Added for processed budget information
    amount: number;
    type: 'total' | 'per-person';
    currency: string;
    perPerson: number;
  };
}

export interface DayPlan {
  day: number;
  date: string;
  location: string;
  morning?: Activity;
  afternoon?: Activity;
  evening?: Activity;
  meals: Meal[];
  accommodation?: Accommodation;
  transportation?: Transportation[];
  budget: {
    estimated: number;
    breakdown: Record<string, number>;
  };
  weather?: Weather;
  tips?: string[];
}

export interface Activity {
  name: string;
  description: string;
  duration: string;
  cost: number;
  location: string;
  type: string;
  bookingRequired: boolean;
  bookingUrl?: string;
  tips?: string[];
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurant: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  location: string;
  specialties?: string[];
  dietaryOptions?: string[];
  reservationRequired: boolean;
  reservationUrl?: string;
}

export interface Accommodation {
  name: string;
  type: string;
  address: string;
  pricePerNight: number;
  amenities: string[];
  checkIn: string;
  checkOut: string;
  bookingUrl?: string;
  rating?: number;
  notes?: string;
}

export interface Transportation {
  type: string;
  from: string;
  to: string;
  duration: string;
  cost: number;
  details?: string;
  bookingUrl?: string;
}

export interface Weather {
  temperature: {
    high: number;
    low: number;
  };
  conditions: string;
  precipitation: number;
  recommendations?: string[];
}

export interface Flight {
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  price: number;
  class: 'economy' | 'premium' | 'business' | 'first';
  bookingUrl?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  summary: string;
  destinations: Destination[];
  startDate: string;
  endDate: string;
  duration: number;
  totalBudget: number;
  budgetPerPerson: number;
  groupSize: number;
  days: DayPlan[];
  flights?: Flight[];
  packingList?: string[];
  importantInfo?: {
    visaRequirements?: string[];
    vaccinations?: string[];
    currency?: string;
    language?: string[];
    emergencyContacts?: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentResponse {
  agentName: string;
  data: any;
  confidence: number;
  suggestions?: string[];
  warnings?: string[];
}

export interface GenerationProgress {
  stage: 'initializing' | 'planning' | 'optimizing' | 'finalizing' | 'complete';
  percentage: number;
  currentAgent?: string;
  message: string;
}
