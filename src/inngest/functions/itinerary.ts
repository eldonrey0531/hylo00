import { stateStore } from '@/lib/redis/stateStore';
import { logger } from '@/utils/console-logger';
import { buildGrokItineraryPrompt, generateGrokItineraryDraft } from '@/lib/ai/architectAI';
import { inngest } from '@/inngest/client';
import type { TripFormData } from '@/types';

type TravelTip = {
  title: string;
  description: string;
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
    .filter((tip): tip is TravelTip => Boolean(tip));

  return normalized.length > 0 ? normalized : fallback;
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

        const draft = await generateGrokItineraryDraft({
          prompt,
          model: modelName,
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
        const hadIncomingTips = Array.isArray((rawItinerary as any)?.travelTips)
          ? ((rawItinerary as any).travelTips as unknown[]).length
          : 0;
        const enrichedItinerary = enhanceItineraryWithTravelTips(rawItinerary, formData as TripFormData);
        const cleanedJson = JSON.stringify(enrichedItinerary, null, 2);

        logger.log(16, 'AI_ARCHITECT_COMPLETED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          durationMs: Date.now() - startedAt,
          generatedDays: Array.isArray((enrichedItinerary as any)?.dailyPlans)
            ? (enrichedItinerary as any).dailyPlans.length
            : Array.isArray((enrichedItinerary as any)?.dailyItinerary)
              ? (enrichedItinerary as any).dailyItinerary.length
              : Array.isArray((enrichedItinerary as any)?.days)
                ? (enrichedItinerary as any).days.length
                : 0,
          travelTips: {
            incomingCount: hadIncomingTips,
            finalCount: Array.isArray((enrichedItinerary as any)?.travelTips)
              ? (enrichedItinerary as any).travelTips.length
              : 0,
          },
          reasoningCharacters: 0,
        });

        return {
          itinerary: enrichedItinerary,
          rawOutput: draft.rawOutput,
          cleanedJson,
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

      // Store the raw JSON string directly to preserve original order
      const stored = await stateStore.storeItineraryState({
        workflowId,
        sessionId,
        status: 'completed',
        formData,
        itinerary: aiArchitectResult.cleanedJson,
        rawItinerary: aiArchitectResult.rawOutput,
        createdAt: workflowCreatedAt,
        updatedAt: new Date().toISOString(),
      });

      console.log('💾 [STORE] Data stored in Redis:', {
        workflowId,
        stored,
        itineraryType: typeof aiArchitectResult.cleanedJson,
        hasItinerary: !!aiArchitectResult.cleanedJson,
        itineraryLength: aiArchitectResult.cleanedJson ? aiArchitectResult.cleanedJson.length : 0,
      });

      logger.log(19, 'STORE_ITINERARY_RESULT', 'inngest/functions/itinerary.ts', 'storeItinerary', {
        workflowId,
        stored,
        hasItinerary: !!aiArchitectResult.cleanedJson,
      });

      // Save the complete AI output to a JSON file for inspection
      const fs = require('fs');
      const path = require('path');
      const outputFile = path.join(process.cwd(), 'logs', `${workflowId}.json`);
      const completeOutput = {
        aiArchitectResult,
        workflowId,
        timestamp: new Date().toISOString(),
      };
      fs.writeFileSync(outputFile, JSON.stringify(completeOutput, null, 2));
      logger.log(19, 'AI_OUTPUT_SAVED_TO_FILE', 'inngest/functions/itinerary.ts', 'storeItinerary', {
        workflowId,
        outputFile,
        fileSize: fs.statSync(outputFile).size,
      });

      if (!stored) {
        logger.warn(21, 'REDIS_STORAGE_FAILED', 'inngest/functions/itinerary.ts', 'storeItinerary', 'Failed to store itinerary in Redis', {
          workflowId,
        });
      }

      return { stored };
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