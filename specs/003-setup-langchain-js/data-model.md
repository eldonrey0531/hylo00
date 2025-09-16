# Data Model: LangChain.js Multi-LLM Routing Infrastructure

**Feature**: 003-setup-langchain-js  
**Date**: September 17, 2025  
**Status**: Complete

## Core Entities

### LLMProvider

Represents an external AI service provider with routing capabilities.

```typescript
interface LLMProvider {
  id: string; // 'cerebras' | 'gemini' | 'groq'
  name: string; // Human-readable provider name
  type: ProviderType; // 'complex' | 'balanced' | 'fast'
  capabilities: ProviderCapabilities;
  quotas: QuotaLimits;
  health: ProviderHealth;
  apiKeys: APIKeyPool;
}

interface ProviderCapabilities {
  maxTokens: number; // Maximum tokens per request
  supportsStreaming: boolean; // Streaming response support
  complexityRating: number; // 1-10 scale for handling complex queries
  averageLatency: number; // Historical average response time (ms)
  costPerToken: number; // Cost in credits/USD per token
}

interface QuotaLimits {
  tokensPerMonth: number; // Monthly token allowance
  requestsPerMinute: number; // Rate limit per minute
  requestsPerDay: number; // Daily request limit
  currentUsage: QuotaUsage; // Current period usage
}

interface QuotaUsage {
  tokensUsed: number; // Tokens consumed this period
  requestsToday: number; // Requests made today
  requestsThisMinute: number; // Requests in current minute window
  lastResetDate: Date; // When quotas were last reset
}
```

### RoutingRule

Defines logic for selecting optimal providers based on request characteristics.

```typescript
interface RoutingRule {
  id: string;
  priority: number; // Higher priority rules evaluated first
  conditions: RoutingCondition[];
  targetProvider: string; // Provider ID to route to
  fallbackChain: string[]; // Ordered fallback provider IDs
  isActive: boolean;
}

interface RoutingCondition {
  field: 'complexity' | 'tokenCount' | 'providerHealth' | 'quotaAvailable';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in';
  value: number | string | string[];
}

// Example routing rules:
// 1. If complexity > 7 && cerebras.healthy → cerebras → [gemini, groq]
// 2. If tokenCount < 100 && groq.healthy → groq → [gemini, cerebras]
// 3. If quotaAvailable < 20% → fallback chain only
```

### APIKeyPool

Manages multiple API keys per provider for rotation and quota distribution.

```typescript
interface APIKeyPool {
  providerId: string;
  keys: APIKey[];
  rotationStrategy: RotationStrategy;
  currentActiveKey: string; // Currently active key ID
}

interface APIKey {
  id: string; // Unique identifier
  key: string; // Actual API key (encrypted at rest)
  isActive: boolean; // Whether key is currently usable
  quotaUsage: QuotaUsage; // Usage tracking for this key
  lastUsed: Date; // Last request timestamp
  rateLimitedUntil?: Date; // When rate limiting expires
  errorCount: number; // Recent error count for health
}

interface RotationStrategy {
  type: 'quota-based' | 'time-based' | 'error-based';
  threshold: number; // Rotation trigger threshold
  cooldownPeriod: number; // Minimum time between rotations (ms)
}
```

### RequestContext

Contains request metadata and routing decisions for observability.

```typescript
interface RequestContext {
  requestId: string; // Unique request identifier
  timestamp: Date; // Request start time
  query: TravelQuery; // Original travel query
  complexity: ComplexityScore; // Calculated complexity metrics
  routing: RoutingDecision; // Provider selection decision
  execution: ExecutionTrace; // Request execution details
  response?: LLMResponse; // Final response (if successful)
  error?: RoutingError; // Error details (if failed)
}

interface TravelQuery {
  content: string; // Raw query text
  tokenCount: number; // Estimated token count
  destinations: string[]; // Extracted destinations
  dateRange?: DateRange; // Travel dates
  travelers: number; // Number of travelers
  budget?: BudgetRange; // Budget constraints
  preferences: string[]; // User preferences
}

interface ComplexityScore {
  overall: number; // 1-10 overall complexity
  factors: {
    tokenCount: number; // Tokens contribution to complexity
    destinations: number; // Multiple destinations complexity
    temporal: number; // Date/time complexity
    constraints: number; // Budget/accessibility constraints
    preferences: number; // Preference complexity
  };
  reasoning: string; // Human-readable complexity explanation
}
```

### RoutingDecision

Tracks provider selection logic and fallback chain execution.

```typescript
interface RoutingDecision {
  primaryProvider: string; // Initially selected provider
  appliedRules: string[]; // Rule IDs that matched
  fallbackChain: string[]; // Planned fallback sequence
  actualExecution: ProviderAttempt[]; // What actually happened
  finalProvider?: string; // Provider that succeeded
  totalLatency: number; // End-to-end request time
}

interface ProviderAttempt {
  providerId: string; // Provider that was tried
  keyId: string; // API key used
  startTime: Date; // Attempt start time
  endTime?: Date; // Attempt completion time
  success: boolean; // Whether attempt succeeded
  error?: AttemptError; // Error details if failed
  tokenUsage?: TokenUsage; // Tokens consumed
  latency?: number; // Response time for this attempt
}

interface AttemptError {
  type: 'quota_exceeded' | 'rate_limited' | 'provider_error' | 'timeout' | 'invalid_response';
  message: string; // Error description
  retryable: boolean; // Whether attempt can be retried
  retryAfter?: number; // Suggested retry delay (ms)
}
```

### ProviderHealth

Tracks provider availability and performance metrics.

```typescript
interface ProviderHealth {
  providerId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance';
  lastChecked: Date;
  metrics: HealthMetrics;
  incidents: HealthIncident[];
}

interface HealthMetrics {
  availability: number; // % uptime in last 24h
  averageLatency: number; // Average response time (ms)
  errorRate: number; // % requests that failed
  successfulRequests: number; // Successful requests in period
  failedRequests: number; // Failed requests in period
  measurementWindow: number; // Metrics collection period (ms)
}

interface HealthIncident {
  startTime: Date;
  endTime?: Date; // null if ongoing
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEndpoints: string[];
}
```

## Entity Relationships

```
LLMProvider (1) → (many) APIKey
LLMProvider (1) → (1) ProviderHealth
LLMProvider (many) ← (many) RoutingRule

RequestContext (1) → (1) TravelQuery
RequestContext (1) → (1) ComplexityScore
RequestContext (1) → (1) RoutingDecision
RequestContext (1) → (0..1) LLMResponse

RoutingDecision (1) → (many) ProviderAttempt
ProviderAttempt (many) → (1) LLMProvider
ProviderAttempt (many) → (1) APIKey
```

## Validation Rules

### LLMProvider Validation

- Provider ID must be unique and follow naming convention
- At least one API key must be active
- Quota limits must be positive numbers
- Health status must be updated within last 5 minutes

### RoutingRule Validation

- Priority must be unique across active rules
- Target provider must exist and be active
- Fallback chain cannot contain target provider
- Conditions must reference valid fields with appropriate operators

### RequestContext Validation

- RequestId must be unique and traceable
- Query content cannot be empty
- Complexity score must be between 1-10
- Token count must match actual content analysis

### APIKey Validation

- Keys must be encrypted when stored
- Quota usage cannot exceed defined limits
- Rate limited keys cannot be marked as active
- Error count triggers automatic key deactivation at threshold

## State Transitions

### Provider Health States

```
healthy → degraded (high latency, some errors)
degraded → unhealthy (high error rate)
unhealthy → maintenance (manual intervention)
maintenance → healthy (recovery verified)
```

### API Key States

```
active → rate_limited (quota/rate limit hit)
active → inactive (excessive errors)
rate_limited → active (cooldown expired)
inactive → active (manual reactivation)
```

### Request States

```
pending → routing (complexity calculated)
routing → executing (provider selected)
executing → completed (response received)
executing → failed (all providers exhausted)
```
