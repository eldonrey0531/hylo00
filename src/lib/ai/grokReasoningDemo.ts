import {
  buildGrokItineraryPrompt,
  generateGrokItineraryDraft,
  type ExtendedTripFormData,
  type GrokDraftResult,
} from './architectAI';
import { BudgetMode, Currency } from '@/types/itinerary/enums';

const DEFAULT_DEMO_FORM: ExtendedTripFormData = {
  location: 'Lisbon, Portugal',
  departDate: '2025-11-08',
  returnDate: '2025-11-11',
  flexibleDates: true,
  plannedDays: 3,
  adults: 2,
  children: 0,
  childrenAges: [],
  budget: 4500,
  currency: Currency.USD,
  budgetMode: BudgetMode.TOTAL,
  flexibleBudget: true,
  selectedGroups: ['couple'],
  customGroupText: null,
  selectedInterests: ['culinary', 'nightlife', 'art'],
  customInterestsText: null,
  selectedInclusions: ['airport transfers', 'daily breakfast'],
  customInclusionsText: null,
  inclusionPreferences: {},
  travelStyleAnswers: {
    experience: ['urban explorer'],
    vibes: ['vibrant', 'coastal'],
    sampleDays: ['high-energy'],
    dinnerChoices: ['chef tasting menus'],
  },
  contactInfo: {},
  travelStyleChoice: 'answer-questions',
  tripNickname: 'Atlantic Nights',
  tripVibe: 'slow luxury',
  additionalNotes: 'Include at least one sunset rooftop cocktail and a private sailing excursion.',
};

export interface GrokReasoningDemoOptions {
  formOverrides?: Partial<ExtendedTripFormData>;
  model?: string;
  temperature?: number;
}

/**
 * Executes a single Grok reasoning request using the repository prompt generator.
 * Pass a custom `formOverrides` object to tweak trip details when testing.
 */
export async function runGrokReasoningDemo({
  formOverrides = {},
  model = 'grok-4-fast-reasoning',
  temperature = 0.4,
}: GrokReasoningDemoOptions = {}): Promise<GrokDraftResult> {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY is required to run the Grok reasoning demo.');
  }

  const mergedForm: ExtendedTripFormData = {
    ...DEFAULT_DEMO_FORM,
    ...formOverrides,
  } as ExtendedTripFormData;

  const prompt = buildGrokItineraryPrompt(mergedForm);

  return generateGrokItineraryDraft({
    prompt,
    model,
    temperature,
  });
}
