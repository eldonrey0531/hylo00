import { stateStore } from '@/lib/redis/stateStore';
import { logger } from '@/utils/console-logger';
import { buildGrokItineraryPrompt, generateGrokItineraryDraft } from '@/lib/ai/architectAI';
import { formatItineraryLayout } from '@/lib/ai/grokService';
import { storeItineraryForSearch } from '@/lib/redis/redis-vector';
import { inngest } from '@/inngest/client';
import type { TripFormData } from '@/types';

type TravelTip = {
  title: string;
  description: string;
};

const ensureStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
};

const normalizeDaySection = (section: unknown): Record<string, any> | null => {
  if (!section) {
    return null;
  }

  if (Array.isArray(section) || typeof section === 'string') {
    const activities = ensureStringArray(section);
    return activities.length > 0 ? { activities } : null;
  }

  if (typeof section === 'object') {
    const record = { ...(section as Record<string, any>) };

    if ('transport' in record && !record.transportation) {
      record.transportation = record.transport;
    }

    if ('time' in record && typeof record.time === 'string') {
      record.time = record.time.trim();
    }

    if ('summary' in record && typeof record.summary === 'string') {
      record.summary = record.summary.trim();
    }

    record.activities = ensureStringArray(record.activities ?? record.activity ?? record.items ?? record.events ?? []);

    return Object.values(record).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return Boolean(value);
    })
      ? record
      : null;
  }

  return null;
};

const normalizeItineraryStructure = (itinerary: Record<string, any>, formData: TripFormData): Record<string, any> => {
  const normalized: Record<string, any> = { ...itinerary };

  const numericDayEntries = Object.keys(normalized)
    .filter((key) => /^\d+$/.test(key))
    .map((key) => ({ index: Number(key), value: normalized[key] }))
    .sort((a, b) => a.index - b.index);

  const extractedDays = numericDayEntries.map((entry) => {
    const value = entry.value;
    delete normalized[String(entry.index)];
    return value;
  });

  if (!normalized.destination) {
    normalized.destination = (formData as any).location ?? (formData as any).destination ?? '';
  }

  const candidateDays = (() => {
    if (Array.isArray(normalized.dailyPlans) && normalized.dailyPlans.length > 0) {
      return normalized.dailyPlans;
    }
    if (Array.isArray(normalized.dailyItinerary) && normalized.dailyItinerary.length > 0) {
      return normalized.dailyItinerary;
    }
    if (Array.isArray(normalized.days) && normalized.days.length > 0) {
      return normalized.days;
    }
    if (extractedDays.length > 0) {
      return extractedDays;
    }
    return [];
  })();

  normalized.dailyPlans = candidateDays.map((entry, index) => {
    if (entry && typeof entry === 'object') {
      const day = { ...(entry as Record<string, any>) };
      day.day = day.day ?? index + 1;
      if (!day.title && typeof day.day === 'number') {
        day.title = `Day ${day.day}`;
      }
      day.summary = typeof day.summary === 'string' ? day.summary.trim() : day.summary;
      day.morning = normalizeDaySection(day.morning);
      day.afternoon = normalizeDaySection(day.afternoon);
      day.evening = normalizeDaySection(day.evening);
      day.transportation = day.transportation ?? day.transport ?? null;
      return day;
    }

    const description = typeof entry === 'string' ? entry.trim() : '';
    return {
      day: index + 1,
      title: `Day ${index + 1}`,
      summary: description,
      morning: normalizeDaySection(description ? [`Morning: ${description}`] : null),
      afternoon: null,
      evening: null,
    };
  });

  if (normalized.dailyPlans.length === 0) {
    normalized.dailyPlans = [];
  }

  normalized.dailyItinerary = normalized.dailyPlans;

  return normalized;
};

const parseIsoDate = (value: unknown): Date | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const calculateTripDuration = (formData: TripFormData): number => {
  const depart = parseIsoDate((formData as any).departDate);
  const ret = parseIsoDate((formData as any).returnDate);

  if (depart && ret) {
    const diffMs = ret.getTime() - depart.getTime();
    if (diffMs >= 0) {
      return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  if (typeof (formData as any).plannedDays === 'number' && (formData as any).plannedDays > 0) {
    return (formData as any).plannedDays;
  }

  return 0;
};

const buildBudgetLabel = (formData: TripFormData): string => {
  const amount = typeof (formData as any).budget === 'number' ? (formData as any).budget : null;
  const currency = typeof (formData as any).currency === 'string' ? (formData as any).currency : 'USD';
  const mode = typeof (formData as any).budgetMode === 'string' ? (formData as any).budgetMode : 'total';

  if (amount !== null) {
    return `${currency} ${amount.toLocaleString()} (${mode})`;
  }

  return (formData as any).flexibleBudget ? 'flexible' : 'unspecified';
};

const collectPreferenceSignals = (formData: TripFormData): { activities: string[]; preferences: string[] } => {
  const interests = Array.isArray((formData as any).selectedInterests)
    ? ((formData as any).selectedInterests as unknown[])
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    : [];

  const travelStyleAnswers = ((formData as any).travelStyleAnswers ?? {}) as Record<string, unknown>;
  const vibes = ensureStringArray(travelStyleAnswers.vibes);
  const experience = ensureStringArray(travelStyleAnswers.experience);

  return {
    activities: interests,
    preferences: [...vibes, ...experience],
  };
};

const pickDestinationName = (formData: TripFormData): string => {
  const details = (formData as any).locationDetails as Record<string, unknown> | undefined;
  if (details) {
    const label = typeof details.label === 'string' ? details.label.trim() : '';
    const city = typeof details.city === 'string' ? details.city.trim() : '';
    const country = typeof details.country === 'string' ? details.country.trim() : '';

    if (label) {
      return label;
    }

    if (city && country) {
      return `${city}, ${country}`;
    }

    if (city) {
      return city;
    }

    if (country) {
      return country;
    }
  }

  const location = toTrimmedString((formData as any).location);
  return location ?? 'Unknown destination';
};

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toTrimmedString(item) ?? null)
      .filter((item): item is string => Boolean(item));
  }

  const single = toTrimmedString(value);
  return single ? [single] : [];
};

const formatKeyword = (value: string): string =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const joinSentences = (parts: Array<string | null | undefined>): string =>
  parts
    .map((part) => part ?? '')
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');

const buildTravelTipsFromForm = (formData: TripFormData): TravelTip[] => {
  const tips: TravelTip[] = [];

  const location = toTrimmedString((formData as any).location) ?? 'your destination';
  const tripNickname =
    toTrimmedString((formData as any).tripNickname) ||
    toTrimmedString(((formData as any).travelStyleAnswers ?? {}).tripNickname);

  const travelStyleAnswers = ((formData as any).travelStyleAnswers ?? {}) as Record<string, unknown>;
  const vibes = toStringArray(travelStyleAnswers.vibes).map(formatKeyword);
  const sampleDays = toStringArray(travelStyleAnswers.sampleDays).map(formatKeyword);
  const dinnerChoices = toStringArray(travelStyleAnswers.dinnerChoices).map(formatKeyword);
  const otherDinnerNotes =
    toTrimmedString((travelStyleAnswers.otherDinnerChoiceText as string | undefined) ?? null) ?? undefined;
  const customVibeText = toTrimmedString((travelStyleAnswers.customVibesText as string | undefined) ?? null);

  const departDate = toTrimmedString((formData as any).departDate);
  const returnDate = toTrimmedString((formData as any).returnDate);
  const plannedDays = typeof (formData as any).plannedDays === 'number' ? (formData as any).plannedDays : null;

  const kidsCount = typeof (formData as any).children === 'number' ? (formData as any).children : 0;
  const adultCount = typeof (formData as any).adults === 'number' ? (formData as any).adults : 0;

  const selectedGroups = toStringArray((formData as any).selectedGroups).map(formatKeyword);
  const customGroupText = toTrimmedString((formData as any).customGroupText);
  const groupSummary = selectedGroups
    .map((entry) => (entry.toLowerCase() === 'other' && customGroupText ? customGroupText : entry))
    .join(', ');

  const interests = toStringArray((formData as any).selectedInterests).map(formatKeyword);
  const customInterestsText = toTrimmedString((formData as any).customInterestsText);
  const interestSummary = interests
    .map((entry) => (entry.toLowerCase() === 'other' && customInterestsText ? customInterestsText : entry))
    .join(', ');

  const inclusionSummary = toStringArray((formData as any).selectedInclusions)
    .map(formatKeyword)
    .join(', ');
  const customInclusionsText = toTrimmedString((formData as any).customInclusionsText);

  const budgetValue = typeof (formData as any).budget === 'number' ? (formData as any).budget : null;
  const currency = toTrimmedString((formData as any).currency);
  const flexibleBudget = (formData as any).flexibleBudget === true;

  const diningPreferences = (formData as any).diningPreferences as Record<string, unknown> | undefined;

  const scheduleWindow = departDate && returnDate
    ? `${departDate} – ${returnDate}`
    : plannedDays
      ? `${plannedDays}-day outline`
      : 'your time in destination';

  const vibeCallout = [
    vibes.length > 0 ? `Lean into the ${vibes.join(', ')} vibe when choosing activities.` : null,
    customVibeText ? `Keep the "${customVibeText}" energy in mind as you confirm experiences.` : null,
    sampleDays.length > 0
      ? `Let your preferred ${sampleDays.join(', ')} rhythm guide how you pace mornings, afternoons, and evenings.`
      : null,
    tripNickname ? `Use "${tripNickname}" as a north star when you describe the trip to partners or guests.` : null,
  ];

  tips.push({
    title: `Shape each day in ${location}`,
    description:
      joinSentences([
        `Sketch a high-level plan for ${scheduleWindow} so you balance must-see moments with relaxed time.`,
        ...vibeCallout,
      ]) || `Build a flexible outline for ${scheduleWindow} to keep your plans intentional and on-brand.`,
  });

  const diningParts = [
    dinnerChoices.length > 0
      ? `Reserve restaurants that match your ${dinnerChoices.join(', ')} preferences.`
      : null,
    otherDinnerNotes ? `Call ahead with special notes like "${otherDinnerNotes}" so teams can personalize service.` : null,
    diningPreferences?.dietaryRestrictions
      ? `Highlight dietary needs (${JSON.stringify(diningPreferences.dietaryRestrictions)}) when booking.`
      : null,
    diningPreferences?.favoriteCuisines
      ? `Feature favorite cuisines such as ${toStringArray(diningPreferences.favoriteCuisines).join(', ')}.`
      : null,
    `Mix local staples with a memorable splurge meal to create contrast throughout the trip.`,
  ];

  tips.push({
    title: 'Lock in memorable dining',
    description:
      joinSentences(diningParts) ||
      'Plan a blend of local favorites and signature meals, capturing any dietary notes so reservations feel personal.',
  });

  const groupParts = [
    adultCount > 0
      ? `Coordinate logistics for ${adultCount} adult${adultCount === 1 ? '' : 's'}, making arrival and check-in seamless.`
      : null,
    kidsCount > 0
      ? `Schedule daily downtime so ${kidsCount === 1 ? 'your child' : 'the kids'} can reset between anchor activities.`
      : null,
    groupSummary
      ? `Choose experiences that resonate with ${groupSummary.toLowerCase()} to keep everyone engaged.`
      : null,
    interestSummary
      ? `Prioritize highlights connected to ${interestSummary.toLowerCase()} when finalizing reservations.`
      : null,
    inclusionSummary
      ? `Double-check that must-have inclusions (${inclusionSummary.toLowerCase()}) appear in each day.`
      : null,
    customInclusionsText ? `Note custom requests like ${customInclusionsText} in supplier briefs.` : null,
  ];

  tips.push({
    title: 'Design for your travel party',
    description:
      joinSentences(groupParts) ||
      'Balance active experiences with intentional rest blocks so the whole group stays energized and excited.',
  });

  const budgetParts = [
    flexibleBudget
      ? 'Use your flexible budget to contrast premium moments with approachable local finds.'
      : null,
    !flexibleBudget && budgetValue
      ? `Track spend against roughly ${currency ?? 'USD'} ${budgetValue.toLocaleString()} so you can flag overages early.`
      : null,
    (formData as any).indicator ? `Keep the "${(formData as any).indicator}" focus front-and-center when prioritizing upgrades.` : null,
  ];

  if (budgetParts.filter(Boolean).length > 0) {
    tips.push({
      title: 'Stay ahead of logistics & spend',
      description: joinSentences(budgetParts) || 'Plan logistics and budget checkpoints before you depart.',
    });
  }

  while (tips.length < 3) {
    tips.push({
      title: 'Keep the journey effortless',
      description:
        'Confirm transportation, meal pacing, and daily highlights 48 hours in advance so the itinerary feels concierge-crafted.',
    });
  }

  return tips;
};

const normalizeTravelTips = (tips: unknown, fallback: TravelTip[]): TravelTip[] => {
  if (!Array.isArray(tips)) {
    return fallback;
  }

  const normalized = tips
    .map((tip, index): TravelTip | null => {
      if (typeof tip === 'string') {
        const trimmed = tip.trim();
        return trimmed ? { title: `Trip tip ${index + 1}`, description: trimmed } : null;
      }

      if (typeof tip !== 'object' || tip === null) {
        return null;
      }

      const tipRecord = tip as Record<string, unknown>;
      const title =
        toTrimmedString(tipRecord.title) ||
        toTrimmedString(tipRecord.heading) ||
        `Trip tip ${index + 1}`;
      const description =
        toTrimmedString(tipRecord.description) ||
        toTrimmedString(tipRecord.content) ||
        toStringArray(tipRecord.bullets).join(' ');

      return description
        ? {
            title,
            description,
          }
        : null;
    })
    .filter((tip): tip is TravelTip => Boolean(tip))
    .filter((tip) => {
      // Quality check: Filter out generic/low-quality tips
      const desc = tip.description.toLowerCase();
      const isShort = tip.description.length < 50;
      const isGeneric = [
        'have fun',
        'have a great trip',
        'stay safe',
        'enjoy',
        'good luck',
        'bon voyage',
        'pack light',
      ].some((phrase) => desc === phrase || (desc.includes(phrase) && tip.description.length < 100));

      // Keep tip only if it's substantial AND not generic
      return !isShort && !isGeneric;
    });

  // Use fallback if we don't have at least 3 high-quality tips
  return normalized.length >= 3 ? normalized : fallback;
};

const enhanceItineraryWithTravelTips = (
  itinerary: Record<string, any>,
  formData: TripFormData,
): Record<string, any> => {
  const fallbackTips = buildTravelTipsFromForm(formData);
  const travelTips = normalizeTravelTips(itinerary?.travelTips, fallbackTips);
  const rest = { ...(itinerary ?? {}) };
  if ('nextSteps' in rest) {
    delete (rest as Record<string, unknown>).nextSteps;
  }

  return {
    ...rest,
    travelTips,
  };
};

/**
 * Itinerary generation workflow using Inngest
 * Orchestrates AI calls, research, logging, and Redis persistence
 */
export const itineraryWorkflow = inngest.createFunction(
  {
    id: 'itinerary.generate',
    name: 'Generate AI Itinerary',
    retries: 3,
  },
  { event: 'itinerary.generate.requested' },
  async ({ event, step }) => {
    const { formData, sessionId, workflowId } = event.data;
    const workflowCreatedAt = new Date().toISOString();

    logger.log(14, 'INNGEST_WORKFLOW_STARTED', 'inngest/functions/itinerary.ts', 'itineraryWorkflow', {
      workflowId,
      sessionId,
      location: formData.location,
      adults: formData.adults,
    });

    // Step 0: Initialize workflow state immediately so status polling can find it
    await step.run('initialize-workflow-state', async () => {
      logger.log(13, 'WORKFLOW_STATE_INITIALIZATION_STARTED', 'inngest/functions/itinerary.ts', 'initializeWorkflowState', {
        workflowId,
        sessionId,
      });

      const initialized = await stateStore.storeItineraryState({
        workflowId,
        sessionId,
        status: 'processing',
        formData,
        itinerary: undefined,
        rawItinerary: undefined,
        createdAt: workflowCreatedAt,
        updatedAt: workflowCreatedAt,
      });

      logger.log(13, 'WORKFLOW_STATE_INITIALIZATION_RESULT', 'inngest/functions/itinerary.ts', 'initializeWorkflowState', {
        workflowId,
        sessionId,
        initialized,
      });
    });

    // Step 1: AI Itinerary Architect (Grok-4-fast-reasoning)
    const aiArchitectResult = await step.run('ai-itinerary-architect', async () => {
      logger.log(15, 'AI_ARCHITECT_STARTED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
        workflowId,
        destination: formData.location,
        adults: formData.adults,
        children: formData.children ?? 0,
      });

      const prompt = buildGrokItineraryPrompt(formData as any);
      logger.log(15, 'AI_PROMPT_PREVIEW', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
        workflowId,
        promptLength: prompt.length,
        promptPreview: prompt.slice(0, 1200),
      });

      const modelName = 'grok-4-fast-reasoning';
      logger.log(15, 'XAI_MODEL_INITIALIZED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
        workflowId,
        model: modelName,
        apiKeyPresent: Boolean(process.env.XAI_API_KEY),
        apiKeyLength: process.env.XAI_API_KEY?.length ?? 0,
      });

      const startedAt = Date.now();

      try {
        logger.log(15, 'XAI_REQUEST_DISPATCHED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          model: modelName,
          promptCharacters: prompt.length,
        });

        const viatorContext: string | undefined = undefined;
        logger.log(15, 'VIATOR_CONTEXT_SKIPPED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          reason: 'integration_disabled',
        });

        const draft = await generateGrokItineraryDraft({
          prompt,
          formData: formData as any,
          model: modelName,
          viatorContext: viatorContext ?? undefined,
        });

        logger.log(16, 'XAI_RESPONSE_METADATA', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          model: modelName,
          finishReason: draft.metadata.finishReason,
          warnings: draft.metadata.warnings,
          usage: draft.metadata.usage,
          responseStatus: draft.metadata.responseStatus,
          hasResponse: typeof draft.metadata.responseStatus !== 'undefined',
          latencyMs: draft.metadata.latencyMs,
          responseBodyPreview: draft.metadata.responseBodyPreview,
        });

        if (draft.metadata.fallbackSource !== 'none') {
          logger.log(16, 'XAI_RESPONSE_FALLBACK_USED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
            workflowId,
            model: modelName,
            fallbackSource: draft.metadata.fallbackSource,
          });
        }

        logger.log(16, 'AI_RESPONSE_OUTPUT', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          aiResponse: draft.rawOutput,
        });

        const rawItinerary = (draft.itinerary ?? {}) as Record<string, any>;
        const normalizedItinerary = normalizeItineraryStructure(
          enhanceItineraryWithTravelTips(rawItinerary, formData as TripFormData),
          formData as TripFormData,
        );
        const hadIncomingTips = Array.isArray((rawItinerary as any)?.travelTips)
          ? ((rawItinerary as any).travelTips as unknown[]).length
          : 0;
        const normalizedPayload = {
          creationProcess: draft.creationProcess ?? null,
          itinerary: normalizedItinerary,
        };
        const serializedItinerary = JSON.stringify(normalizedPayload, null, 2);

        logger.log(16, 'AI_ARCHITECT_COMPLETED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          durationMs: Date.now() - startedAt,
          generatedDays: Array.isArray((normalizedItinerary as any)?.dailyPlans)
            ? (normalizedItinerary as any).dailyPlans.length
            : 0,
          travelTips: {
            incomingCount: hadIncomingTips,
            finalCount: Array.isArray((normalizedItinerary as any)?.travelTips)
              ? (normalizedItinerary as any).travelTips.length
              : 0,
          },
          reasoningCharacters: 0,
          creationProcessSections:
            draft.creationProcess && typeof draft.creationProcess === 'object'
              ? Object.keys(draft.creationProcess as Record<string, unknown>)
              : [],
        });

        return {
          itinerary: normalizedItinerary,
          creationProcess: draft.creationProcess ?? null,
          rawOutput: draft.rawOutput,
          cleanedJson: serializedItinerary,
        };
      } catch (error) {
        logger.error(17, 'AI_ARCHITECT_FAILED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', error instanceof Error ? error : String(error), {
          workflowId,
        });
        throw error;
      }
    });

    // Step 2: Store itinerary
    await step.run('store-itinerary', async () => {
      logger.log(20, 'REDIS_STORAGE_STARTED', 'inngest/functions/itinerary.ts', 'storeItinerary', {
        workflowId,
      });

      console.log('📋 [STORE] Raw JSON string to be saved:', aiArchitectResult.cleanedJson);

      const layoutResult = await formatItineraryLayout({
        workflowId,
        itinerary: aiArchitectResult.itinerary,
        rawContent: aiArchitectResult.rawOutput,
        formData: formData as TripFormData,
      });

      // Store the structured itinerary plus formatted layout
      const stored = await stateStore.storeItineraryState({
        workflowId,
        sessionId,
        status: 'completed',
        formData,
        itinerary: aiArchitectResult.itinerary,
        creationProcess: aiArchitectResult.creationProcess ?? undefined,
        rawItinerary: aiArchitectResult.cleanedJson,
        layout: {
          model: layoutResult.model,
          usedGroq: layoutResult.usedGroq,
          content: layoutResult.layout,
          rawText: layoutResult.rawText || undefined,
        },
        createdAt: workflowCreatedAt,
        updatedAt: new Date().toISOString(),
      });

      console.log('💾 [STORE] Data stored in Redis:', {
        workflowId,
        stored,
        itineraryType: typeof aiArchitectResult.itinerary,
        hasItinerary: !!aiArchitectResult.cleanedJson,
        itineraryLength: aiArchitectResult.cleanedJson ? aiArchitectResult.cleanedJson.length : 0,
      });

      logger.log(19, 'STORE_ITINERARY_RESULT', 'inngest/functions/itinerary.ts', 'storeItinerary', {
        workflowId,
        stored,
        hasItinerary: !!aiArchitectResult.cleanedJson,
      });

      return { stored };
    });

    // Step 3: Store in Redis for semantic search (moved out of nested step)
    await step.run('store-search-data', async () => {
      try {
        const destinationName = pickDestinationName(formData as TripFormData);
        const durationDays = calculateTripDuration(formData as TripFormData);
        const { activities, preferences } = collectPreferenceSignals(formData as TripFormData);
        const searchStored = await storeItineraryForSearch(workflowId, {
          destination: destinationName,
          duration: durationDays,
          budget: buildBudgetLabel(formData as TripFormData),
          activities,
          preferences,
          itinerary: aiArchitectResult.itinerary,
          timestamp: new Date().toISOString(),
        });

        logger.log(20, 'SEARCH_DATA_STORAGE_RESULT', 'inngest/functions/itinerary.ts', 'storeSearchData', {
          workflowId,
          searchStored,
        });

        return { searchStored };
      } catch (searchError) {
        logger.error(20, 'SEARCH_DATA_STORAGE_FAILED', 'inngest/functions/itinerary.ts', 'storeSearchData', searchError instanceof Error ? searchError : String(searchError), {
          workflowId,
        });
        // Don't fail the workflow if search storage fails
        return { searchStored: false };
      }
    });

    // Step 4: Save file logging (moved out and kept separate)

    // Step 4: Save file logging (development only)
    await step.run('save-file-log', async () => {
      // Only attempt file logging in development environment
      if (process.env.NODE_ENV !== 'production') {
        try {
          const fs = require('fs');
          const path = require('path');
          const logDir = path.join(process.cwd(), 'logs');
          
          // Ensure directory exists
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }
          
          const outputFile = path.join(logDir, `${workflowId}.json`);
          const completeOutput = {
            aiArchitectResult,
            workflowId,
            timestamp: new Date().toISOString(),
          };
          
          fs.writeFileSync(outputFile, JSON.stringify(completeOutput, null, 2));
          logger.log(19, 'AI_OUTPUT_SAVED_TO_FILE', 'inngest/functions/itinerary.ts', 'saveFileLog', {
            workflowId,
            outputFile,
            fileSize: fs.statSync(outputFile).size,
          });
          return { fileSaved: true, outputFile };
        } catch (fileError) {
          logger.warn(19, 'AI_OUTPUT_FILE_SAVE_FAILED', 'inngest/functions/itinerary.ts', 'saveFileLog', 'Failed to save AI output to file', {
            workflowId,
            error: fileError instanceof Error ? fileError.message : String(fileError),
          });
          return { fileSaved: false };
        }
      } else {
        logger.log(19, 'AI_OUTPUT_FILE_LOGGING_SKIPPED', 'inngest/functions/itinerary.ts', 'saveFileLog', {
          workflowId,
          reason: 'File logging disabled in production environment',
        });
        return { fileSaved: false, reason: 'production' };
      }
    });

    logger.log(21, 'INNGEST_WORKFLOW_COMPLETED', 'inngest/functions/itinerary.ts', 'itineraryWorkflow', {
      workflowId,
      status: 'completed',
    });

    return {
      success: true,
      workflowId,
      itinerary: aiArchitectResult.cleanedJson,
    };
  },
);

export const functions = [itineraryWorkflow];