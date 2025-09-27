import type { TripFormData } from '@/types';
import { logger } from '@/utils/console-logger';

type FallbackSource = 'none' | 'parsed-content' | 'tool-call' | 'reasoning';

const GROK_MODEL = 'grok-4-fast-reasoning';
const XAI_ENDPOINT = 'https://api.x.ai/v1/responses';

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
  metadata: GrokDraftMetadata;
}

export interface GrokDraftParams {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export type ExtendedTripFormData = TripFormData & Record<string, unknown>;

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

  promptLines.push('Execution requirements:');
  promptLines.push('- Produce an intro paragraph that feels concierge-written, 2-3 sentences.');
  promptLines.push('- Build `dailyPlans` array with one entry per day, preserving date order.');
  promptLines.push('- Each day must include morning, afternoon, evening anchors with 3+ specific activities each.');
  promptLines.push('- For each time period (morning/afternoon/evening), provide detailed, actionable activities that create a rich experience.');
  promptLines.push('- Activities should be varied: mix cultural experiences, local interactions, relaxation, exploration, and unique discoveries.');
  promptLines.push('- If transportation is required, include `transportation` notes with time estimates.');
  promptLines.push('- Add `dining` suggestions that match the traveler vibe and any dietary notes.');
  promptLines.push('- Reference the trip nickname if provided.');
  promptLines.push('- End with `keyTakeaways` summarizing highlights and a `travelTips` array tailored from the traveler form responses.');
  promptLines.push('- For `travelTips`, output an array where each item is an object containing `title` and `description` strings with practical, concierge-ready guidance.');
  promptLines.push('- Do not include a `nextSteps` field—focus on personalized travel tips instead.');

  promptLines.push(
    'Output requirements: Respond with a single JSON object containing `dailyPlans` where each entry represents one day. Each day should include activities, meals, and transportation details.',
  );

  promptLines.push(`Form data JSON:\n${JSON.stringify(formData, null, 2)}`);

  return promptLines.join('\n\n');
}

export async function generateGrokItineraryDraft({
  prompt,
  model = GROK_MODEL,
  temperature = 0.7,
}: GrokDraftParams): Promise<GrokDraftResult> {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY is not configured.');
  }

  const startedAt = Date.now();
  const response = await fetch(XAI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [{ role: 'user', content: prompt }],
      temperature,
    }),
  });

  const responseStatus = response.status;
  const responseBody = await response.text();

  if (!response.ok) {
    logger.error(17, 'XAI_REQUEST_FAILED', 'lib/ai/architectAI.ts', 'generateGrokItineraryDraft', responseBody, {
      responseStatus,
    });
    throw new Error(`xAI request failed (${responseStatus})`);
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

  const cleanedJson = extractJsonBlock(resolvedText);
  let itinerary: unknown;
  try {
    itinerary = JSON.parse(cleanedJson);
  } catch (error) {
    throw new Error('Failed to parse Grok itinerary JSON');
  }

  return {
    rawOutput: resolvedText,
    cleanedJson,
    itinerary,
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
