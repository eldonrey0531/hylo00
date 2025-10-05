import { NextRequest, NextResponse } from 'next/server';
import { buildGrokItineraryPrompt, generateGrokItineraryDraft } from '@/lib/ai/architectAI';

const SAMPLE_FORM = {
  location: 'Kyoto, Japan',
  plannedDays: 4,
  flexibleDates: false,
  departDate: '2025-11-10',
  returnDate: '2025-11-14',
  adults: 2,
  children: 0,
  travelStyleChoice: 'answer-questions',
  travelStyleAnswers: {
    experience: ['seasoned explorer'],
    vibes: ['culture rich', 'relaxed'],
    sampleDays: ['balanced'],
    dinnerChoices: ['chef tasting menus']
  },
  selectedInterests: ['food', 'history', 'wellness'],
  selectedInclusions: ['airport transfers', 'daily breakfast'],
  tripNickname: 'Autumn Zen Escape',
  tripVibe: 'slow luxury',
  additionalNotes: 'Include at least one traditional tea ceremony and a private onsen experience.'
} as const;

export async function POST(request: NextRequest) {
  const body = await parseJson(request);
  const itineraryInput = body ?? SAMPLE_FORM;

  const prompt = buildGrokItineraryPrompt(itineraryInput as any);
  const result = await generateGrokItineraryDraft({
    prompt,
    formData: itineraryInput as any, // Added required formData parameter
    model: 'grok-4-fast-reasoning',
    temperature: 0.4,
  });

  return NextResponse.json({
    itinerary: result.itinerary,
    metadata: result.metadata,
  });
}

async function parseJson(request: NextRequest) {
  try {
    if (request.headers.get('content-length') === '0') {
      return null;
    }
    return await request.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Failed to parse grok demo payload', message);
    return null;
  }
}
