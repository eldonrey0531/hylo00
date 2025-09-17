# Data Model: Hylo Travel AI System

**Date**: September 17, 2025  
**Context**: Data models and entity definitions for Hylo Travel AI

## Core Entities

### Travel Form Data

```typescript
interface TravelFormData {
  // Trip Details
  destination: string;
  startDate: string;        // ISO 8601 format
  endDate: string;          // ISO 8601 format
  groupSize: number;
  tripNickname?: string;

  // Travel Preferences
  travelVibe: 'relaxed' | 'adventure' | 'cultural' | 'luxury' | 'budget';
  interests: string[];      // Array of interest categories
  accommodationType: 'hotel' | 'airbnb' | 'hostel' | 'resort' | 'mixed';
  transportPreference: 'flight' | 'drive' | 'train' | 'mixed';

  // Dining Preferences
  dietaryRestrictions: string[];
  dinnerChoice: 'local' | 'upscale' | 'casual' | 'mixed';

  // Budget and Constraints
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  accessibilityNeeds?: string[];

  // Contact Information
  contactEmail?: string;
  contactPhone?: string;
}

// Validation Rules
- destination: Required, min length 2
- startDate: Required, must be future date
- endDate: Required, must be after startDate
- groupSize: Required, min 1, max 20
- interests: Required, min 1 selection
```

### Multi-Agent System Models

```typescript
interface AgentLog {
  agentId: 1 | 2 | 3 | 4;
  agentName: 'Data Gatherer' | 'Information Gatherer' | 'Planning Strategist' | 'Content Compiler';
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime: string; // ISO 8601 timestamp
  endTime?: string; // ISO 8601 timestamp
  duration?: number; // Milliseconds
  message: string; // Current status message
  reasoning?: string; // Agent's decision reasoning
  modelUsed?: string; // LLM model used (groq, gemini, cerebras)
  tokenCount?: number; // Tokens consumed
  cost?: number; // USD cost of operation
}

interface MultiAgentSession {
  sessionId: string; // UUID v4
  userId?: string; // Optional user identifier
  formData: TravelFormData;
  agents: AgentLog[];
  overallStatus: 'initializing' | 'processing' | 'complete' | 'error';
  finalItinerary?: string; // Generated itinerary output
  totalCost: number; // Total cost in USD
  totalTokens: number; // Total tokens consumed
  createdAt: string; // ISO 8601 timestamp
  completedAt?: string; // ISO 8601 timestamp
}
```

### LLM Provider Models

```typescript
interface LLMRequest {
  sessionId: string;
  agentId: number;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  complexity: ComplexityScore;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    requestId: string; // UUID v4
    timestamp: string; // ISO 8601
  };
}

interface ComplexityScore {
  overall: number; // 0-1 scale
  factors: {
    queryLength: number; // 0-1 based on character count
    technicalTerms: number; // 0-1 based on travel domain keywords
    multiStepReasoning: number; // 0-1 based on sequential requirements
    contextDepth: number; // 0-1 based on session history
    outputFormat: number; // 0-1 based on structured output needs
  };
  recommendedProvider: 'groq' | 'gemini' | 'cerebras';
  reasoning: string; // Human-readable explanation
}

interface LLMResponse {
  requestId: string;
  providerId: 'groq' | 'gemini' | 'cerebras';
  modelName: string;
  content: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number; // USD cost
  latency: number; // Milliseconds
  timestamp: string; // ISO 8601
  error?: string; // Error message if failed
}

interface LLMStreamChunk {
  requestId: string;
  chunkId: number; // Sequential chunk identifier
  content: string; // Partial content
  isComplete: boolean; // True for final chunk
  timestamp: string; // ISO 8601
}
```

### Provider Configuration Models

```typescript
interface ProviderConfig {
  id: 'groq' | 'gemini' | 'cerebras';
  name: string;
  endpoint: string;
  apiKey: string; // Environment variable name
  models: {
    default: string;
    reasoning: string;
    fast: string;
  };
  limits: {
    maxTokens: number;
    timeoutMs: number;
    rateLimit: number; // Requests per minute
  };
  pricing: {
    inputCostPer1MTokens: number; // USD
    outputCostPer1MTokens: number; // USD
  };
  capabilities: {
    streaming: boolean;
    multimodal: boolean;
    reasoning: boolean;
    speed: 'fast' | 'medium' | 'slow';
  };
}

interface ProviderHealth {
  providerId: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  lastCheck: string; // ISO 8601 timestamp
  responseTime: number; // Milliseconds
  errorRate: number; // 0-1 scale
  consecutiveFailures: number;
  circuitBreakerOpen: boolean;
}
```

### Observability Models

```typescript
interface ObservabilityTrace {
  traceId: string; // UUID v4
  spanId: string; // UUID v4
  parentSpanId?: string; // UUID v4
  operationName: string;
  startTime: string; // ISO 8601 timestamp
  endTime?: string; // ISO 8601 timestamp
  duration?: number; // Milliseconds
  tags: Record<string, string | number | boolean>;
  logs: TraceLog[];
  status: 'success' | 'error' | 'timeout';
}

interface TraceLog {
  timestamp: string; // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, any>;
}

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number; // Milliseconds
  timestamp: string; // ISO 8601
  provider?: string;
  agentId?: number;
  cost?: number; // USD
  tokens?: number;
}
```

### Health Monitoring Models

```typescript
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  timestamp: string; // ISO 8601
  version: string;
  uptime: number; // Seconds
  components: ComponentHealth[];
  metrics: {
    requestsPerMinute: number;
    averageLatency: number; // Milliseconds
    errorRate: number; // 0-1 scale
    costPerRequest: number; // USD
  };
}

interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  lastCheck: string; // ISO 8601
  message?: string;
  details?: Record<string, any>;
}
```

## State Transitions

### Multi-Agent Session Flow

```
initializing → processing → complete
     ↓              ↓           ↓
   error  ←  ← ← ← error      [final]

Agent Status Flow:
pending → running → complete
   ↓         ↓         ↓
 error ← ← error   [final]
```

### Circuit Breaker States

```
CLOSED → OPEN → HALF_OPEN → CLOSED
  ↓       ↓        ↓          ↓
error  timeout  success   continue

Thresholds:
- CLOSED → OPEN: 5 failures in 60 seconds
- OPEN → HALF_OPEN: 30 seconds timeout
- HALF_OPEN → CLOSED: 1 successful request
- HALF_OPEN → OPEN: 1 failed request
```

### Provider Selection Logic

```
Request → Complexity Analysis → Provider Ranking → Fallback Chain

Complexity Factors:
- Query Length: < 100 chars = 0.1, > 1000 chars = 1.0
- Technical Terms: travel keywords = +0.3, complex planning = +0.5
- Multi-Step: sequential requirements = +0.4
- Context Depth: session history length = +0.2
- Output Format: structured output = +0.3

Provider Selection:
- Complexity < 0.3: Groq (speed priority)
- Complexity 0.3-0.7: Gemini (balanced)
- Complexity > 0.7: Cerebras (reasoning priority)

Fallback Order:
1. Primary provider (complexity-based)
2. Secondary provider (next best)
3. Tertiary provider (last resort)
4. Cached response (if available)
5. Error response with graceful degradation
```

## Data Relationships

### Entity Relationship Diagram

```
TravelFormData (1) ←→ (1) MultiAgentSession
                              ↓ (1:4)
                           AgentLog ←→ LLMRequest (1:n)
                              ↓
                           LLMResponse (1:n)
                              ↓
                        ObservabilityTrace (1:n)

ProviderConfig (3) ←→ (n) LLMRequest
                   ←→ (n) ProviderHealth

SystemHealth (1) ←→ (n) ComponentHealth
                 ←→ (n) PerformanceMetrics
```

### Data Flow Patterns

1. **User Input Flow**: TravelFormData → MultiAgentSession → AgentLog[] → LLMRequest[]
2. **Processing Flow**: LLMRequest → ComplexityScore → ProviderConfig → LLMResponse
3. **Monitoring Flow**: LLMRequest → ObservabilityTrace → PerformanceMetrics → SystemHealth
4. **Error Flow**: Failed LLMRequest → Circuit Breaker → Fallback Provider → Graceful Degradation

## Validation Schemas

All models include Zod runtime validation schemas with:

- Required field validation
- Type checking (string, number, boolean, enum)
- Format validation (ISO 8601 dates, UUIDs, email addresses)
- Range validation (min/max values, array lengths)
- Custom validation (future dates, provider availability)

Example Zod Schema:

```typescript
const TravelFormDataSchema = z
  .object({
    destination: z.string().min(2).max(100),
    startDate: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date()),
    endDate: z.string().datetime(),
    groupSize: z.number().int().min(1).max(20),
    travelVibe: z.enum(['relaxed', 'adventure', 'cultural', 'luxury', 'budget']),
    interests: z.array(z.string()).min(1),
    // ... additional fields
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
  });
```

---

**Status**: Complete  
**Next Phase**: Contract generation  
**Dependencies**: None  
**Constitutional Compliance**: Type-safe development principle satisfied
