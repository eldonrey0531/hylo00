import { z } from 'zod';

import { logger } from '@/utils/console-logger';

import {
  ISO_DATE_REGEX,
  computeInferredDayCount,
  parseIsoDate,
  resolveRecommendationCategories,
  type ExtendedTripFormData,
} from './itineraryShared';

type CreationProcessPayload = {
  inputsUsed: string[];
  reasoningSteps: string[];
  qualityChecks: string[];
};

export function buildItineraryValidationSchema(formData: ExtendedTripFormData) {
  const hasFlexibleDates = formData.flexibleDates === true;
  const recommendationCategories = resolveRecommendationCategories(formData);
  const departDate = parseIsoDate((formData as Record<string, unknown>).departDate);
  const returnDate = parseIsoDate((formData as Record<string, unknown>).returnDate);
  const inferredDayCount = Math.max(1, Math.min(21, computeInferredDayCount(formData, departDate, returnDate)));
  const minDailyPlans = Math.max(1, inferredDayCount);
  const maxDailyPlans = Math.min(minDailyPlans + 2, 30);

  const recommendationSchema = z
    .object({
      type: z.string().min(1),
      category: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      estimatedCost: z.string().min(1),
      bookingUrl: z.string().min(1),
      priority: z.enum(['high', 'medium', 'low']),
      recommendedDay: z.number().int().min(1).optional(),
    })
    .strict();

  const daySegmentSchema = z
    .object({
      activities: z.array(z.string().min(1)).min(1),
      inlineRecommendations: z.array(recommendationSchema),
    })
    .strict();

  const dayPlanSchema = z
    .object({
      day: z.number().int().min(1),
      date: hasFlexibleDates
        ? z.string().regex(ISO_DATE_REGEX).optional()
        : z.string().regex(ISO_DATE_REGEX, { message: 'date must be ISO YYYY-MM-DD when dates are fixed' }),
      title: z.string().min(1),
      summary: z.string().min(1),
      location: z.string().min(1),
      morning: daySegmentSchema,
      afternoon: daySegmentSchema,
      evening: daySegmentSchema,
      dining: z.array(z.string().min(1)).min(1),
      signatureHighlight: z.string().min(1),
      logistics: z.array(z.string().min(1)).min(1),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (hasFlexibleDates && typeof data.date === 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['date'],
          message: 'Omit the "date" field when traveler dates are flexible',
        });
      }

      if (!hasFlexibleDates && typeof data.date !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['date'],
          message: 'Provide an ISO date for fixed-date itineraries',
        });
      }
    });

  const creationProcessSchema = z
    .object({
      inputsUsed: z.array(z.string().min(1)).min(2).max(4),
      reasoningSteps: z.array(z.string().min(1)).min(2).max(4),
      qualityChecks: z.array(z.string().min(1)).min(2).max(4),
    })
    .strict();

  const travelTipSchema = z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
    })
    .strict();

  const globalRecommendationsShape = Object.fromEntries(
    recommendationCategories.map((category) => [category.key, z.array(recommendationSchema).min(1)]),
  );

  const itinerarySchema = z
    .object({
      daySummary: z.string().min(1),
      keyTakeaways: z.array(z.string().min(1)).min(1),
      dailyPlans: z.array(dayPlanSchema).min(minDailyPlans).max(maxDailyPlans),
      travelTips: z.array(travelTipSchema).min(3).max(6),
      globalRecommendations: z.object(globalRecommendationsShape).strict(),
    })
    .strict();

  return z
    .object({
      creationProcess: creationProcessSchema,
      itinerary: itinerarySchema,
    })
    .strict();
}

export function validateItineraryPayload(payload: unknown, formData: ExtendedTripFormData): {
  creationProcess: CreationProcessPayload;
  itinerary: any;
} {
  const schema = buildItineraryValidationSchema(formData);
  const result = schema.safeParse(payload);

  if (!result.success) {
    logger.error(
      17,
      'AI_ARCHITECT_SCHEMA_VALIDATION_FAILED',
      'lib/ai/itinerarySchema.ts',
      'validateItineraryPayload',
      JSON.stringify(result.error.flatten(), null, 2),
    );
    throw new Error('Itinerary JSON failed schema validation');
  }

  return result.data;
}
