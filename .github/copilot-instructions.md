# GitHub Copilot Instructions for Hylo Travel AI

## Project Overview

Hylo Travel AI is a sophisticated multi-agent travel planning system built with React/TypeScript frontend and Vercel Edge Functions backend. The system uses intelligent LLM routing across multiple providers (Cerebras, Gemini, Groq) with comprehensive observability via LangSmith integration.

## Constitutional Principles (CRITICAL)

All code changes must adhere to these constitutional requirements:

### 1. Edge-First Architecture

- All API functions must run on Vercel Edge Runtime
- No Node.js APIs in edge functions - use Web APIs only
- Client-side API keys are forbidden - all LLM calls via backend
- Target sub-50ms cold starts globally

### 2. Multi-LLM Resilience

- Maintain 3 providers minimum: Cerebras, Gemini, Groq
- Implement automatic failover with circuit breaker patterns
- Graceful degradation must maintain user experience
- Provider selection based on complexity analysis

### 3. Observable AI Operations (NON-NEGOTIABLE)

- LangSmith integration mandatory for all LLM operations
- Log complexity analysis, provider selection reasoning, cost tracking
- Real-time monitoring via BehindTheScenes component required
- Performance metrics (P50/P95/P99) across all providers

### 4. Type-Safe Development

- Strict TypeScript with Zod runtime validation for all APIs
- Constitutional compliance verified at compile-time and runtime
- Input sanitization and validation at every boundary
- Edge-compatible type definitions throughout

### 5. Cost-Conscious Design

- Provider selection optimized by query complexity scoring
- Token usage and cost tracking per request mandatory
- Budget alerts and utilization monitoring required
- Free tier optimization prioritized

## Architecture Patterns

### Multi-Agent System

```typescript
// Four specialized agents with distinct responsibilities:
// Agent 1: Data Gatherer - Form validation and data extraction
// Agent 2: Information Gatherer - Real-time web search integration
// Agent 3: Planning Strategist - Data-driven itinerary framework
// Agent 4: Content Compiler - Final personalized output assembly

interface AgentLog {
  agentId: 1 | 2 | 3 | 4;
  status: 'pending' | 'running' | 'complete' | 'error';
  modelUsed?: 'groq' | 'gemini' | 'cerebras';
  reasoning?: string; // Agent's decision reasoning
  tokenCount?: number; // Tokens consumed
  cost?: number; // USD cost of operation
}
```

### LLM Provider Routing

```typescript
// Complexity-based provider selection
interface ComplexityScore {
  overall: number; // 0-1 scale
  factors: {
    queryLength: number; // Character/word count analysis
    technicalTerms: number; // Travel domain keyword detection
    multiStepReasoning: number; // Sequential planning requirements
    contextDepth: number; // Session continuity analysis
    outputFormat: number; // Structured output complexity
  };
  recommendedProvider: 'groq' | 'gemini' | 'cerebras';
  reasoning: string; // Human-readable explanation
}

// Routing Rules:
// - Complexity < 0.3: Groq (speed priority)
// - Complexity 0.3-0.7: Gemini (balanced)
// - Complexity > 0.7: Cerebras (reasoning priority)
```

### Resilience Patterns

```typescript
// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5, // Failures to open circuit
  resetTimeout: 30000, // 30 seconds
  monitoringPeriod: 60000, // 60 seconds
};

// Fallback chain: Primary â†’ Secondary â†’ Cached â†’ Error
class FallbackHandler {
  async executeWithFallback(request: LLMRequest): Promise<LLMResponse> {
    // Try primary provider â†’ secondary â†’ tertiary â†’ cached â†’ error
  }
}
```

## Code Style Guidelines

### File Organization

```
src/
â”œâ”€â”€ components/          # React components with TypeScript
â”œâ”€â”€ services/           # Business logic and API calls
â”œâ”€â”€ hooks/              # Custom React hooks
â”œâ”€â”€ types/              # Shared TypeScript interfaces
â””â”€â”€ utils/              # Utility functions

api/                    # Vercel Edge Functions
â”œâ”€â”€ llm/               # Main LLM routing endpoint
â”œâ”€â”€ health/            # System health monitoring
â”œâ”€â”€ providers/         # LLM provider implementations
â””â”€â”€ utils/             # Routing, observability, fallback
```

### Naming Conventions

- **Components**: PascalCase (`TravelFormData`, `BehindTheScenes`)
- **Services**: camelCase with Service suffix (`multiAgentService`, `llmRoutingService`)
- **Interfaces**: PascalCase with descriptive names (`LLMRequest`, `AgentLog`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT`)

### Error Handling

```typescript
// Always use Result pattern for error handling
type Result<T, E> = { success: true; data: T } | { success: false; error: E };

// Graceful degradation required
async function processWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    console.warn('Primary failed, using fallback:', error);
    return await fallback();
  }
}
```

## Common Patterns

### Zod Validation

```typescript
import { z } from 'zod';

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
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate));
```

### Observability Integration

```typescript
import { LangSmithClient } from './utils/observability';

// Always trace LLM operations
async function processLLMRequest(request: LLMRequest) {
  const trace = LangSmithClient.createTrace({
    name: `agent-${request.agentId}-processing`,
    metadata: { complexity: request.complexity },
  });

  try {
    const result = await provider.process(request);
    trace.end({ success: true, tokens: result.tokenUsage.totalTokens });
    return result;
  } catch (error) {
    trace.end({ success: false, error: error.message });
    throw error;
  }
}
```

### Provider Management

```typescript
// Always use ProviderFactory for provider access
import { ProviderFactory } from '../providers/factory';

const provider = await ProviderFactory.getOptimalProvider(complexityScore);
const healthyProvider = await ProviderFactory.getHealthyProvider();
```

## Testing Requirements

### Contract Tests (MANDATORY)

```typescript
// Every API endpoint requires contract tests
describe('POST /api/llm/route', () => {
  it('should validate request schema', async () => {
    const invalidRequest = {
      /* missing required fields */
    };
    const response = await request(app).post('/api/llm/route').send(invalidRequest);
    expect(response.status).toBe(400);
  });

  it('should return proper response schema', async () => {
    const validRequest = {
      /* complete valid request */
    };
    const response = await request(app).post('/api/llm/route').send(validRequest);
    expect(response.body).toMatchSchema(LLMResponseSchema);
  });
});
```

### Integration Tests

```typescript
// Multi-agent workflow testing required
describe('Multi-Agent Workflow', () => {
  it('should complete 4-agent processing pipeline', async () => {
    // Test complete agent chain: 1 â†’ 2 â†’ 3 â†’ 4
  });
});
```

## Common Anti-Patterns to Avoid

âŒ **Don't**: Use Node.js APIs in edge functions

```typescript
// BAD - Node.js API
import fs from 'fs';
const data = fs.readFileSync('./config.json');
```

âœ… **Do**: Use Web APIs or static imports

```typescript
// GOOD - Static import or fetch
import config from './config.json';
const data = await fetch('/api/config').then((r) => r.json());
```

âŒ **Don't**: Put API keys in client-side code

```typescript
// BAD - Client-side API key
const groqClient = new GroqClient(process.env.GROQ_API_KEY);
```

âœ… **Do**: Route through backend

```typescript
// GOOD - Backend API call
const response = await fetch('/api/llm/route', { method: 'POST', body: JSON.stringify(request) });
```

âŒ **Don't**: Skip complexity analysis for provider selection

```typescript
// BAD - Hardcoded provider
const provider = new GroqProvider();
```

âœ… **Do**: Use complexity-based routing

```typescript
// GOOD - Intelligent routing
const complexity = analyzeComplexity(request.prompt);
const provider = await ProviderFactory.getOptimalProvider(complexity);
```

## Recent Changes and Context

### Current Architecture Status

- Multi-agent system with 4 specialized agents operational
- Complexity-based provider routing implemented
- LangSmith observability integration complete
- Circuit breaker patterns for resilience implemented
- Real-time monitoring via BehindTheScenes component

### Priority Areas for Enhancement

1. **Testing Infrastructure**: Comprehensive contract and integration tests
2. **Performance Optimization**: Bundle analysis and edge function optimization
3. **Documentation**: API documentation and deployment guides
4. **Security Hardening**: Enhanced input validation and rate limiting
5. **Monitoring Enhancement**: Additional observability metrics

### Known Technical Debt

- Test coverage needs improvement (target: 90%+ for core services)
- API documentation should be auto-generated from OpenAPI schemas
- Rate limiting implementation needs refinement
- Cost optimization algorithms could be more sophisticated

## Context for AI Assistance

When helping with Hylo Travel AI:

1. **Always verify constitutional compliance** before suggesting changes
2. **Prioritize edge-compatible solutions** for API functions
3. **Include observability** in all LLM-related code changes
4. **Consider multi-provider scenarios** and fallback handling
5. **Validate with Zod schemas** for all external inputs
6. **Test-first approach** - write tests before implementation
7. **Cost implications** - consider token usage and provider pricing
8. **Real-time user experience** - maintain responsive agent monitoring

This is a production-quality AI system requiring enterprise-grade reliability, observability, and performance. Every change should maintain the sophisticated architecture while following constitutional principles.

---

**Last Updated**: September 17, 2025  
**Constitutional Version**: 1.0.0  
**Architecture Status**: Stable, Production-Ready

