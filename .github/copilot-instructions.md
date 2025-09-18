# GitHub Copilot Instructions for HYLO Travel AI Platform

## Programming Language
- All code suggestions must be in **TypeScript**.
- Use strict TypeScript with proper type annotations.
- Prefer interfaces over type aliases for object definitions.

## Code Style
- Follow the existing codebase patterns and ESLint configuration.
- Use **camelCase** for variables and functions.
- Use **PascalCase** for React components and TypeScript interfaces.
- Use **kebab-case** for file names and API endpoints.
- Use template literals with `${}` for string interpolation.
- Prefer `const` over `let`, avoid `var`.
- Use arrow functions for inline callbacks.
- Include JSDoc comments for complex functions and components.

## Architecture Patterns
- **Edge-First**: All API endpoints must run on Vercel Edge Runtime.
- **Multi-Agent AI**: Follow the 4-agent pipeline pattern (Data Gatherer → Information Gatherer → Planning Strategist → Content Compiler).
- **Type-Safe Development**: Use Zod schemas for API validation.
- **Observable Operations**: Include LangSmith tracing for LLM calls.
- **Fallback Chains**: Implement provider resilience (Cerebras → Gemini → Groq).

## React Patterns
- Use functional components with hooks.
- Prefer `useState` and `useReducer` for state management.
- Use React Hook Form with Zod for form validation.
- Include proper error boundaries with recovery mechanisms.
- Use Tailwind CSS classes for styling.
- Follow the existing component structure in `src/components/`.

## API Development
- All API routes must be Edge Functions in the `api/` directory.
- Use proper CORS headers for cross-origin requests.
- Implement proper error handling with structured responses.
- Include request ID generation for tracing.
- Use environment variable validation with Zod schemas.

## File Organization

### Project Structure (Edge-First & Multi-Agent Focused)

```
hylo/
├── api/                    # Vercel Edge Functions (MANDATORY Edge Runtime)
│   ├── generate-itinerary/ # Main multi-agent orchestration endpoint
│   ├── web-search/         # Real-time information gathering
│   ├── cerebras/           # Primary LLM provider endpoint
│   ├── gemini/             # Fallback LLM provider
│   └── groq/               # Final fallback LLM provider
│
├── src/
│   ├── components/         # React Components (PascalCase)
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   ├── TripDetails/    # Travel form components
│   │   ├── ItineraryDisplay/ # Results display components
│   │   └── layout/         # Layout and navigation
│   │
│   ├── services/           # Business Logic Layer
│   │   ├── multiAgentService.ts      # 4-agent orchestration
│   │   ├── llmRoutingService.ts      # Provider routing logic
│   │   ├── itineraryService.ts       # Main service facade
│   │   ├── webSearchService.ts       # Real-time data gathering
│   │   └── observabilityService.ts   # LangSmith tracing
│   │
│   ├── api/                # Client-Side API Layer
│   │   ├── client.ts       # Base API client configuration
│   │   └── types.ts        # API request/response types
│   │
│   ├── types/              # TypeScript Definitions
│   │   ├── index.ts        # Main type exports
│   │   ├── itinerary.ts    # Travel itinerary types
│   │   └── rag.ts          # AI/LLM related types
│   │
│   ├── hooks/              # Custom React Hooks
│   │   ├── useFormData.ts  # Form state management
│   │   └── useItinerary.ts # Itinerary generation hook
│   │
│   └── utils/              # Utility Functions
│       ├── validation.ts   # Zod schemas
│       └── constants.ts    # App constants
│
├── public/                 # Static Assets
└── .github/               # GitHub Configuration
    └── copilot-instructions.md
```

### Naming Conventions (Speed-Focused)

```typescript
// Files: kebab-case
user-profile.tsx
multi-agent-service.ts
web-search.ts

// Components: PascalCase
UserProfile.tsx
TripDetailsForm.tsx
ItineraryDisplay.tsx

// Functions: camelCase
generateItinerary()
handleFormSubmit()
executeAgent()

// Constants: SCREAMING_SNAKE_CASE
MAX_BUDGET_AMOUNT
DEFAULT_TRIP_DURATION
```

### File Templates (Copy-Paste Ready)

#### Edge Function Template
```typescript
// api/[endpoint]/index.ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  // TODO: Add your Edge function logic
}
```

#### Service Template
```typescript
// src/services/[name]Service.ts
export class NameService {
  // TODO: Add service methods
}
```

#### Component Template
```typescript
// src/components/[Name]/[Name].tsx
export function ComponentName() {
  // TODO: Add component logic
  return <div></div>;
}
```

## LLM Integration
- Use the routing service pattern from `src/services/llmRoutingService.ts`.
- Include complexity analysis for provider selection.
- Implement proper fallback handling.
- Track costs and token usage.
- Include observability tracing.

## Constitutional Compliance
- **Edge Runtime Only**: No Node.js APIs, client-side secrets.
- **Multi-LLM Resilience**: Always include fallback providers.
- **Observable AI Operations**: Include tracing and cost tracking.
- **Type Safety**: Use TypeScript with Zod validation.
- **Progressive Enhancement**: Graceful degradation patterns.

## Common Patterns
- Use `createRoutingGroqClient()` for LLM calls.
- Follow the multi-agent service pattern from `multiAgentService.ts`.
- Use the form data interfaces from `src/types/index.ts`.
- Include proper error boundaries and loading states.
- Use the existing styling patterns with Tailwind and custom CSS variables.