# GitHub Copilot Instructions - Hylo Travel AI

## Project Overview

Hylo is a travel itinerary generation application using multi-agent AI systems for personalized travel planning. The application follows strict constitutional principles for edge-first architecture, multi-LLM resilience, and observable operations.

## Constitutional Requirements (CRITICAL)

All development must comply with these non-negotiable principles:

### 1. Edge-First Architecture

- All LLM interactions MUST route through Vercel Edge Functions
- No API keys or sensitive operations in client-side code
- Frontend communicates only with `/api` endpoints, never directly with AI providers

### 2. Multi-LLM Resilience

- Implement intelligent routing across Cerebras (complex), Google Gemini (balanced), Groq (fast)
- Every LLM call requires at least two fallback options
- Provider selection based on complexity, availability, and quota

### 3. Observable AI Operations

- All LLM interactions traced through LangSmith
- Structured logging: model, tokens, latency, complexity, fallback chain
- Cost tracking per operation is mandatory

### 4. Type-Safe Development

- Strict TypeScript throughout entire codebase
- All API responses have defined interfaces with Zod validation
- No `any` types except documented exceptions

### 5. Progressive Enhancement

- Core functionality works with degraded AI services
- Graceful error handling with user-friendly messages
- Streaming responses for better UX

### 6. Cost-Conscious Design

- Free tier limits respected through caching and intelligent routing
- Usage tracking per provider with automatic throttling
- Request optimization for token efficiency

### 7. Security by Default

- Environment variables properly scoped in Vercel
- Rate limiting on all API routes
- Input sanitization for all user content
- Explicit CORS configuration

## Current Architecture

### Technology Stack

- **Frontend**: React 18.3+ with TypeScript, Vite build system
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: LangChain.js multi-LLM routing infrastructure
- **LLM Providers**: Cerebras (complex), Google Gemini (balanced), Groq (fast)
- **Observability**: LangSmith tracing and monitoring
- **Deployment**: Vercel Edge Functions
- **Testing**: Vitest, Playwright, Contract Testing

### Project Structure

```
src/
├── components/          # React UI components
├── services/           # API integration services
├── types/              # TypeScript definitions
├── App.tsx             # Main application
└── main.tsx            # Entry point

api/                    # Vercel Edge Functions
├── llm/                # LLM routing endpoints
│   ├── route.ts        # Main query routing
│   ├── providers.ts    # Provider status
│   └── health.ts       # Health monitoring
├── providers/          # LLM provider abstractions
│   ├── cerebras.ts     # Cerebras integration
│   ├── gemini.ts       # Google Gemini integration
│   └── groq.ts         # Groq integration
└── utils/              # Shared utilities
    ├── routing.ts      # Routing decision engine
    ├── fallback.ts     # Fallback chain handling
    └── observability.ts # LangSmith tracing
```

### Data Models

#### TravelFormData Interface

```typescript
interface TravelFormData {
  tripDetails: TripDetails;
  groups: string[];
  interests: string[];
  inclusions: string[];
  experience: string[];
  vibes: string[];
  sampleDays: string[];
  dinnerChoices: string[];
  nickname: string;
  contact: ContactInfo;
}
```

#### Multi-Agent System

- **Agent 1**: Data Gatherer - Processes user selections
- **Agent 2**: Travel Analyzer - Analyzes preferences and constraints
- **Agent 3**: Itinerary Planner - Generates comprehensive travel plan

## Development Patterns

### Edge Function Pattern

```typescript
// api/itinerary.ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  // All AI orchestration here
  // Return streaming response with Server-Sent Events
}
```

### Provider Abstraction Pattern

```typescript
interface LLMProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  hasCapacity(): Promise<boolean>;
  generate(request: LLMRequest): Promise<LLMResponse>;
}
```

### Error Handling Pattern

```typescript
async function withFallback<T>(
  operation: () => Promise<T>,
  fallbacks: (() => Promise<T>)[]
): Promise<T> {
  // Implement progressive fallback chain
}
```

## Code Guidelines

### TypeScript Best Practices

- Use strict mode configuration
- Define interfaces for all data structures
- Implement Zod schemas for validation
- Avoid `any` types - use generics or union types

### React Component Patterns

- Functional components with hooks
- Props interfaces with TypeScript
- Error boundaries for AI operations
- Loading states for async operations

### API Integration

- Edge functions for all external API calls
- Streaming responses for real-time updates
- Structured error responses with proper HTTP codes
- Rate limiting and quota management

### Testing Approach

- Contract tests for API endpoints
- Integration tests for multi-agent flows
- Unit tests for utility functions
- E2E tests for critical user journeys

## Current Implementation Status

### ✅ Implemented

- React frontend with comprehensive travel form
- Multi-agent AI system with LangChain.js routing
- Complete LLM routing infrastructure (Cerebras, Gemini, Groq)
- Real-time agent logging and streaming
- TypeScript throughout application
- Tailwind CSS design system
- Multi-provider routing with fallback chains
- LangSmith observability integration

### 🚧 In Progress

- Production hardening and error boundaries (004-production-hardening)
- Comprehensive testing infrastructure
- Advanced monitoring and health dashboards
- Frontend UI/UX polish and responsiveness
- Security hardening and validation

### ❌ Needs Implementation

- Comprehensive error boundaries
- Security hardening (API key protection)
- Performance optimization
- Production monitoring

## Migration Priorities

1. **Phase 1**: Create edge function structure in `/api` directory
2. **Phase 2**: Implement multi-provider abstractions
3. **Phase 3**: Add LangSmith tracing and observability
4. **Phase 4**: Implement comprehensive error handling
5. **Phase 5**: Add testing infrastructure
6. **Phase 6**: Security and performance optimization

## AI Assistance Guidelines

When helping with this project:

1. **Always consider constitutional compliance** - suggest edge-first solutions
2. **Prioritize type safety** - provide TypeScript interfaces and Zod schemas
3. **Design for resilience** - implement fallback strategies
4. **Add observability** - include logging and tracing
5. **Consider cost implications** - optimize for efficiency
6. **Ensure security** - validate inputs, protect secrets

### Spec Kit Workflow Integration

When working with the Spec Kit workflow, use these patterns:

**During Planning Phase:**

- Use `@workspace current architecture patterns in src/ and api/` to understand existing structure
- Use `@workspace similar feature implementations` to find reusable patterns
- Use `@workspace constitutional compliance patterns` to ensure adherence
- Use `@workspace TypeScript interface definitions in src/types` for type consistency

**During Implementation Phase:**

- Use `@workspace error boundary implementations` for progressive enhancement
- Use `@workspace LLM provider configurations` for multi-LLM resilience
- Use `@workspace rate limiting patterns` for cost-conscious design
- Use `@workspace API route structure in /api` for edge-first architecture

**For Context7 MCP Research:**
When research.md needs enhancement, Context7 can provide focused documentation:

- Resolve library IDs: `mcp call resolve-library-id --libraryName="[library]"`
- Get focused docs: `mcp call get-library-docs --context7CompatibleLibraryID="/[library]/docs" --topic="[topic]" --tokens=2000`
- Append to research: `>> $RESEARCH`

### Example Patterns to Follow

**Edge Function with Streaming:**

```typescript
export default async function handler(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // Stream agent updates and final results
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

**Provider Routing:**

```typescript
function selectProvider(complexity: 'low' | 'medium' | 'high'): string {
  // Route based on complexity and availability
  // Cerebras for complex, Groq for fast, Gemini for balanced
}
```

**Error Boundaries:**

```typescript
class AIErrorBoundary extends React.Component {
  // Handle AI operation failures gracefully
  // Provide meaningful fallback UI
}
```

## Recent Changes

- **2025-09-17**: Feature 007-fix-vercel-deployment: TypeScript compilation error fixes, Vercel Hobby plan function limit compliance
- **2025-01-17**: Feature 005-dns-deployment-fixes: DNS verification, TypeScript strict mode compliance, deployment monitoring
- **2025-09-17**: Feature 004-production-hardening planning and design completed
- **2025-09-17**: Production hardening architecture with error boundaries and monitoring designed

---

_This file is automatically updated by the development workflow. Manual additions should be made between the MANUAL_ADDITIONS markers._

<!-- MANUAL_ADDITIONS_START -->
<!-- Add any project-specific notes or exceptions here -->
<!-- MANUAL_ADDITIONS_END -->
