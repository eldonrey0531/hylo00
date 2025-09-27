import { Currency, BudgetMode } from './enums';

interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  subscribe?: boolean;
}

export interface TripFormData {
  location: string;
  departDate: string | null;
  returnDate: string | null;
  flexibleDates: boolean;
  plannedDays: number | null;
  adults: number;
  children: number;
  childrenAges: number[];
  budget: number;
  currency: Currency;
  budgetMode: BudgetMode;
  flexibleBudget: boolean;
  selectedGroups: string[];
  customGroupText: string | null;
  selectedInterests: string[];
  customInterestsText: string | null;
  selectedInclusions: string[];
  customInclusionsText: string | null;
  inclusionPreferences: Record<string, any>;
  travelStyleAnswers: Record<string, any>;
  contactInfo: ContactInfo;
}

