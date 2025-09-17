# RAG Multi-Agent System Data Model

**Date**: September 17, 2025  
**Context**: Session-aware RAG travel planning system  
**Status**: Phase 1 Design

## Core Entity Definitions

### Session Management

#### SessionData

```typescript
interface SessionData {
  // Primary identifier
  id: string; // UUID v4 format

  // User association (optional for anonymous sessions)
  user_id?: string;

  // Session lifecycle
  session_state: 'active' | 'completed' | 'expired' | 'processing';
  created_at: string; // ISO 8601 timestamp
  expires_at: string; // ISO 8601 timestamp
  last_activity_at: string; // Updated on each interaction

  // Form data storage
  raw_forms: Record<string, FormData>; // Keyed by form component name
  summary: string; // Human-readable session summary for vectorization

  // Metadata
  version: number; // For schema migrations
  flags: SessionFlags;
}

interface SessionFlags {
  vectorized: boolean; // Whether session has been processed for vectors
  web_search_enabled: boolean; // User consent for real-time web data
  extended_ttl: boolean; // User requested extended session (7 days)
  anonymous: boolean; // Session not associated with user account
}
```

#### SessionCache

```typescript
interface SessionCache {
  // Fast session token for Upstash Redis
  token: string; // Short session identifier for client
  session_id: string; // Maps to SessionData.id in Supabase
  last_activity: string; // ISO 8601 timestamp
  ttl: number; // TTL in seconds (Redis native)

  // Cached data for performance
  user_id?: string;
  session_state: SessionData['session_state'];
  form_count: number; // Number of completed forms
}
```

### Vector Database Schema

#### TravelVector

```typescript
interface TravelVector {
  // Qdrant vector document
  id: string; // Format: {session_id}-{form_id}-{timestamp}
  vector: number[]; // 384-dimensional embeddings (all-MiniLM-L6-v2)

  // Payload for filtering and metadata
  payload: VectorMetadata;
}

interface VectorMetadata {
  // Session association
  session_id: string;
  form_id: string; // TripDetailsForm, TravelInterests, etc.

  // Searchable content
  summary_text: string; // PII-sanitized human-readable travel intent
  destination?: string; // Primary destination for geo-filtering
  travel_dates?: string; // Date range for temporal filtering

  // Classification metadata
  trip_type: 'leisure' | 'business' | 'adventure' | 'cultural' | 'luxury' | 'budget';
  group_size: number;
  budget_range: 'budget' | 'mid-range' | 'luxury';

  // Lifecycle metadata
  created_at: string; // ISO 8601 timestamp
  ttl_hours: number; // For cleanup jobs
  version: number; // For vector schema migrations

  // User association (for cross-session retrieval)
  user_id?: string;

  // Content categorization
  content_type: 'destination' | 'preferences' | 'constraints' | 'activities' | 'accommodation';
}
```

### Form Data Schemas

#### TravelFormData (Aggregate)

```typescript
interface TravelFormData {
  // Trip basics
  destination: string;
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
  groupSize: number;

  // Travel style and preferences
  travelVibe: 'relaxed' | 'adventure' | 'cultural' | 'luxury' | 'budget' | 'mixed';
  interests: TravelInterest[];
  accommodationType: 'hotel' | 'airbnb' | 'hostel' | 'resort' | 'camping' | 'mixed';

  // Constraints and requirements
  budgetRange: BudgetRange;
  mobility: MobilityRequirements;
  dietary: DietaryRequirements;

  // Experience level and customization
  experienceLevel: 'first-time' | 'experienced' | 'expert' | 'local';
  customizations: TravelCustomization[];

  // Contact and follow-up
  contactInfo?: ContactInfo;
  tripNickname?: string;

  // Metadata
  submittedAt: string; // ISO 8601 timestamp
  formVersion: string; // For schema evolution
}

interface TravelInterest {
  category:
    | 'food'
    | 'culture'
    | 'adventure'
    | 'nature'
    | 'history'
    | 'nightlife'
    | 'shopping'
    | 'relaxation';
  intensity: 'low' | 'medium' | 'high';
  specific?: string[]; // Specific interests within category
}

interface BudgetRange {
  currency: string; // ISO 4217 currency code
  min?: number;
  max?: number;
  total?: number;
  perDay?: number;
  flexibility: 'strict' | 'flexible' | 'very-flexible';
}

interface MobilityRequirements {
  walkingDistance: 'minimal' | 'moderate' | 'extensive';
  accessibilityNeeds: boolean;
  transportPreference: 'public' | 'private' | 'walking' | 'cycling' | 'mixed';
}

interface DietaryRequirements {
  restrictions: ('vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'kosher' | 'none')[];
  allergies: string[];
  preferences: string[];
}

interface TravelCustomization {
  type: 'must-include' | 'avoid' | 'prefer' | 'time-constraint';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'required';
}

interface ContactInfo {
  email?: string;
  phone?: string;
  preferredContact: 'email' | 'phone' | 'app';
  timezone: string; // IANA timezone identifier
}
```

### RAG Operation Schemas

#### RAGRequest

```typescript
interface RAGRequest {
  // Session context
  session_id: string;
  operation: 'generate_itinerary' | 'ask_question' | 'refine_plan' | 'get_recommendations';

  // Query parameters
  query?: string; // Natural language query for Q&A
  options: RAGOptions;

  // Request metadata
  request_id: string; // For tracing and deduplication
  timestamp: string; // ISO 8601 timestamp
  client_info?: ClientInfo;
}

interface RAGOptions {
  // Retrieval parameters
  max_results: number; // Default: 5
  similarity_threshold: number; // Default: 0.7
  include_cross_session: boolean; // Search other user sessions

  // Generation parameters
  include_web_search: boolean; // Default: true
  web_search_queries?: string[]; // Custom search queries
  complexity_override?: 'simple' | 'medium' | 'complex';

  // Output preferences
  response_format: 'structured' | 'conversational' | 'mixed';
  include_citations: boolean; // Default: true
  include_alternatives: boolean; // Include alternative suggestions

  // Provider preferences
  preferred_provider?: 'groq' | 'gemini' | 'cerebras';
  max_tokens?: number;
  temperature?: number;
}

interface ClientInfo {
  user_agent: string;
  timezone: string;
  language: string; // ISO 639-1 language code
  platform: 'web' | 'mobile' | 'api';
}
```

#### RAGResponse

```typescript
interface RAGResponse {
  // Response identification
  request_id: string;
  session_id: string;
  timestamp: string; // ISO 8601 timestamp

  // Response data
  data: ItineraryResponse | QuestionResponse | RecommendationResponse;

  // Metadata
  processing_time_ms: number;
  tokens_used: TokenUsage;
  citations: Citation[];
  confidence_score: number; // 0-1 scale

  // Context information
  retrieval_context: RetrievalContext;
  generation_context: GenerationContext;
}

interface ItineraryResponse {
  type: 'itinerary';
  itinerary: ItineraryDay[];
  summary: string;
  total_budget_estimate?: BudgetEstimate;
  actions: ActionLink[];
  alternatives?: ItineraryAlternative[];
}

interface QuestionResponse {
  type: 'question_answer';
  answer: string;
  related_suggestions: string[];
  context_used: string[]; // Which form data was referenced
}

interface RecommendationResponse {
  type: 'recommendations';
  recommendations: Recommendation[];
  categories: string[];
  personalization_score: number;
}

interface ItineraryDay {
  date: string; // ISO 8601 date
  location: string;
  activities: Activity[];
  meals: MealRecommendation[];
  accommodation?: AccommodationRecommendation;
  transportation?: TransportationRecommendation;
  budget_estimate: DayBudgetEstimate;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  location: Location;
  time_slot: TimeSlot;
  duration_minutes: number;
  cost_estimate?: CostEstimate;
  booking_info?: BookingInfo;
  category: TravelInterest['category'];
  difficulty?: 'easy' | 'moderate' | 'challenging';
  accessibility_friendly: boolean;
}

interface Location {
  name: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  neighborhood?: string;
  city: string;
  country: string;
}

interface TimeSlot {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  flexibility: 'fixed' | 'flexible' | 'approximate';
}
```

### Web Search Integration

#### SearchRequest

```typescript
interface SearchRequest {
  queries: string[]; // Multiple search queries for comprehensive results
  context: SearchContext;
  options: SearchOptions;
}

interface SearchContext {
  destination: string;
  travel_dates: {
    start: string;
    end: string;
  };
  interests: string[];
  budget_level: 'budget' | 'mid-range' | 'luxury';
}

interface SearchOptions {
  max_results_per_query: number; // Default: 5
  recency_preference: 'latest' | 'relevant' | 'mixed'; // Prefer recent vs relevant results
  source_types: ('official' | 'review' | 'blog' | 'news' | 'social')[];
  language_codes: string[]; // Preferred result languages
}

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  source_type: SearchOptions['source_types'][number];
  published_date?: string; // ISO 8601 date when available
  relevance_score: number; // 0-1 scale
  extracted_facts: ExtractedFact[];
}

interface ExtractedFact {
  type: 'price' | 'hours' | 'contact' | 'location' | 'availability' | 'rating';
  value: string;
  confidence: number; // 0-1 scale
  source_snippet: string;
}
```

### Citations and Provenance

#### Citation

```typescript
interface Citation {
  id: string;
  source_type: 'web_search' | 'user_session' | 'knowledge_base' | 'llm_generation';
  url?: string;
  title: string;
  snippet: string;
  accessed_at: string; // ISO 8601 timestamp
  relevance_score: number;
  used_for: CitationUsage[];
}

interface CitationUsage {
  content_type: 'activity' | 'restaurant' | 'accommodation' | 'transportation' | 'general_info';
  content_id?: string; // References Activity.id, etc.
  quote?: string; // Specific text that was cited
}
```

### Cost and Token Tracking

#### TokenUsage

```typescript
interface TokenUsage {
  provider: 'groq' | 'gemini' | 'cerebras' | 'huggingface';
  operation: 'embedding' | 'search' | 'generation' | 'web_search';

  input_tokens: number;
  output_tokens: number;
  total_tokens: number;

  cost_usd: number;
  model_used: string; // Specific model version

  // Performance metrics
  latency_ms: number;
  success: boolean;
  error_type?: string;
}

interface BudgetTracking {
  session_id: string;
  user_id?: string;

  // Usage accumulation
  total_cost_usd: number;
  operations_count: number;
  tokens_used: Record<string, number>; // By provider

  // Budget management
  daily_limit_usd: number;
  monthly_limit_usd: number;
  current_day_usage: number;
  current_month_usage: number;

  // Timestamps
  first_request: string;
  last_request: string;
  budget_period_start: string;
}
```

### Health and Monitoring

#### SystemHealth

```typescript
interface SystemHealth {
  timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  components: ComponentHealth[];
  performance_metrics: PerformanceMetrics;
}

interface ComponentHealth {
  name: 'qdrant' | 'supabase' | 'upstash' | 'groq' | 'gemini' | 'cerebras' | 'huggingface';
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms?: number;
  error_rate?: number; // 0-1 scale
  last_check: string;
  details?: Record<string, any>;
}

interface PerformanceMetrics {
  // Response time percentiles
  p50_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;

  // Throughput
  requests_per_minute: number;
  active_sessions: number;

  // Error rates
  error_rate_5m: number; // 5-minute error rate
  error_rate_1h: number; // 1-hour error rate

  // Resource utilization
  vector_store_usage_mb: number;
  session_store_usage_mb: number;
  cache_hit_rate: number; // 0-1 scale
}
```

## Database Schemas

### Supabase Tables

#### sessions

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_state session_state_enum NOT NULL DEFAULT 'active',
  raw_forms JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  flags JSONB NOT NULL DEFAULT '{"vectorized": false, "web_search_enabled": true, "extended_ttl": false, "anonymous": true}'
);

CREATE TYPE session_state_enum AS ENUM ('active', 'completed', 'expired', 'processing');

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_state ON sessions(session_state);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity_at);

-- TTL cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (requires pg_cron extension)
SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');
```

#### budget_tracking

```sql
CREATE TABLE budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  total_cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  operations_count INTEGER NOT NULL DEFAULT 0,
  tokens_used JSONB NOT NULL DEFAULT '{}',

  daily_limit_usd DECIMAL(10, 6) NOT NULL DEFAULT 1.00,
  monthly_limit_usd DECIMAL(10, 6) NOT NULL DEFAULT 10.00,
  current_day_usage DECIMAL(10, 6) NOT NULL DEFAULT 0,
  current_month_usage DECIMAL(10, 6) NOT NULL DEFAULT 0,

  first_request TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_request TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  budget_period_start TIMESTAMPTZ NOT NULL DEFAULT DATE_TRUNC('month', NOW()),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_budget_user_id ON budget_tracking(user_id);
CREATE INDEX idx_budget_session_id ON budget_tracking(session_id);
CREATE INDEX idx_budget_period ON budget_tracking(budget_period_start);
```

### Qdrant Collections

#### travel-sessions Collection

```typescript
// Collection configuration
const collectionConfig = {
  name: 'travel-sessions',
  vectors: {
    size: 384, // all-MiniLM-L6-v2 dimensions
    distance: 'Cosine', // Best for semantic similarity
  },
  optimizers_config: {
    default_segment_number: 2,
    max_segment_size: 200000,
    memmap_threshold: 100000,
    indexing_threshold: 20000,
  },
  replication_factor: 2, // For production reliability
  shard_number: 1, // Start with 1, scale as needed
};

// Payload schema for filtering
const payloadSchema = {
  session_id: { type: 'keyword', index: true },
  form_id: { type: 'keyword', index: true },
  destination: { type: 'keyword', index: true },
  trip_type: { type: 'keyword', index: true },
  user_id: { type: 'keyword', index: true },
  created_at: { type: 'datetime', index: true },
  content_type: { type: 'keyword', index: true },
  group_size: { type: 'integer', index: true },
  budget_range: { type: 'keyword', index: true },
};
```

## Data Validation Schemas

### Zod Validation Rules

```typescript
import { z } from 'zod';

// Session validation
export const SessionDataSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid().optional(),
    session_state: z.enum(['active', 'completed', 'expired', 'processing']),
    created_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    last_activity_at: z.string().datetime(),
    raw_forms: z.record(z.any()),
    summary: z.string().min(10).max(2000),
    version: z.number().int().min(1),
    flags: z.object({
      vectorized: z.boolean(),
      web_search_enabled: z.boolean(),
      extended_ttl: z.boolean(),
      anonymous: z.boolean(),
    }),
  })
  .refine((data) => new Date(data.expires_at) > new Date(data.created_at), {
    message: 'expires_at must be after created_at',
  });

// RAG request validation
export const RAGRequestSchema = z.object({
  session_id: z.string().uuid(),
  operation: z.enum(['generate_itinerary', 'ask_question', 'refine_plan', 'get_recommendations']),
  query: z.string().min(1).max(1000).optional(),
  options: z.object({
    max_results: z.number().int().min(1).max(20).default(5),
    similarity_threshold: z.number().min(0).max(1).default(0.7),
    include_cross_session: z.boolean().default(false),
    include_web_search: z.boolean().default(true),
    web_search_queries: z.array(z.string()).max(5).optional(),
    complexity_override: z.enum(['simple', 'medium', 'complex']).optional(),
    response_format: z.enum(['structured', 'conversational', 'mixed']).default('structured'),
    include_citations: z.boolean().default(true),
    include_alternatives: z.boolean().default(false),
    preferred_provider: z.enum(['groq', 'gemini', 'cerebras']).optional(),
    max_tokens: z.number().int().min(100).max(8000).optional(),
    temperature: z.number().min(0).max(2).optional(),
  }),
  request_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  client_info: z
    .object({
      user_agent: z.string(),
      timezone: z.string(),
      language: z.string().length(2),
      platform: z.enum(['web', 'mobile', 'api']),
    })
    .optional(),
});

// Travel form validation
export const TravelFormDataSchema = z
  .object({
    destination: z.string().min(2).max(100),
    startDate: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date(), {
        message: 'Start date must be in the future',
      }),
    endDate: z.string().datetime(),
    groupSize: z.number().int().min(1).max(20),
    travelVibe: z.enum(['relaxed', 'adventure', 'cultural', 'luxury', 'budget', 'mixed']),
    interests: z
      .array(
        z.object({
          category: z.enum([
            'food',
            'culture',
            'adventure',
            'nature',
            'history',
            'nightlife',
            'shopping',
            'relaxation',
          ]),
          intensity: z.enum(['low', 'medium', 'high']),
          specific: z.array(z.string()).optional(),
        })
      )
      .min(1)
      .max(8),
    accommodationType: z.enum(['hotel', 'airbnb', 'hostel', 'resort', 'camping', 'mixed']),
    budgetRange: z.object({
      currency: z.string().length(3), // ISO 4217
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
      total: z.number().positive().optional(),
      perDay: z.number().positive().optional(),
      flexibility: z.enum(['strict', 'flexible', 'very-flexible']),
    }),
    // ... additional validation rules
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
  });
```

## Migration Strategies

### Schema Evolution

```typescript
interface MigrationPlan {
  version: number;
  description: string;
  sql_up: string;
  sql_down: string;
  vector_migration?: VectorMigration;
}

interface VectorMigration {
  collection_name: string;
  operation: 'add_field' | 'remove_field' | 'reindex' | 'recreate';
  batch_size: number;
  estimated_time_minutes: number;
}
```

This data model provides a comprehensive foundation for the RAG multi-agent system while maintaining type safety, performance optimization, and constitutional compliance throughout the Hylo Travel AI architecture.
