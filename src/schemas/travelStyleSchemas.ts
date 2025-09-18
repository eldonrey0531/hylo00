import { z } from 'zod';

// Travel Style Schemas
export const travelExperienceSchema = z.object({
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
