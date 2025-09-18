# HYLO Travel AI Platform Constitution

## Core Principles

### I. Edge-First Architecture

All API endpoints run on Vercel Edge Runtime for global distribution; No client-side API keys - all secrets managed server-side; Edge functions handle LLM routing, health monitoring, and RAG operations; Progressive enhancement with graceful degradation

### II. Multi-Agent AI Orchestration

Multi-agent pipeline for itinerary generation (Data Gatherer → Information Gatherer → Planning Strategist → Content Compiler); Intelligent LLM provider routing based on complexity analysis; Fallback chains ensure resilience (Cerebras → Gemini → Groq); Real-time web search integration for current information

### III. Test-First Development (NON-NEGOTIABLE)

TDD mandatory: Tests written → Review → Tests fail → Then implement; Minimum 80% code coverage requirement; Contract tests for all API endpoints; Integration tests for multi-agent workflows; Component tests with React Testing Library

### IV. Observable AI Operations

Comprehensive tracing via LangSmith integration; Cost tracking per LLM operation with budget alerts; Performance metrics (latency, tokens, throughput); Structured logging at all service boundaries; Health monitoring dashboard for system visibility

### V. Type-Safe Development

TypeScript strict mode throughout frontend and backend; Zod schemas for runtime validation matching compile-time types; Shared type definitions between client and server; API contracts validated at build time

### VI. Component-Based Architecture

React 18+ with functional components and hooks; Form optimization with React Hook Form + Zod validation; Tailwind CSS for utility-first styling; Reusable UI components with clear separation of concerns

### VII. Cost-Conscious Design

Daily budget limits enforced ($10/day default); Token usage optimization in LLM operations; Provider selection based on cost/performance trade-offs; Caching strategies to reduce redundant API calls

## Technical Standards

### Frontend Stack

- **Framework**: React 18+ with TypeScript 5.x
- **Build Tool**: Vite for fast HMR and optimized builds
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form with Zod validation
- **State**: Local state with useState/useReducer
- **Icons**: Lucide React for consistent iconography
- **Testing**: Vitest + React Testing Library

### Backend Stack

- **Runtime**: Vercel Edge Functions (Edge Runtime)
- **LLM Providers**: Cerebras, Google Gemini, Groq
- **Observability**: LangSmith for tracing
- **Validation**: Zod schemas for all endpoints
- **Search**: Web search service integration
- **RAG**: Vector storage with Qdrant (future)

### API Design

- RESTful endpoints under `/api` namespace
- Streaming responses for real-time generation
- Health endpoints for monitoring
- Rate limiting and quota management
- CORS configuration for edge functions

### Development Workflow

#### Code Quality Gates

1. TypeScript compilation must succeed
2. ESLint passes with no errors
3. All tests pass (unit, integration, E2E)
4. Zod schema validation coverage
5. Bundle size within limits (<200KB warning)

## Infrastructure Requirements

### Deployment Platform

- **Hosting**: Vercel with automatic deployments
- **Edge Functions**: Global distribution
- **Environment**: Development, Preview, Production
- **DNS**: Verification and readiness checks
- **Monitoring**: Real-time health dashboards

### Performance Standards

- API response time: <2s p95 for simple queries
- Streaming latency: <500ms to first token
- Frontend FCP: <1.5s on 3G networks
- Bundle size: <200KB for initial load
- Error rate: <1% for production

### Security & Compliance

- Environment variables for all secrets
- Input sanitization on all endpoints
- Rate limiting per IP/session
- CORS properly configured
- No PII in logs or traces

## Project-Specific Conventions

### File Organization

```
api/              # Edge functions
src/
  ├── components/ # React components
  ├── services/   # Business logic
  ├── api/        # API client code
  ├── types/      # TypeScript types
  ├── hooks/      # Custom React hooks
  └── utils/      # Utilities
tests/            # Test files
.specify/         # Project management
```

### Naming Conventions

- Components: PascalCase (e.g., TripDetailsForm)
- Services: camelCase with 'Service' suffix
- Types: PascalCase with descriptive names
- API routes: kebab-case endpoints
- Test files: _.test.ts or _.spec.ts

### AI Agent Conventions

- Each agent has single responsibility
- Agents communicate via structured data
- Token limits enforced per agent
- Costs tracked per agent operation
- Fallback strategies documented

## Governance

Constitution supersedes all development practices; Amendments require team consensus and testing; All PRs must verify constitutional compliance via checks; Complexity violations must be justified in PR description; Use CLAUDE.md for AI-assisted development guidance

**Version**: 2.0.0 | **Ratified**: 2025-01-20 | **Last Amended**: 2025-01-20
