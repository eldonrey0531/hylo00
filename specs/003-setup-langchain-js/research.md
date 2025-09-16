# Research: LangChain.js Multi-LLM Routing Infrastructure

**Feature**: 003-setup-langchain-js  
**Date**: September 17, 2025  
**Status**: Complete

## Research Questions Resolved

### Query Complexity Classification

**Decision**: Use token count + structural analysis for complexity scoring
**Rationale**:

- Simple queries (< 100 tokens, single destination): Groq for speed
- Medium queries (100-500 tokens, multiple preferences): Gemini for balance
- Complex queries (> 500 tokens, multi-destination, detailed requirements): Cerebras for capability
- Structural factors: Multiple destinations (+1), specific dates (+1), budget constraints (+1), accessibility needs (+2)

**Alternatives considered**:

- ML-based classification (too complex for MVP)
- Manual user selection (poor UX)
- Round-robin (ignores provider strengths)

### API Key Rotation Strategy

**Decision**: Quota-based rotation with health monitoring
**Rationale**:

- Monitor usage against provider quotas (80% threshold)
- Rotate keys when approaching limits or rate-limited
- Health checks every 30 seconds for provider availability
- Graceful degradation to alternative providers

**Alternatives considered**:

- Time-based rotation (ignores actual usage)
- Reactive rotation only (may hit limits)
- Single key per provider (limited throughput)

### LangChain.js Integration Patterns

**Decision**: Custom provider abstractions with LangChain.js compatibility
**Rationale**:

- LangChain.js provides standardized interfaces for LLMs
- Custom routing layer sits above LangChain providers
- Enables consistent error handling and observability
- Future-proof for adding new providers

**Alternatives considered**:

- Direct provider SDKs (inconsistent interfaces)
- Pure HTTP clients (lose LangChain.js benefits)
- LangChain router only (limited customization)

### Fallback Chain Design

**Decision**: Provider capability-based fallback with circuit breaker pattern
**Rationale**:

- Primary: Best provider for query complexity
- Secondary: Next best available provider
- Tertiary: Most reliable fallback (typically Groq for speed)
- Circuit breaker prevents cascade failures

**Alternatives considered**:

- Random fallback (unpredictable quality)
- Fixed order fallback (ignores provider strengths)
- No fallback (poor reliability)

### Observability Implementation

**Decision**: LangSmith integration with structured logging
**Rationale**:

- LangSmith provides LLM-specific tracing and debugging
- Structured logs for cost tracking and performance analysis
- Real-time monitoring of provider health and quota usage
- Audit trail for routing decisions

**Alternatives considered**:

- Generic APM tools (lack LLM context)
- Custom logging only (maintenance overhead)
- No observability (debugging nightmare)

### Edge Function Architecture

**Decision**: Single routing edge function with provider modules
**Rationale**:

- Centralized routing logic for consistency
- Provider modules for clean separation
- Shared observability and error handling
- Efficient cold start with minimal dependencies

**Alternatives considered**:

- Per-provider edge functions (complexity overhead)
- Monolithic function (harder to maintain)
- Client-side routing (security risk)

## Technology Stack Validation

### LangChain.js Providers

- ✅ **@langchain/google-genai**: Official Google Gemini support
- ✅ **@langchain/groq**: Official Groq integration
- ⚠️ **Cerebras**: No official LangChain.js provider yet - use HTTP client with LangChain interface adapter

### Edge Runtime Compatibility

- ✅ All chosen providers work in Vercel Edge Runtime
- ✅ LangSmith SDK supports edge environments
- ✅ Streaming responses supported

### Rate Limiting & Quotas

- **Cerebras**: 1M tokens/month free, rate limits vary by model
- **Gemini**: 15 RPM free tier, 1M tokens/month
- **Groq**: 14,400 tokens/minute free, rate limits by model

## Implementation Risks & Mitigations

### Risk: Provider API Changes

**Mitigation**: Abstract provider interfaces, comprehensive contract testing

### Risk: Edge Function Cold Starts

**Mitigation**: Keep bundle small, lazy load providers, implement warming

### Risk: Quota Exhaustion

**Mitigation**: Real-time monitoring, automatic provider switching, usage alerts

### Risk: Fallback Chain Failures

**Mitigation**: Circuit breaker pattern, health checks, graceful degradation

## Next Steps

Phase 1 design should focus on:

1. Provider abstraction interfaces
2. Routing decision engine API contracts
3. Observability data model
4. Error handling and fallback specifications
