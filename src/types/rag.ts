// RAG Multi-Agent System Types
// Session-aware travel planning with vector database integration

import { z } from 'zod';

// =============================================================================
// SESSION DATA INTERFACES
// =============================================================================

/**
 * Core session data structure for temporary user data storage
 * Stored in Supabase with TTL, cached in Upstash Redis
 */
export interface SessionData {
  session_id: string;
  user_id?: string;
  session_state: 'active' | 'expired' | 'flushed';
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  raw_forms: Record<string, any>; // Raw form data by form_id
  flags: {
    vectorized: boolean;
    has_itinerary: boolean;
    budget_exceeded: boolean;
  };
  metadata: {
    ip_address?: string;
    user_agent?: string;
    form_count: number;
    last_form_id?: string;
  };
}

/**
 * Zod schema for SessionData validation
 */
export const SessionDataSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  user_id: z.string().optional(),
  session_state: z.enum(['active', 'expired', 'flushed']),
  created_at: z.string().datetime(),
  last_activity_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  raw_forms: z.record(z.string(), z.any()),
  flags: z.object({
    vectorized: z.boolean(),
    has_itinerary: z.boolean(),
    budget_exceeded: z.boolean(),
  }),
  metadata: z.object({
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
    form_count: z.number().int().min(0),
    last_form_id: z.string().optional(),
  }),
});

// =============================================================================
// VECTOR METADATA INTERFACES
// =============================================================================

/**
 * Metadata stored with each vector in Qdrant
 * Enables filtering, TTL enforcement, and context retrieval
 */
export interface VectorMetadata {
  session_id: string;
  form_id: string;
  summary_text: string; // Human-readable summary for LLM context
  destination?: string; // Primary destination for filtering
  trip_type?: 'leisure' | 'business' | 'adventure' | 'relaxation';
  group_size?: number;
  budget_range?: 'budget' | 'mid-range' | 'luxury';
  created_at: string;
  ttl_hours: number; // Time-to-live in hours
  content_type: 'destination' | 'interests' | 'accommodation' | 'transport' | 'experience';
  [key: string]: unknown; // Allow additional properties for Qdrant compatibility
}

/**
 * Zod schema for VectorMetadata validation
 */
export const VectorMetadataSchema = z.object({
  session_id: z.string().uuid(),
  form_id: z.string().min(1),
  summary_text: z.string().min(10).max(1000),
  destination: z.string().optional(),
  trip_type: z.enum(['leisure', 'business', 'adventure', 'relaxation']).optional(),
  group_size: z.number().int().min(1).max(50).optional(),
  budget_range: z.enum(['budget', 'mid-range', 'luxury']).optional(),
  created_at: z.string().datetime(),
  ttl_hours: z.number().int().min(1).max(168), // Max 1 week
  content_type: z.enum(['destination', 'interests', 'accommodation', 'transport', 'experience']),
});

// =============================================================================
// FORM DATA AGGREGATION
// =============================================================================

/**
 * Valid form IDs from the frontend components
 */
export type FormId =
  | 'TripDetailsForm'
  | 'TravelGroupSelector'
  | 'TravelInterests'
  | 'ItineraryInclusions'
  | 'TravelExperience'
  | 'TripVibe'
  | 'SampleDays'
  | 'DinnerChoice'
  | 'TripNickname'
  | 'ItineraryForm'
  | 'PreferencesModal'
  | 'ContactForm';

/**
 * Aggregated travel form data for vectorization
 * Combines all frontend forms into unified structure
 */
export interface TravelFormData {
  // Trip basics
  destination?: string;
  startDate?: string;
  endDate?: string;
  tripLengthDays?: number;
  groupSize?: number;

  // Travel preferences
  travelVibe?: 'relaxed' | 'adventure' | 'cultural' | 'luxury' | 'budget';
  interests?: Array<{
    category: string;
    intensity: 'low' | 'medium' | 'high';
  }>;

  // Accommodations & transport
  accommodationType?: 'hotel' | 'airbnb' | 'resort' | 'hostel' | 'mixed';
  transportPreference?: 'flight' | 'train' | 'car' | 'mixed';

  // Budget
  budgetRange?: {
    currency: string;
    total?: number;
    flexibility: 'strict' | 'flexible' | 'no-limit';
  };

  // Special requirements
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  specialRequests?: string;

  // Contact and booking
  contactInfo?: {
    email?: string;
    phone?: string;
    preferredContact: 'email' | 'phone' | 'both';
  };
}

/**
 * Zod schema for TravelFormData validation
 */
export const TravelFormDataSchema = z.object({
  destination: z.string().min(2).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tripLengthDays: z.number().int().min(1).max(365).optional(),
  groupSize: z.number().int().min(1).max(50).optional(),

  travelVibe: z.enum(['relaxed', 'adventure', 'cultural', 'luxury', 'budget']).optional(),
  interests: z
    .array(
      z.object({
        category: z.string(),
        intensity: z.enum(['low', 'medium', 'high']),
      })
    )
    .optional(),

  accommodationType: z.enum(['hotel', 'airbnb', 'resort', 'hostel', 'mixed']).optional(),
  transportPreference: z.enum(['flight', 'train', 'car', 'mixed']).optional(),

  budgetRange: z
    .object({
      currency: z.string().length(3),
      total: z.number().positive().optional(),
      flexibility: z.enum(['strict', 'flexible', 'no-limit']),
    })
    .optional(),

  dietaryRestrictions: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  specialRequests: z.string().max(500).optional(),

  contactInfo: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      preferredContact: z.enum(['email', 'phone', 'both']),
    })
    .optional(),
});

// Date validation refinement
export const TravelFormDataWithDateValidation = TravelFormDataSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type ValidatedTravelFormData = z.infer<typeof TravelFormDataWithDateValidation>;

// =============================================================================
// RAG REQUEST/RESPONSE INTERFACES
// =============================================================================

/**
 * Base RAG operation request structure
 */
export interface RAGRequest {
  session_id: string;
  request_id: string;
  timestamp?: string;
  options?: {
    include_web_search?: boolean;
    include_citations?: boolean;
    response_format?: 'structured' | 'text';
    max_results?: number;
    similarity_threshold?: number;
    preferred_provider?: 'groq' | 'gemini' | 'cerebras';
    complexity_override?: 'simple' | 'medium' | 'complex';
    max_tokens?: number;
  };
}

/**
 * Zod schema for RAGRequest validation
 */
export const RAGRequestSchema = z.object({
  session_id: z.string().uuid(),
  request_id: z.string().uuid(),
  timestamp: z.string().datetime().optional(),
  options: z
    .object({
      include_web_search: z.boolean().optional(),
      include_citations: z.boolean().optional(),
      response_format: z.enum(['structured', 'text']).optional(),
      max_results: z.number().int().min(1).max(20).optional(),
      similarity_threshold: z.number().min(0).max(1).optional(),
      preferred_provider: z.enum(['groq', 'gemini', 'cerebras']).optional(),
      complexity_override: z.enum(['simple', 'medium', 'complex']).optional(),
      max_tokens: z.number().int().min(100).max(8000).optional(),
    })
    .optional(),
});

/**
 * Itinerary generation request
 */
export interface ItineraryRequest extends RAGRequest {
  operation: 'generate_itinerary';
}

/**
 * Question answering request
 */
export interface QuestionRequest extends RAGRequest {
  question: string;
}

/**
 * Form submission request
 */
export interface FormSubmissionRequest {
  session_id: string;
  form_id: string;
  form_data: any;
  trigger_vectorization?: boolean;
}

/**
 * Base RAG response structure
 */
export interface RAGResponse {
  request_id: string;
  session_id: string;
  timestamp: string;
  processing_time_ms: number;
  tokens_used: TokenUsage;
  citations?: Citation[];
  confidence_score?: number;
}

// =============================================================================
// TOKEN USAGE AND BUDGET TRACKING
// =============================================================================

/**
 * Token usage tracking for cost management
 */
export interface TokenUsage {
  provider: 'groq' | 'gemini' | 'cerebras' | 'huggingface';
  operation: 'embedding' | 'generation' | 'search' | 'summarization';
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens: number;
  cost_usd: number;
  model_name?: string;
}

/**
 * Budget tracking per session
 */
export interface BudgetTracking {
  session_id: string;
  total_spent_usd: number;
  limit_usd: number;
  operations_count: number;
  last_operation_at: string;
  is_over_budget: boolean;
  breakdown: {
    embedding_cost: number;
    generation_cost: number;
    search_cost: number;
  };
}

/**
 * Zod schemas for budget tracking
 */
export const TokenUsageSchema = z.object({
  provider: z.enum(['groq', 'gemini', 'cerebras', 'huggingface']),
  operation: z.enum(['embedding', 'generation', 'search', 'summarization']),
  prompt_tokens: z.number().int().min(0).optional(),
  completion_tokens: z.number().int().min(0).optional(),
  total_tokens: z.number().int().min(0),
  cost_usd: z.number().min(0),
  model_name: z.string().optional(),
});

export const BudgetTrackingSchema = z.object({
  session_id: z.string().uuid(),
  total_spent_usd: z.number().min(0),
  limit_usd: z.number().positive(),
  operations_count: z.number().int().min(0),
  last_operation_at: z.string().datetime(),
  is_over_budget: z.boolean(),
  breakdown: z.object({
    embedding_cost: z.number().min(0),
    generation_cost: z.number().min(0),
    search_cost: z.number().min(0),
  }),
});

// =============================================================================
// CITATIONS AND SEARCH RESULTS
// =============================================================================

/**
 * Citation for generated content
 */
export interface Citation {
  id: string;
  source_type: 'vector_search' | 'web_search' | 'form_data';
  url?: string;
  title?: string;
  snippet?: string;
  relevance_score?: number;
  accessed_at: string;
}

/**
 * Web search result structure
 */
export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  content?: string;
  relevance_score: number;
  search_query: string;
  retrieved_at: string;
}

/**
 * Zod schemas for citations and search
 */
export const CitationSchema = z.object({
  id: z.string(),
  source_type: z.enum(['vector_search', 'web_search', 'form_data']),
  url: z.string().url().optional(),
  title: z.string().optional(),
  snippet: z.string().optional(),
  relevance_score: z.number().min(0).max(1).optional(),
  accessed_at: z.string().datetime(),
});

export const SearchResultSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
  content: z.string().optional(),
  relevance_score: z.number().min(0).max(1),
  search_query: z.string(),
  retrieved_at: z.string().datetime(),
});

// =============================================================================
// ITINERARY STRUCTURE
// =============================================================================

/**
 * Single day in an itinerary
 */
export interface ItineraryDay {
  date: string; // YYYY-MM-DD format
  location: string;
  activities: Activity[];
  meals?: {
    breakfast?: Activity;
    lunch?: Activity;
    dinner?: Activity;
  };
  accommodation?: {
    name: string;
    type: string;
    booking_url?: string;
  };
  transportation?: {
    method: string;
    details: string;
    booking_url?: string;
  };
}

/**
 * Individual activity within a day
 */
export interface Activity {
  id: string;
  name: string;
  description: string;
  location: {
    name: string;
    address?: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  time_slot: {
    start_time: string; // HH:MM format
    end_time: string; // HH:MM format
    flexibility: 'strict' | 'flexible' | 'optional';
  };
  duration_minutes: number;
  category: 'culture' | 'food' | 'nature' | 'entertainment' | 'shopping' | 'transport';
  price_estimate?: {
    amount: number;
    currency: string;
    per_person: boolean;
  };
  booking_info?: {
    required: boolean;
    url?: string;
    phone?: string;
    notes?: string;
  };
  accessibility_friendly: boolean;
  weather_dependent: boolean;
}

/**
 * Complete itinerary response
 */
export interface ItineraryResponse extends RAGResponse {
  data: {
    type: 'itinerary';
    itinerary: ItineraryDay[];
    summary: string;
    total_cost_estimate?: {
      amount: number;
      currency: string;
      breakdown: Record<string, number>;
    };
    actions: Array<{
      type: 'booking' | 'download' | 'share' | 'modify';
      label: string;
      url?: string;
      description?: string;
    }>;
  };
}

/**
 * Question answering response
 */
export interface QuestionResponse extends RAGResponse {
  data: {
    type: 'question_answer';
    answer: string;
    context_used: string[]; // Form IDs that provided context
    related_suggestions: string[];
  };
}

/**
 * Zod schemas for itinerary structures
 */
export const ActivitySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(1000),
  location: z.object({
    name: z.string(),
    address: z.string().optional(),
    city: z.string(),
    country: z.string(),
    coordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
  }),
  time_slot: z.object({
    start_time: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/),
    end_time: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/),
    flexibility: z.enum(['strict', 'flexible', 'optional']),
  }),
  duration_minutes: z.number().int().min(15).max(1440),
  category: z.enum(['culture', 'food', 'nature', 'entertainment', 'shopping', 'transport']),
  price_estimate: z
    .object({
      amount: z.number().min(0),
      currency: z.string().length(3),
      per_person: z.boolean(),
    })
    .optional(),
  booking_info: z
    .object({
      required: z.boolean(),
      url: z.string().url().optional(),
      phone: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  accessibility_friendly: z.boolean(),
  weather_dependent: z.boolean(),
});

export const ItineraryDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string(),
  activities: z.array(ActivitySchema),
  meals: z
    .object({
      breakfast: ActivitySchema.optional(),
      lunch: ActivitySchema.optional(),
      dinner: ActivitySchema.optional(),
    })
    .optional(),
  accommodation: z
    .object({
      name: z.string(),
      type: z.string(),
      booking_url: z.string().url().optional(),
    })
    .optional(),
  transportation: z
    .object({
      method: z.string(),
      details: z.string(),
      booking_url: z.string().url().optional(),
    })
    .optional(),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * Standard API success response
 */
export interface APISuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    total_count?: number;
    page?: number;
    per_page?: number;
  };
}

/**
 * Standard API error response
 */
export interface APIErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
  retry_after?: number; // For rate limiting
}

/**
 * Form submission response
 */
export interface FormSubmissionResponse {
  success: boolean;
  session_id: string;
  vectorization_status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
}

/**
 * Session status response
 */
export interface SessionStatusResponse {
  session_id: string;
  session_state: 'active' | 'expired' | 'flushed';
  form_count: number;
  vectorization_status: 'pending' | 'completed' | 'failed';
  last_activity_at: string;
  expires_at: string;
  budget_status: {
    spent_usd: number;
    limit_usd: number;
    remaining_usd: number;
    is_over_budget: boolean;
  };
}

/**
 * Zod schemas for API requests and responses
 */
export const FormSubmissionRequestSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  form_id: z.string().min(1, 'Form ID is required'),
  form_data: z.any().refine((data) => data !== null && data !== undefined, 'Form data is required'),
  trigger_vectorization: z.boolean().optional(),
});

export const FormSubmissionResponseSchema = z.object({
  success: z.boolean(),
  session_id: z.string().uuid(),
  vectorization_status: z.enum(['pending', 'queued', 'processing', 'completed', 'failed']),
  message: z.string().optional(),
});

export const SessionStatusResponseSchema = z.object({
  session_id: z.string().uuid(),
  session_state: z.enum(['active', 'expired', 'flushed']),
  form_count: z.number().int().min(0),
  vectorization_status: z.enum(['pending', 'completed', 'failed']),
  last_activity_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  budget_status: z.object({
    spent_usd: z.number().min(0),
    limit_usd: z.number().positive(),
    remaining_usd: z.number(),
    is_over_budget: z.boolean(),
  }),
});
