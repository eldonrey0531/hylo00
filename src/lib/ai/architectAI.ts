import { logger } from '@/utils/console-logger';

import {
  addUtcDays,
  computeInferredDayCount,
  formatIsoDate,
  parseIsoDate,
  resolveRecommendationCategories,
  type ExtendedTripFormData,
} from './itineraryShared';
import { validateItineraryPayload } from './itinerarySchema';

export type { ExtendedTripFormData } from './itineraryShared';

type FallbackSource = 'none' | 'parsed-content' | 'tool-call' | 'reasoning';

const GROK_MODEL = 'grok-4-fast-reasoning';
const XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';


/**
 * Builds a dynamic system prompt based on the user's form data
 * Only includes relevant instructions for what they actually provided
 */
function buildSystemPrompt(formData: ExtendedTripFormData): string {
  const parts: string[] = [];

  parts.push("You are Hylo's AI Itinerary Architect, a professional travel concierge creating personalized itineraries.");

  const hasFlexibleDates = formData.flexibleDates === true;
  const selectedInclusions = Array.isArray(formData.selectedInclusions)
    ? (formData.selectedInclusions as unknown[])
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value): value is string => Boolean(value))
    : [];

  const departDate = parseIsoDate((formData as Record<string, unknown>).departDate);
  const returnDate = parseIsoDate((formData as Record<string, unknown>).returnDate);
  const inferredDayCount = Math.max(1, Math.min(21, computeInferredDayCount(formData, departDate, returnDate)));

  const calendarGuidance: string[] = [];
  if (!hasFlexibleDates && departDate) {
    for (let index = 0; index < inferredDayCount; index += 1) {
      calendarGuidance.push(`- Day ${index + 1}: ${formatIsoDate(addUtcDays(departDate, index))}`);
    }
  }

  const currency =
    typeof (formData as Record<string, unknown>).currency === 'string' &&
    (formData as Record<string, unknown>).currency
      ? String((formData as Record<string, unknown>).currency).trim()
      : 'USD';

  const recommendationCategories = resolveRecommendationCategories(formData);

  if (calendarGuidance.length > 0) {
    parts.push(
      `Trip calendar:\n${calendarGuidance.join('\n')}\nUse these ISO dates exactly for each "date" field. Continue sequentially if you add additional days.`,
    );
  } else if (hasFlexibleDates) {
    parts.push(
      `Dates are flexible. Omit the "date" property and label days sequentially (Day 1 … Day ${inferredDayCount}).`,
    );
  } else {
    parts.push(
      'Calendar information is incomplete. Only include a "date" field when you can guarantee it is correct; otherwise omit it.',
    );
  }

  parts.push(
    `Daily plan target: Produce ${inferredDayCount} fully detailed dailyPlans unless traveler context clearly demands otherwise. Explain any adjustment inside creationProcess.`,
  );

  parts.push(`
Output Format: Return ONLY valid JSON (no markdown, no explanations). The payload MUST satisfy the following TypeScript types:

type CreationProcessEntry = string;

interface CreationProcess {
  inputsUsed: CreationProcessEntry[];
  reasoningSteps: CreationProcessEntry[];
  qualityChecks: CreationProcessEntry[];
}

interface Recommendation {
  type: string;
  category: string;
  name: string;
  description: string;
  estimatedCost: string;
  bookingUrl: string;
  priority: 'high' | 'medium' | 'low';
  recommendedDay?: number;
}

interface DaySegment {
  activities: string[];
  inlineRecommendations: Recommendation[];
}

interface ItineraryDayPlan {
  day: number;
  date?: string;
  title: string;
  summary: string;
  location: string;
  morning: DaySegment;
  afternoon: DaySegment;
  evening: DaySegment;
  dining: string[];
  signatureHighlight: string;
  logistics: string[];
}

interface TravelTip {
  title: string;
  description: string;
}

type GlobalRecommendations = {
  [category: string]: Recommendation[];
};

Response shape:
{
  creationProcess: CreationProcess;
  itinerary: {
    daySummary: string;
    keyTakeaways: string[];
    dailyPlans: ItineraryDayPlan[];
    travelTips: TravelTip[];
    globalRecommendations: GlobalRecommendations;
  };
}
`);

  const selectedInclusionText = selectedInclusions.length > 0
    ? selectedInclusions.join(', ')
    : 'all categories (no specific selection)';
  const categoryKeys = recommendationCategories.map((c) => c.key).join(', ');
  const categoryGuidance = recommendationCategories
    .map((c) => `- ${c.key} (${c.label})`)
    .join('\n');

  parts.push(`
CRITICAL INSTRUCTIONS:
1. Populate creationProcess before filling itinerary. Each of "inputsUsed", "reasoningSteps", and "qualityChecks" must contain 2-4 concise entries tied to the traveler data.
2. User selected these inclusions: ${selectedInclusionText}.
3. ONLY include recommendation categories the user selected: ${categoryKeys}.
   Required category keys and labels:\n${categoryGuidance}
4. If you recommend an experience for a specific day, set "recommendedDay" accordingly and align with the ISO date.
5. Inline recommendations belong in "inlineRecommendations" for the relevant time period; leave an empty array when nothing contextual is needed.
6. When dates are fixed, use the provided ISO guidance exactly. When dates are flexible, omit the "date" field entirely.
7. Do not include any text outside the JSON object (no commentary, explanations, or markdown).
8. Emit every required key even when values are empty; use [] or null when information is unavailable.
9. For each recommendation, include bookingUrl, estimatedCost (in ${currency}), and priority ("high", "medium", or "low").
10. Mirror traveler counts, vibe, inclusions, and budget throughout the itinerary narrative and logistics.
`);

  parts.push(`
Recommendations Guidelines:
- Provide 2-5 recommendations per active category (quality over quantity).
- Include realistic pricing in ${currency}.
- Priority levels: "high" (must-have), "medium" (strongly suggested), "low" (nice-to-have).
- Booking URLs should reference real platforms (Booking.com, GetYourGuide, TripAdvisor, OpenTable, etc.).
- Inline recommendations should reinforce the surrounding activities (same neighborhood, logical timing).
- Global recommendations are for bookings that span the whole trip (flights, stays, ground transport).
`);

  parts.push(`
Creation Process Guidance:
- "inputsUsed" should cite specific traveler signals (e.g., travel style answers, inclusions, party composition).
- "reasoningSteps" must explain how you sequenced days, balanced pacing, and fulfilled priorities.
- "qualityChecks" must confirm calendar alignment, diversity of experiences, and budget/preference adherence.
`);

  return parts.join('\n');
}

export interface GenerationUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface GrokDraftMetadata {
  model: string;
  latencyMs: number;
  finishReason?: string;
  usage?: GenerationUsage;
  warnings?: unknown;
  responseStatus?: number;
  responseBodyPreview?: string;
  fallbackSource: FallbackSource;
}

export interface GrokDraftResult {
  rawOutput: string;
  cleanedJson: string;
  itinerary: unknown;
  creationProcess?: unknown;
  metadata: GrokDraftMetadata;
}

export interface GrokDraftParams {
  prompt: string;
  formData: ExtendedTripFormData;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  viatorContext?: any; // Viator API search results to include as context
}

export function buildGrokItineraryPrompt(formData: ExtendedTripFormData): string {
  const promptLines: string[] = [];

  const indicatorCandidate = (formData as Record<string, unknown>).indicator;
  const queryCandidate = (formData as Record<string, unknown>).query;
  const indicator = typeof indicatorCandidate === 'string' && indicatorCandidate.trim()
    ? indicatorCandidate
    : typeof queryCandidate === 'string' && queryCandidate.trim()
      ? queryCandidate
      : 'general';

  promptLines.push("You are Hylo's AI Itinerary Architect. Craft a detailed, actionable itinerary aligned with the indicator focus.");
  promptLines.push(`Indicator: ${indicator}`);
  promptLines.push(`Destination: ${formData.location ?? 'Unknown destination'}`);

  if (formData.flexibleDates === true) {
    promptLines.push(`Dates: Flexible, target ${formData.plannedDays ?? 'unspecified'} days.`);
  } else {
    promptLines.push(`Dates: ${formData.departDate ?? 'unspecified'} – ${formData.returnDate ?? 'unspecified'}.`);
  }

  const adultCount = formData.adults ?? 1;
  const childCount = formData.children ?? 0;
  if (childCount > 0) {
    const describeChildAge = (age: unknown) => {
      if (typeof age !== 'number' || Number.isNaN(age)) {
        return null;
      }
      if (age < 2) return `Infant (${age})`;
      if (age < 5) return `Toddler (${age})`;
      if (age < 13) return `Child (${age})`;
      if (age < 18) return `Teen (${age})`;
      return `Young traveler (${age})`;
    };

    const childAgesArray = Array.isArray(formData.childrenAges) ? formData.childrenAges : [];
    const childAgeLabels = childAgesArray
      .map(describeChildAge)
      .filter((label): label is string => Boolean(label));

    const ageDetails = childAgeLabels.length > 0 ? ` Age breakdown: ${childAgeLabels.join(', ')}.` : '';
    promptLines.push(
      `Travel party: ${adultCount} adult(s), ${childCount} child(ren).${ageDetails} Keep pacing family-friendly with rest time, flexible dining, and safety cues.`,
    );
  } else {
    promptLines.push(
      `Travel party: ${adultCount} adult(s). Trip is adults-only; highlight late-night, intimate, or adventurous options when appropriate.`,
    );
  }

  promptLines.push('If information is unavailable, return null or an empty array for that field rather than omitting the key.');
  promptLines.push('Do not prepend or append prose—respond with a single JSON object only.');

  if (formData.flexibleBudget === true) {
    promptLines.push('Budget: Flexible. Offer tiered recommendations (value, mid, premium) when relevant.');
  } else if (typeof formData.budget === 'number') {
    promptLines.push(`Budget: Roughly ${formData.currency ?? 'USD'} ${formData.budget}. Keep suggestions within range unless an upgrade is justified.`);
  }

  const travelStyleAnswers = ((formData as Record<string, unknown>).travelStyleAnswers ?? {}) as Record<string, any>;
  const travelStyleDetails: string[] = [];

  const appendArrayDetail = (label: string, value: unknown) => {
    if (Array.isArray(value) && value.length > 0) {
      travelStyleDetails.push(`${label}: ${value.join('; ')}`);
    }
  };

  appendArrayDetail('Experience level', travelStyleAnswers.experience);
  appendArrayDetail('Desired vibes', travelStyleAnswers.vibes);
  appendArrayDetail('Ideal day patterns', travelStyleAnswers.sampleDays);
  appendArrayDetail('Dinner preferences', travelStyleAnswers.dinnerChoices);

  if (Array.isArray(travelStyleAnswers.vibes) && travelStyleAnswers.vibes.includes('other') && travelStyleAnswers.vibesOther) {
    const vibesIndex = travelStyleDetails.findIndex((item) => item.startsWith('Desired vibes:'));
    if (vibesIndex !== -1) {
      travelStyleDetails[vibesIndex] = travelStyleDetails[vibesIndex].replace('other', travelStyleAnswers.vibesOther.trim());
    }
  }

  if (typeof travelStyleAnswers.customVibesText === 'string' && travelStyleAnswers.customVibesText.trim()) {
    travelStyleDetails.push(`Custom vibe notes: ${travelStyleAnswers.customVibesText.trim()}`);
  }
  if (typeof travelStyleAnswers.otherDinnerChoiceText === 'string' && travelStyleAnswers.otherDinnerChoiceText.trim()) {
    travelStyleDetails.push(`Custom dining notes: ${travelStyleAnswers.otherDinnerChoiceText.trim()}`);
  }

  if (travelStyleDetails.length > 0) {
    promptLines.push('Detailed travel style signals:\n' + travelStyleDetails.map((item) => `- ${item}`).join('\n'));
  } else if ((formData as any).travelStyleChoice === 'answer-questions') {
    promptLines.push('Detailed travel style questionnaire submitted without specific selections; infer from other context.');
  } else if ((formData as any).travelStyleChoice === 'skip-to-details') {
    promptLines.push('Traveler skipped the style questionnaire. Infer tone from core preferences, interests, and inclusions.');
  }

  if (Array.isArray(formData.selectedGroups) && formData.selectedGroups.length > 0) {
    let groupsText = formData.selectedGroups.join(', ');
    if (formData.selectedGroups.includes('other') && formData.customGroupText) {
      groupsText = groupsText.replace('other', formData.customGroupText.trim());
    }
    promptLines.push(`Travel group: ${groupsText}.`);
  }

  if (Array.isArray(formData.selectedInterests) && formData.selectedInterests.length > 0) {
    let interestsText = formData.selectedInterests.join(', ');
    if (formData.selectedInterests.includes('other') && formData.customInterestsText) {
      interestsText = interestsText.replace('other', formData.customInterestsText.trim());
    }
    promptLines.push(`Key interests: ${interestsText}.`);
  }

  if (Array.isArray(formData.selectedInclusions) && formData.selectedInclusions.length > 0) {
    promptLines.push('Must-have inclusions:');
    formData.selectedInclusions.forEach((inclusion: unknown) => {
      if (typeof inclusion === 'string' && inclusion.trim()) {
        let inclusionText = inclusion.trim();
        if (inclusionText === 'other' && formData.customInclusionsText) {
          inclusionText = formData.customInclusionsText.trim();
        }
        promptLines.push(`- Ensure planning covers: ${inclusionText}`);
      }
    });
  }

  if (typeof (formData as any).tripNickname === 'string' && (formData as any).tripNickname.trim()) {
    promptLines.push(`Trip nickname: ${(formData as any).tripNickname.trim()}. Use this nickname in the intro.`);
  }

  if (typeof (formData as any).tripVibe === 'string' && (formData as any).tripVibe.trim()) {
    promptLines.push(`Primary vibe: ${(formData as any).tripVibe.trim()}. Reinforce this tone throughout.`);
  }

  if ((formData as any).diningPreferences) {
    promptLines.push(`Dining preferences: ${JSON.stringify((formData as any).diningPreferences)}.`);
  }

  if ((formData as any).sampleDays) {
    promptLines.push(`Ideal day structure: ${JSON.stringify((formData as any).sampleDays)}.`);
  }

  if (typeof (formData as any).additionalNotes === 'string' && (formData as any).additionalNotes.trim()) {
    promptLines.push(`Traveler notes: ${(formData as any).additionalNotes.trim()}`);
  }

  // Dynamic travel tips guidance based on form data
  promptLines.push('\n---\n');
  promptLines.push('Travel Tips Generation Instructions:');
  promptLines.push('Produce exactly 4 travelTips objects tailored to this traveler.');
  promptLines.push('Each tip title must be 3-7 words, vivid, and reference a specific local place, dish, neighborhood, or seasonal insight. Never use generic category labels like "Day Planning" or "Dining".');
  promptLines.push('Each tip description must be 2-3 sentences packed with concrete advice (exact times, neighborhoods, transit modes, price ranges, booking windows) that reflects their interests, group size, and travel style.');
  promptLines.push('Keep the tone warm, insider, and traveler-first. Ensure no two tips reuse the same wording or focus.');

  const tipTopics: string[] = [];
  const vibesText = getVibesText(travelStyleAnswers);

  // Day planning / pacing focus
  if (travelStyleDetails.length > 0) {
    tipTopics.push(`• Smart pacing ideas aligned with their ${vibesText || 'preferred vibe'} in ${formData.location}, including ideal times to enjoy headline experiences.`);
  } else {
    tipTopics.push(`• Crowd-aware scheduling recommendations for signature spots in ${formData.location}, noting specific hours to visit.`);
  }

  // Dining focus
  const hasDiningPrefs = travelStyleAnswers.dinnerChoices?.length > 0 || (formData as any).diningPreferences;
  if (hasDiningPrefs) {
    tipTopics.push('• Dining strategies that weave in their stated meal preferences, reservation timing, and a standout venue or dish.');
  } else {
    tipTopics.push(`• Local food discoveries in ${formData.location} with pricing guidance and how to find authentic flavors.`);
  }

  // Group / logistics focus
  if (childCount > 0) {
    tipTopics.push(`• Family logistics tips covering downtime, stroller-friendly routes, and comfort hacks for ${childCount} kid(s).`);
  } else if (adultCount > 1) {
    tipTopics.push(`• Coordination advice for ${adultCount} adult traveler${adultCount === 1 ? '' : 's'} (meet-up points, transit options, pacing).`);
  } else {
    tipTopics.push(`• Solo travel wisdom for ${formData.location}, blending safety, social connection, and memorable alone-time moments.`);
  }

  // Budget/value focus
  if (formData.flexibleBudget === true) {
    tipTopics.push('• Value versus splurge guidance highlighting one premium upgrade worth booking alongside smart savings.');
  } else if (typeof formData.budget === 'number') {
    tipTopics.push(`• Budget stewardship that references staying within ${formData.currency ?? 'USD'} ${formData.budget.toLocaleString?.() ?? formData.budget}, plus free or low-cost swaps.`);
  } else {
    tipTopics.push(`• Money insights for ${formData.location} covering payment customs, tipping norms, and cash versus card advice.`);
  }

  promptLines.push('Ensure tips cover the following angles:');
  promptLines.push(tipTopics.join('\n'));

  // Must-have inclusions tip (if provided)
  if (Array.isArray(formData.selectedInclusions) && formData.selectedInclusions.length > 0) {
    const inclusionsText = formData.selectedInclusions
      .map((inc: any) => typeof inc === 'string' ? inc : '')
      .filter(Boolean)
      .join(', ');
    promptLines.push(`\nPrioritize tips that help them experience: ${inclusionsText}`);
  }

  promptLines.push(
    'You must respond with the exact JSON structure defined in the system instructions, including a populated "creationProcess" with 2-4 bullet points for each section and a "dailyPlans" array matching the expected ISO date rules.',
  );

  promptLines.push('\nGenerate the complete itinerary following the JSON schema from your system prompt.');
  promptLines.push(`\nComplete traveler profile:\n${JSON.stringify(formData, null, 2)}`);

  return promptLines.join('\n\n');
}

// Helper to extract vibes text for tip guidance
function getVibesText(travelStyleAnswers: any): string | null {
  if (!travelStyleAnswers) return null;
  
  const vibes = Array.isArray(travelStyleAnswers.vibes) ? travelStyleAnswers.vibes : [];
  const customVibes = travelStyleAnswers.customVibesText;
  
  if (vibes.length > 0) {
    return vibes.join(', ');
  }
  
  if (typeof customVibes === 'string' && customVibes.trim()) {
    return customVibes.trim();
  }
  
  return null;
}

export async function generateGrokItineraryDraft({
  prompt,
  formData,
  model = GROK_MODEL,
  temperature = 0.7,
  viatorContext, // NEW: Pass Viator API results as context
}: GrokDraftParams): Promise<GrokDraftResult> {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY is not configured.');
  }
  
  // Enhance prompt with Viator data if available
  const viatorDetails = typeof viatorContext === 'string'
    ? viatorContext
    : JSON.stringify(viatorContext, null, 2);

  const enhancedPrompt = viatorContext
    ? `${prompt}

---
VIATOR AVAILABLE PRODUCTS:
${viatorDetails}

Use these Viator products in your recommendations. Include the productId and affiliateUrl for each recommendation.`
    : prompt;

  const systemPrompt = buildSystemPrompt(formData);
  const startedAt = Date.now();
  const response = await fetch(XAI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: enhancedPrompt } // Use enhanced prompt with Viator data
      ],
      temperature,
    }),
  });

  const responseStatus = response.status;
  const responseBody = await response.text();

  if (!response.ok) {
    logger.error(17, 'XAI_REQUEST_FAILED', 'lib/ai/architectAI.ts', 'generateGrokItineraryDraft', 'xAI API request failed', {
      responseStatus,
      responseBody: responseBody.slice(0, 1000),
      model,
      endpoint: XAI_ENDPOINT,
      promptLength: prompt.length,
    });
    throw new Error(`xAI request failed (${responseStatus}): ${responseBody.slice(0, 200)}`);
  }

  let parsedResponse: any;
  try {
    parsedResponse = responseBody ? JSON.parse(responseBody) : {};
  } catch (error) {
    logger.error(17, 'XAI_INVALID_JSON', 'lib/ai/architectAI.ts', 'generateGrokItineraryDraft', 'Failed to parse xAI JSON response', {
      responseStatus,
      responseBodyPreview: responseBody.slice(0, 600),
    });
    throw new Error('Failed to parse xAI JSON response');
  }

  const { text: resolvedText, fallbackSource } = resolveXaiText(parsedResponse);

  logger.log(16, 'XAI_RAW_RESULT', 'lib/ai/architectAI.ts', 'generateGrokItineraryDraft', {
    finishReason: extractFinishReason(parsedResponse),
    warnings: parsedResponse?.warnings,
    usage: parsedResponse?.usage,
    hasText: Boolean(resolvedText?.trim?.()),
    responseKeys: parsedResponse ? Object.keys(parsedResponse) : null,
  });

  if (!resolvedText || !resolvedText.trim()) {
    if (parsedResponse?.error?.message) {
      throw new Error(`xAI error: ${parsedResponse.error.message}`);
    }

    logger.error(17, 'XAI_EMPTY_RESPONSE', 'lib/ai/architectAI.ts', 'generateGrokItineraryDraft', 'xAI returned empty text after parsing', {
      responseStatus,
      responseBodyPreview: responseBody.slice(0, 600),
      parsedKeys: parsedResponse ? Object.keys(parsedResponse) : null,
    });
    throw new Error('xAI returned empty text');
  }

  let cleanedJson = extractJsonBlock(resolvedText);
  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(cleanedJson);
  } catch (error) {
    throw new Error('Failed to parse Grok itinerary JSON');
  }

  const normalizedPayload = normalizeItineraryPayloadShape(parsedPayload, formData);
  if (normalizedPayload && typeof normalizedPayload === 'object') {
    try {
      cleanedJson = JSON.stringify(normalizedPayload, null, 2);
    } catch (error) {
      // ignore serialization failure and retain original cleanedJson
    }
  }

  let itinerary: unknown = normalizedPayload ?? {};
  let creationProcess: unknown;

  try {
    const validated = validateItineraryPayload(normalizedPayload, formData);
    itinerary = validated.itinerary;
    creationProcess = validated.creationProcess;
  } catch (schemaError) {
    if (schemaError instanceof Error) {
      throw schemaError;
    }
    throw new Error('Unknown schema validation failure');
  }

  return {
    rawOutput: resolvedText,
    cleanedJson,
    itinerary,
    creationProcess,
    metadata: {
  model,
      latencyMs: Date.now() - startedAt,
      finishReason: extractFinishReason(parsedResponse),
      usage: mapUsage(parsedResponse?.usage),
      warnings: parsedResponse?.warnings,
      responseStatus,
      responseBodyPreview: responseBody.slice(0, 600),
      fallbackSource,
    },
  };
}



function normalizeItineraryPayloadShape(payload: unknown, formData: ExtendedTripFormData): unknown {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const clone = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
  const allowedGlobalRecommendationKeys = new Set(
    resolveRecommendationCategories(formData).map((category) => category.key),
  );

  type SanitizedRecommendation = {
    type: string;
    category: string;
    name: string;
    description: string;
    estimatedCost: string;
    bookingUrl: string;
    priority: 'high' | 'medium' | 'low';
    recommendedDay?: number;
  };

  type SanitizedSegment = {
    activities: string[];
    inlineRecommendations: SanitizedRecommendation[];
  };

  type SanitizedDayPlan = {
    day: number;
    title: string;
    summary: string;
    location: string;
    morning: SanitizedSegment;
    afternoon: SanitizedSegment;
    evening: SanitizedSegment;
    dining: string[];
    logistics: string[];
    date?: string;
    signatureHighlight?: string;
  };

  type SanitizedTravelTip = {
    title: string;
    description: string;
  };

  const sanitizeString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const sanitizeNumber = (value: unknown): number | undefined => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return undefined;
    }
    return value;
  };

  const sanitizeStringArray = (value: unknown): string[] | undefined => {
    if (!Array.isArray(value)) {
      return undefined;
    }
    const entries = value
      .map(sanitizeString)
      .filter((entry): entry is string => Boolean(entry));
    return entries.length > 0 ? entries : undefined;
  };

  const sanitizePriority = (value: unknown): 'high' | 'medium' | 'low' | undefined => {
    if (value === 'high' || value === 'medium' || value === 'low') {
      return value;
    }
    return undefined;
  };

  const sanitizeRecommendation = (value: unknown): SanitizedRecommendation | undefined => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const record = value as Record<string, unknown>;
    const type = sanitizeString(record.type);
    const category = sanitizeString(record.category);
    const name = sanitizeString(record.name);
    const description = sanitizeString(record.description);
    const estimatedCost = sanitizeString(record.estimatedCost);
    const bookingUrl = sanitizeString(record.bookingUrl);
    const priority = sanitizePriority(record.priority);
    const recommendedDay = sanitizeNumber(record.recommendedDay);

    if (!type || !category || !name || !description || !estimatedCost || !bookingUrl || !priority) {
      return undefined;
    }

    return {
      type,
      category,
      name,
      description,
      estimatedCost,
      bookingUrl,
      priority,
      ...(typeof recommendedDay === 'number' ? { recommendedDay } : {}),
    };
  };

  const sanitizeSegment = (value: unknown): SanitizedSegment | undefined => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const record = value as Record<string, unknown>;
    const activities = sanitizeStringArray(record.activities);
    if (!activities) {
      return undefined;
    }

    const inlineRecommendations = Array.isArray(record.inlineRecommendations)
      ? record.inlineRecommendations
          .map(sanitizeRecommendation)
          .filter((entry): entry is SanitizedRecommendation => Boolean(entry))
      : [];

    return {
      activities,
      inlineRecommendations,
    };
  };

  const sanitizeDayPlan = (value: unknown): SanitizedDayPlan | undefined => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const record = value as Record<string, unknown>;

    const day = sanitizeNumber(record.day);
    const date = sanitizeString(record.date);
    const title = sanitizeString(record.title);
    const summary = sanitizeString(record.summary);
    const location = sanitizeString(record.location);
    const dining = sanitizeStringArray(record.dining);
  const signatureHighlight = sanitizeString(record.signatureHighlight);
    const logistics = sanitizeStringArray(record.logistics);

    const morning = sanitizeSegment(record.morning);
    const afternoon = sanitizeSegment(record.afternoon);
    const evening = sanitizeSegment(record.evening);

    if (
      !day ||
      !title ||
      !summary ||
      !location ||
      !morning ||
      !afternoon ||
      !evening ||
      !dining ||
      !logistics ||
      !signatureHighlight
    ) {
      return undefined;
    }

    const sanitized: SanitizedDayPlan = {
      day,
      title,
      summary,
      location,
      morning,
      afternoon,
      evening,
      dining,
      logistics,
      signatureHighlight,
    };

    if (date) sanitized.date = date;
    if (signatureHighlight) sanitized.signatureHighlight = signatureHighlight;

    return sanitized;
  };

  const sanitizeTravelTip = (value: unknown): SanitizedTravelTip | undefined => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const record = value as Record<string, unknown>;
    const title = sanitizeString(record.title);
    const description = sanitizeString(record.description);
    if (!title || !description) {
      return undefined;
    }

    return { title, description };
  };

  const sanitizeRecommendationGroup = (value: unknown): SanitizedRecommendation[] | undefined => {
    if (!Array.isArray(value)) {
      return undefined;
    }

    const entries = value
      .map(sanitizeRecommendation)
      .filter((entry): entry is SanitizedRecommendation => Boolean(entry));

    return entries.length > 0 ? entries : undefined;
  };

  if (clone.creationProcess && typeof clone.creationProcess === 'object') {
    const creation = clone.creationProcess as Record<string, unknown>;
    ['inputsUsed', 'reasoningSteps', 'qualityChecks'].forEach((key) => {
      if (Array.isArray(creation[key])) {
        creation[key] = (creation[key] as unknown[])
          .map(sanitizeString)
          .filter((entry): entry is string => Boolean(entry))
          .slice(0, 4);
      } else {
        delete creation[key];
      }
    });
  }

  if (clone.itinerary && typeof clone.itinerary === 'object') {
    const itinerary = clone.itinerary as Record<string, unknown>;

    const daySummary = sanitizeString(itinerary.daySummary);
    const keyTakeaways = sanitizeStringArray(itinerary.keyTakeaways);
    const travelTips = Array.isArray(itinerary.travelTips)
      ? itinerary.travelTips
          .map(sanitizeTravelTip)
          .filter((entry): entry is SanitizedTravelTip => Boolean(entry))
      : undefined;
    const dailyPlans = Array.isArray(itinerary.dailyPlans)
      ? itinerary.dailyPlans
          .map(sanitizeDayPlan)
          .filter((entry): entry is SanitizedDayPlan => Boolean(entry))
      : undefined;

    if (daySummary) {
      itinerary.daySummary = daySummary;
    } else {
      delete itinerary.daySummary;
    }

    if (keyTakeaways && keyTakeaways.length > 0) {
      itinerary.keyTakeaways = keyTakeaways;
    } else {
      delete itinerary.keyTakeaways;
    }

    if (travelTips && travelTips.length > 0) {
      itinerary.travelTips = travelTips;
    } else {
      delete itinerary.travelTips;
    }

    if (dailyPlans && dailyPlans.length > 0) {
      itinerary.dailyPlans = dailyPlans;
    } else {
      delete itinerary.dailyPlans;
    }

    const globalRecommendations = itinerary.globalRecommendations as Record<string, unknown> | undefined;
    if (globalRecommendations && typeof globalRecommendations === 'object') {
      Object.keys(globalRecommendations).forEach((key) => {
        if (!allowedGlobalRecommendationKeys.has(key)) {
          delete globalRecommendations[key];
          return;
        }

        const sanitizedGroup = sanitizeRecommendationGroup(globalRecommendations[key]);
        if (sanitizedGroup) {
          globalRecommendations[key] = sanitizedGroup;
        } else {
          delete globalRecommendations[key];
        }
      });
    }

    delete itinerary.destination;
    delete itinerary.dailyItinerary;
  }

  return clone;
}

function resolveXaiText(payload: any): { text: string | null; fallbackSource: FallbackSource } {
  if (!payload) {
    return { text: null, fallbackSource: 'none' };
  }

  const outputs = payload.output ?? payload.outputs;
  if (Array.isArray(outputs)) {
    const parts: string[] = [];
    for (const item of outputs) {
      const content = item?.content ?? item?.contents;
      if (Array.isArray(content)) {
        for (const entry of content) {
          if (typeof entry?.text === 'string' && entry.text.trim()) {
            parts.push(entry.text.trim());
          }
        }
      } else if (typeof content?.text === 'string' && content.text.trim()) {
        parts.push(content.text.trim());
      }
    }

    if (parts.length > 0) {
      return { text: parts.join('\n\n'), fallbackSource: 'none' };
    }
  }

  const choicesContent = payload?.choices?.[0]?.message?.content;
  const coercedChoice = coerceToString(choicesContent);
  if (coercedChoice) {
    return { text: coercedChoice, fallbackSource: 'parsed-content' };
  }

  const toolArguments = payload?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (typeof toolArguments === 'string' && toolArguments.trim()) {
    return { text: toolArguments, fallbackSource: 'tool-call' };
  }
  if (toolArguments && typeof toolArguments === 'object') {
    const serialized = JSON.stringify(toolArguments);
    if (serialized.trim()) {
      return { text: serialized, fallbackSource: 'tool-call' };
    }
  }

  const reasoningContent = payload?.choices?.[0]?.message?.reasoning_content;
  const coercedReasoning = coerceToString(reasoningContent);
  if (coercedReasoning) {
    return { text: coercedReasoning, fallbackSource: 'reasoning' };
  }

  const outputText = payload?.response?.output_text ?? payload?.text;
  if (typeof outputText === 'string' && outputText.trim()) {
    return { text: outputText.trim(), fallbackSource: 'parsed-content' };
  }

  const fallbackText = coerceToString(payload);
  if (fallbackText) {
    return { text: fallbackText, fallbackSource: 'parsed-content' };
  }

  return { text: null, fallbackSource: 'none' };
}

function coerceToString(input: unknown): string | null {
  if (!input) {
    return null;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(input)) {
    const parts = input
      .map((item) => coerceToString(item))
      .filter((part): part is string => Boolean(part));
    if (parts.length > 0) {
      return parts.join(' ').trim();
    }
    return null;
  }

  if (typeof input === 'object') {
    if (input === null) {
      return null;
    }

    if (typeof (input as any).text === 'string') {
      return (input as any).text.trim() || null;
    }

    if (typeof (input as any).content === 'string') {
      return (input as any).content.trim() || null;
    }

    try {
      const serialized = JSON.stringify(input);
      return serialized.trim() ? serialized : null;
    } catch {
      return null;
    }
  }

  return null;
}

function extractFinishReason(payload: any): string | undefined {
  return (
    payload?.output?.[0]?.finish_reason ??
    payload?.output?.[0]?.stopReason ??
    payload?.finish_reason ??
    payload?.finishReason
  );
}

function mapUsage(usage: any): GenerationUsage | undefined {
  if (!usage || typeof usage !== 'object') {
    return undefined;
  }

  const mapped: GenerationUsage = {};

  if (typeof usage.input_tokens === 'number') {
    mapped.promptTokens = usage.input_tokens;
  }
  if (typeof usage.output_tokens === 'number') {
    mapped.completionTokens = usage.output_tokens;
  }
  if (typeof usage.total_tokens === 'number') {
    mapped.totalTokens = usage.total_tokens;
  }

  if (Object.keys(mapped).length === 0) {
    return undefined;
  }

  return mapped;
}

function extractJsonBlock(raw: string): string {
  if (!raw || !raw.trim()) {
    throw new Error('AI response was empty');
  }

  const codeBlockMatch = raw.match(/```json([\s\S]*?)```/i) || raw.match(/```([\s\S]*?)```/i);
  const candidate = codeBlockMatch ? codeBlockMatch[1] : raw;

  const startCandidates = [candidate.indexOf('{'), candidate.indexOf('[')].filter((index) => index >= 0);
  const endCandidates = [candidate.lastIndexOf('}'), candidate.lastIndexOf(']')].filter((index) => index >= 0);

  if (startCandidates.length === 0 || endCandidates.length === 0) {
    throw new Error('Unable to locate JSON payload in AI response');
  }

  const startIndex = Math.min(...startCandidates);
  const endIndex = Math.max(...endCandidates);

  if (!Number.isFinite(startIndex) || !Number.isFinite(endIndex) || startIndex < 0 || endIndex < startIndex) {
    throw new Error('Unable to locate JSON payload in AI response');
  }

  return candidate.slice(startIndex, endIndex + 1).trim();
}
