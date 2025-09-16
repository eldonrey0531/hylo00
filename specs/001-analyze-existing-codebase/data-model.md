# Data Model: Hylo Travel Itinerary System

**Date**: 2025-09-17 | **Feature**: 001-analyze-existing-codebase

## Core Entities

### TravelFormData

**Purpose**: Comprehensive travel request data structure
**Validation**: Zod schema validation for all fields
**Source**: Existing `src/types/index.ts` and service interfaces

```typescript
interface TravelFormData {
  tripDetails: TripDetails;
  groups: string[];
  interests: string[];
  inclusions: string[];
  inclusionPreferences?: InclusionPreferences;
  experience: string[];
  vibes: string[];
  sampleDays: string[];
  dinnerChoices: string[];
  nickname: string;
  contact: ContactInfo;
}

interface TripDetails {
  location: string; // Travel destination
  departDate: string; // ISO date string
  returnDate: string; // ISO date string
  plannedDays: number; // Trip duration
  adults: number; // Number of adult travelers
  children: number; // Number of child travelers
  childrenAges?: number[]; // Ages of children
  budget: number; // Total budget amount
  currency: string; // Currency code (USD, EUR, etc.)
}

interface InclusionPreferences {
  nature?: {
    naturePreferences: string; // Specific nature activity preferences
  };
  accommodations?: any;
  dining?: any;
  transportation?: any;
  activities?: any;
  guides?: any;
}

interface ContactInfo {
  email?: string;
  phone?: string;
  name?: string;
}
```

**Validation Rules**:

- `location`: Max 100 characters, alphanumeric plus common punctuation
- `departDate`/`returnDate`: Valid ISO date strings, return after depart
- `plannedDays`: Positive integer, max 365
- `adults`: Minimum 1, maximum 50
- `children`: 0-20, with corresponding ages if > 0
- `budget`: Positive number, reasonable ranges by currency
- `currency`: Valid ISO 4217 currency codes

### AgentLog

**Purpose**: Tracking AI agent activities during itinerary generation
**Validation**: Structured logging format for observability
**Source**: Existing `src/services/multiAgentService.ts`

```typescript
interface AgentLog {
  agentId: number; // Sequential agent identifier
  agentName: string; // Human-readable agent name
  model: string; // LLM model used (groq-llama, etc.)
  timestamp: string; // ISO timestamp
  input: any; // Agent input data/prompt
  output: any; // Agent output/response
  searchQueries?: string[]; // Web search queries (if applicable)
  decisions?: string[]; // Key decisions made
  reasoning?: string; // Agent reasoning process

  // Constitutional additions
  provider: string; // LLM provider (groq, cerebras, gemini)
  tokenUsage: TokenUsage; // Token consumption tracking
  cost: number; // Estimated cost for this operation
  latency: number; // Response time in milliseconds
  fallbackUsed?: boolean; // Whether this was a fallback call
  traceId: string; // LangSmith trace identifier
}

interface TokenUsage {
  prompt: number; // Input tokens
  completion: number; // Output tokens
  total: number; // Total tokens
}
```

**State Transitions**:

- `PENDING` → `PROCESSING` → `COMPLETED` | `FAILED`
- Failed agents trigger fallback provider selection
- All state changes tracked in LangSmith

### LLMProvider

**Purpose**: Abstraction for multiple AI provider integration
**Validation**: Interface contract for provider implementations
**Source**: New architectural requirement from research

```typescript
interface LLMProvider {
  name: string; // Provider identifier
  model: string; // Specific model identifier
  capabilities: string[]; // Supported capabilities
  tier: 'free' | 'paid'; // Billing tier

  // Availability and capacity
  isAvailable(): Promise<boolean>;
  hasCapacity(): Promise<boolean>;
  getRateLimit(): Promise<RateLimit>;

  // Cost estimation
  estimateCost(request: LLMRequest): Promise<number>;
  getUsageStats(): Promise<UsageStats>;

  // Core generation
  generate(request: LLMRequest): Promise<LLMResponse>;
  generateStream(request: LLMRequest): AsyncIterable<string>;
}

interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  context?: any;
}

interface LLMResponse {
  content: string;
  tokenUsage: TokenUsage;
  model: string;
  provider: string;
  latency: number;
  traceId: string;
}

interface RateLimit {
  requestsPerMinute: number;
  tokensPerMinute: number;
  remaining: number;
  resetTime: Date;
}

interface UsageStats {
  requestsToday: number;
  tokensToday: number;
  costToday: number;
  quotaRemaining: number;
}
```

### MultiAgentOrchestrator

**Purpose**: Coordinate multiple AI agents for travel planning
**Validation**: State machine for agent workflow
**Source**: Enhanced version of existing multi-agent service

```typescript
interface MultiAgentOrchestrator {
  sessionId: string;
  agents: AgentDefinition[];
  currentAgent: number;
  logs: AgentLog[];
  state: OrchestrationState;

  // Core orchestration
  execute(request: TravelFormData): Promise<ItineraryResult>;
  executeAgent(agentId: number, input: any): Promise<AgentResult>;

  // State management
  getState(): OrchestrationState;
  canProceed(): boolean;
  handleFailure(error: AgentError): Promise<void>;
}

interface AgentDefinition {
  id: number;
  name: string;
  description: string;
  inputSchema: any; // Zod schema for input validation
  outputSchema: any; // Zod schema for output validation
  dependencies: number[]; // Required previous agents
  provider: string; // Preferred LLM provider
  fallbackProviders: string[]; // Fallback provider chain
  timeout: number; // Max execution time (ms)
}

type OrchestrationState = 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'FALLBACK';

interface ItineraryResult {
  itinerary: string;
  logs: AgentLog[];
  totalCost: number;
  totalLatency: number;
  providersUsed: string[];
  success: boolean;
  fallbacksUsed: number;
}
```

### ErrorBoundary

**Purpose**: Structured error handling for AI operations
**Validation**: Error classification and recovery strategies
**Source**: New constitutional requirement

```typescript
interface AIError {
  code: string; // Error classification code
  message: string; // Human-readable message
  provider?: string; // Failed provider
  agent?: string; // Failed agent
  timestamp: Date;
  context: any; // Request context
  recoverable: boolean; // Can be retried
  fallbackAvailable: boolean; // Has fallback options
  traceId?: string; // LangSmith trace ID
}

type ErrorCode =
  | 'RATE_LIMIT_EXCEEDED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'TIMEOUT'
  | 'QUOTA_EXCEEDED'
  | 'AUTHENTICATION_FAILED'
  | 'INTERNAL_ERROR';

interface ErrorRecoveryStrategy {
  code: ErrorCode;
  retryable: boolean;
  retryDelay: number; // Delay before retry (ms)
  maxRetries: number;
  fallbackProvider?: string;
  fallbackCapability?: string;
  userMessage: string;
}
```

## Relationships

### Data Flow

```
TravelFormData → MultiAgentOrchestrator → LLMProvider → AgentLog → ItineraryResult
                      ↓
                 ErrorBoundary (if failures)
                      ↓
              Fallback strategies
```

### Dependencies

- **TravelFormData** is input to **MultiAgentOrchestrator**
- **MultiAgentOrchestrator** manages multiple **LLMProvider** instances
- **AgentLog** tracks all interactions with **LLMProvider**
- **ErrorBoundary** handles failures from any **LLMProvider**
- **ItineraryResult** aggregates data from all **AgentLog** entries

### State Consistency

- All agent operations are idempotent
- Failed operations maintain partial state for recovery
- Logs are immutable and append-only
- Provider selection is deterministic based on capabilities and availability

## Validation Schemas

### Zod Schema Definitions

```typescript
import { z } from 'zod';

export const TripDetailsSchema = z
  .object({
    location: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-zA-Z\s,.-]+$/),
    departDate: z.string().datetime(),
    returnDate: z.string().datetime(),
    plannedDays: z.number().int().min(1).max(365),
    adults: z.number().int().min(1).max(50),
    children: z.number().int().min(0).max(20),
    childrenAges: z.array(z.number().int().min(0).max(18)).optional(),
    budget: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']),
  })
  .refine((data) => {
    const depart = new Date(data.departDate);
    const return_date = new Date(data.returnDate);
    return return_date > depart;
  }, 'Return date must be after departure date');

export const TravelFormDataSchema = z.object({
  tripDetails: TripDetailsSchema,
  groups: z.array(z.string()).min(0),
  interests: z.array(z.string()).min(0),
  inclusions: z.array(z.string()).min(0),
  experience: z.array(z.string()).min(0),
  vibes: z.array(z.string()).min(0),
  sampleDays: z.array(z.string()).min(0),
  dinnerChoices: z.array(z.string()).min(0),
  nickname: z.string().max(50),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    name: z.string().max(100).optional(),
  }),
});

export const AgentLogSchema = z.object({
  agentId: z.number().int(),
  agentName: z.string(),
  model: z.string(),
  timestamp: z.string().datetime(),
  input: z.any(),
  output: z.any(),
  provider: z.string(),
  tokenUsage: z.object({
    prompt: z.number().int().min(0),
    completion: z.number().int().min(0),
    total: z.number().int().min(0),
  }),
  cost: z.number().min(0),
  latency: z.number().min(0),
  traceId: z.string().uuid(),
});
```

## Database Schema

**Note**: Current application is stateless (no database). If persistence is added in the future:

```sql
-- User sessions (optional)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  travel_data JSONB NOT NULL,
  result JSONB,
  total_cost DECIMAL(10,4),
  status VARCHAR(20)
);

-- Agent execution logs
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  agent_id INTEGER NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB,
  token_usage JSONB,
  cost DECIMAL(10,6),
  latency_ms INTEGER,
  trace_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider usage tracking
CREATE TABLE provider_usage (
  id UUID PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  requests INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  errors INTEGER DEFAULT 0,
  UNIQUE(provider, date)
);
```

## Migration Notes

**From Current Implementation**:

1. Existing `TravelFormData` interface is largely compatible
2. `AgentLog` needs enhancement for constitutional compliance
3. New provider abstraction layer required
4. Validation schemas must be added
5. Error handling needs complete restructuring

**Breaking Changes**:

- API endpoints will change from direct Groq calls to edge functions
- Frontend will receive streaming responses instead of single response
- Agent logging format will include additional constitutional fields
- Error handling will be more granular and structured

**Backward Compatibility**:

- Existing form data structures can be validated and enhanced
- UI components can be adapted with minimal changes
- Core travel planning logic remains similar
