import { z } from 'zod';

// Enum schemas for TravelStyle components
export const travelPaceSchema = z.enum(['fast', 'moderate', 'slow', 'flexible']);
export const activityLevelSchema = z.enum(['very-active', 'active', 'moderate', 'relaxed']);
export const planningPreferenceSchema = z.enum(['structured', 'flexible', 'spontaneous']);
export const budgetStyleSchema = z.enum(['budget', 'moderate', 'comfort', 'luxury']);
export const culturalInterestSchema = z.enum(['high', 'medium', 'low']);
export const travelExperienceSchema = z.enum(['first-time', 'occasional', 'frequent', 'expert']);
export const photoImportanceSchema = z.enum(['not-important', 'somewhat', 'very-important']);
export const localInteractionSchema = z.enum(['minimal', 'some', 'immersive']);

// Array schemas for multi-select components
export const accommodationTypesSchema = z.array(z.string()).optional();
export const diningPreferencesSchema = z.array(z.string()).optional();
export const transportPreferencesSchema = z.array(z.string()).optional();
export const interestsSchema = z.array(z.string()).optional();
export const tripPurposeSchema = z.array(z.string()).optional();
export const budgetPrioritiesSchema = z.array(z.string()).optional();
export const experiencePrioritiesSchema = z.array(z.string()).optional();
export const accessibilitySchema = z.array(z.string()).optional();
export const mustHavesSchema = z.array(z.string()).optional();
export const avoidancesSchema = z.array(z.string()).optional();

// Main TravelStyle data schema
export const travelStyleDataSchema = z.object({
  // Core single-select preferences (required)
  pace: travelPaceSchema.optional(),
  activityLevel: activityLevelSchema.optional(),
  planningPreference: planningPreferenceSchema.optional(),
  budgetStyle: budgetStyleSchema.optional(),
  culturalInterest: culturalInterestSchema.optional(),

  // Additional single-select preferences (optional)
  groupStyle: z.enum(['solo', 'couple', 'family', 'friends', 'mixed']).optional(),
  travelExperience: travelExperienceSchema.optional(),
  photoImportance: photoImportanceSchema.optional(),
  localInteraction: localInteractionSchema.optional(),

  // Multi-select preferences (optional)
  accommodationTypes: accommodationTypesSchema,
  diningPreferences: diningPreferencesSchema,
  transportPreferences: transportPreferencesSchema,
  interests: interestsSchema,
  tripPurpose: tripPurposeSchema,
  budgetPriorities: budgetPrioritiesSchema,
  experiencePriorities: experiencePrioritiesSchema,
  accessibility: accessibilitySchema,
  mustHaves: mustHavesSchema,
  avoidances: avoidancesSchema,

  // Form state tracking
  isComplete: z.boolean().optional(),
  completedSections: z.array(z.string()).optional(),
});

// Validation for required core sections
export const coreRequiredSectionsSchema = z.object({
  pace: travelPaceSchema,
  activityLevel: activityLevelSchema,
  planningPreference: planningPreferenceSchema,
  budgetStyle: budgetStyleSchema,
  culturalInterest: culturalInterestSchema,
});

// Individual component validation schemas
export const pacePreferenceSchema = z.object({
  pace: travelPaceSchema,
});

export const activityLevelComponentSchema = z.object({
  activityLevel: activityLevelSchema,
});

export const planningStyleSchema = z.object({
  planningPreference: planningPreferenceSchema,
});

export const accommodationTypeSchema = z.object({
  accommodationTypes: z.array(z.string()).min(1, 'Please select at least one accommodation type'),
});

export const culturalInterestComponentSchema = z.object({
  culturalInterest: culturalInterestSchema,
});

export const budgetStyleComponentSchema = z.object({
  budgetStyle: budgetStyleSchema,
});

export const diningPreferencesComponentSchema = z.object({
  diningPreferences: z.array(z.string()).min(1, 'Please select at least one dining preference'),
});

export const transportPreferencesComponentSchema = z.object({
  transportPreferences: z.array(z.string()).optional(),
});

export const travelInterestsComponentSchema = z.object({
  interests: z.array(z.string()).min(1, 'Please select at least one travel interest'),
});

export const tripPurposeComponentSchema = z.object({
  tripPurpose: z.array(z.string()).optional(),
});

// Legacy travel style schemas (keeping for compatibility)
export const legacyTravelExperienceSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

export const tripVibeSchema = z.object({
  vibe: z.enum(['relaxed', 'adventurous', 'cultural', 'luxury', 'budget-friendly']),
  customVibe: z.string().optional(),
});

export const sampleDaysSchema = z.object({
  selectedDays: z.array(z.string()).min(1, 'Select at least one sample day'),
});

export const dinnerChoiceSchema = z.object({
  dinnerPreference: z.string().min(1, 'Please specify dinner preference'),
});

// Validation helper functions
export const validateTravelStyleData = (data: unknown) => {
  return travelStyleDataSchema.safeParse(data);
};

export const validateCoreRequiredSections = (data: unknown) => {
  return coreRequiredSectionsSchema.safeParse(data);
};

// Export types for TypeScript
export type TravelStyleDataType = z.infer<typeof travelStyleDataSchema>;
export type CoreRequiredSectionsType = z.infer<typeof coreRequiredSectionsSchema>;

export const tripNicknameSchema = z.object({
  nickname: z
    .string()
    .min(3, 'Nickname must be at least 3 characters')
    .max(50, 'Nickname must be less than 50 characters'),
});

// Combined Travel Style Schema
export const travelStyleGroupSchema = z.object({
  experience: z.array(z.string()).min(1, 'Select at least one experience level'),
  vibes: z.array(z.string()).min(1, 'Select at least one vibe'),
  sampleDays: z.array(z.string()).min(1, 'Select at least one sample day'),
  dinnerChoices: z.array(z.string()).min(1, 'Select at least one dinner choice'),
  tripNickname: z
    .string()
    .min(3, 'Nickname must be at least 3 characters')
    .max(50, 'Nickname must be less than 50 characters'),
});

// Type exports
export type TravelExperienceData = z.infer<typeof travelExperienceSchema>;
export type TripVibeData = z.infer<typeof tripVibeSchema>;
export type SampleDaysData = z.infer<typeof sampleDaysSchema>;
export type DinnerChoiceData = z.infer<typeof dinnerChoiceSchema>;
export type TripNicknameData = z.infer<typeof tripNicknameSchema>;
export type TravelStyleGroupData = z.infer<typeof travelStyleGroupSchema>;
