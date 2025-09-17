# Hylo Travel AI Constitution

## Core Principles

### I. Edge-First Architecture

Every API function runs on Vercel Edge Runtime with global distribution; No Node.js dependencies in edge functions; Client-side API keys forbidden - all LLM calls routed through secure backend endpoints; Sub-50ms cold starts globally with optimized bundle splitting

### II. Multi-LLM Resilience

Multiple LLM providers (Cerebras, Gemini, Groq) with automatic failover; Intelligent complexity-based provider routing with fallback chains; Circuit breaker patterns prevent cascading failures; Graceful degradation maintains user experience during outages

### III. Observable AI Operations (NON-NEGOTIABLE)

LangSmith integration for comprehensive request tracing mandatory; All LLM operations logged with complexity analysis, provider selection reasoning, and cost tracking; Real-time monitoring via BehindTheScenes component; Performance metrics (P50/P95/P99) tracked across all providers

### IV. Type-Safe Development

Strict TypeScript with Zod runtime validation for all API inputs/outputs; Constitutional compliance verified at compile-time and runtime; Input sanitization and validation at every boundary; Edge-compatible type definitions throughout

### V. Cost-Conscious Design

Provider selection optimized by query complexity (Groq: speed, Cerebras: reasoning, Gemini: balance); Token usage and cost tracking per request; Quota management with free tier optimization; Budget alerts and utilization monitoring

## Technical Standards

### Provider Configuration

- **Cerebras**: Complex reasoning, high-context operations (≤30s timeout)
- **Gemini**: Balanced workloads, multimodal support (≤20s timeout)
- **Groq**: Fast responses, simple queries (≤10s timeout)
- Minimum 2 providers required for production deployment

### Observability Requirements

- LangSmith tracing enabled for all LLM operations
- Structured logging with request IDs for audit trails
- Health monitoring endpoints (`/api/health/*`) required
- Error categorization and resolution tracking

### Security & Validation

- Zod schemas for all request/response validation
- CORS configuration for cross-origin requests
- Rate limiting via edge middleware
- No sensitive data in client-side code

## Multi-Agent Architecture

### Agent Orchestration

Four specialized agents with distinct responsibilities:

1. **Data Gatherer**: Form validation and data extraction
2. **Information Gatherer**: Real-time web search integration
3. **Planning Strategist**: Data-driven itinerary framework
4. **Content Compiler**: Final personalized output assembly

### Agent Compliance

- Each agent logs decisions, reasoning, and model usage
- Progressive enhancement - system functions with agent failures
- Real-time progress tracking via agent monitoring interface
- Complexity-appropriate model selection per agent

## Governance

Constitutional requirements supersede all other development practices; All code reviews must verify compliance with four core principles; Provider routing decisions must include transparency reasoning; Breaking changes require migration plan and constitutional amendment.

**Version**: 1.0.0 | **Ratified**: 2024-01-15 | **Last Amended**: 2024-01-15
