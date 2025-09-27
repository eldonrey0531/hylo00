import { Priority } from './enums';

export enum ActivityCategory {
  SIGHTSEEING = 'sightseeing',
  DINING = 'dining',
  ENTERTAINMENT = 'entertainment',
  NATURE = 'nature',
  CULTURE = 'culture',
  ADVENTURE = 'adventure',
  RELAXATION = 'relaxation',
  SHOPPING = 'shopping',
  TRANSPORT = 'transport'
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
}

export interface Activity {
  name: string;
  description: string;
  category: ActivityCategory;
  duration: string;
  cost: string;
  location: string;
  bookingRequired: boolean;
  ageAppropriate: string[];
  weatherDependent: boolean;
  priority: Priority;
}

export interface DailyActivity {
  dayNumber: number;
  dateDisplay: string;
  activities: Activity[];
  timeSlots: TimeSlot[];
  tips: string[];
  estimatedCost: number | null;
  notes: string | null;
}
