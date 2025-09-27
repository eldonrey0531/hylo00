# Implementation Plan: AI-Generated Personalized Itinerary

**Branch**: `002-create-an-ai` | **Date**: 2025-09-27 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/002-create-an-ai/spec.md`

## Summary
- Deliver an AI-assisted itinerary generator triggered from the existing trip planning form that outputs structured itinerary sections, travel tips, and next-step actions in a single responsive view.
- Orchestrate Groq-powered itinerary content via Inngest workflows with Upstash Redis while preserving the static Next.js App Router deployment model and console-log observability.

## Technical Context
**Language/Version**: TypeScript targeting Next.js 14.2.x on Node 18+  
**Primary Dependencies**: Next.js App Router, React 18, Tailwind CSS, React Hook Form, Zod, `@inngest/sdk` + `@inngest/next`, `@upstash/redis`, `groq-sdk`, Tavily, Exa, `jspdf`, `html2canvas`  
**Storage**: Upstash Redis used for workflow state, cache, and status polling  
**Testing**: Manual validation suites defined in `manual-validation/*` plus existing ESLint/TypeScript checks (no automated unit tests per spec)  
**Target Platform**: Static deployment to Vercel (preview + production)  
**Performance Goals**: Keep itinerary workflow under 60s wall-clock with intermediate status reporting; ensure client render <2s with cached assets  
**Constraints**: Adhere to static-site boundaries, respect API rate limits, avoid introducing non-approved frameworks, maintain accessibility and responsive design  
**Scale/Scope**: Single application instance supporting itineraries up to ~10 days with family-friendly data depth and complete logging.

## Constitution Check
- ✅ Next.js remains the primary framework; no additional frameworks introduced.
- ✅ Static site approach maintained by delegating long-running AI work to Inngest workflows exposed through API routes.
- ✅ Deployment path stays on Vercel with App Router conventions intact.
- ✅ TypeScript typing enforced across new modules (`types/itinerary/*`, `lib/*`).
- ✅ Context7 MCP guidance consulted:
  - `/inngest/inngest-js` App Router example for `@inngest/next` handler placement and `serve()` usage.
  - `/groq/groq-typescript` typed completion snippets for `groq-sdk` client configuration.
  - `/parallax/jspdf` browser download patterns using `doc.html()` + `doc.save()` to drive client-side PDF export.

## Project Structure
```
app/
├── api/
│   ├── itinerary/
│   │   ├── generate/route.ts
│   │   ├── status/[workflowId]/route.ts
│   │   ├── export/pdf/route.ts
│   │   └── email/prepare/route.ts
│   ├── ai/health/route.ts
│   └── maps/static/route.ts
├── layout.tsx
├── page.tsx
└── globals.css
components/
├── itinerary/
│   ├── ItineraryDisplay.tsx
│   ├── ItineraryHeader.tsx
│   ├── TripSummary.tsx
│   ├── KeyDetails.tsx
│   ├── MapDisplay.tsx
│   ├── DailyItinerary.tsx
│   ├── TravelTips.tsx
│   └── ActionButtons.tsx
└── forms/...
lib/
├── ai/
│   ├── groqService.ts
│   └── researchService.ts
├── config/itinerary-config.ts
├── export/
│   ├── pdfService.ts
│   └── emailService.ts
├── itinerary/assembler.ts
├── maps/staticMap.ts
├── redis/stateStore.ts
└── workflow/
    ├── inngestClient.ts
    └── itineraryWorkflow.ts
types/
└── itinerary/*.ts
utils/
├── console-logger.ts
└── data-cleaner.ts
```

**Structure Decision**: Retain the single Next.js App Router project rooted at repo base; all new feature modules live under the constitution-approved directories (`app/`, `components/`, `lib/`, `types/`, `utils/`).

## Phase 0: Outline & Research
### Inputs & Unknowns
- Confirm detailed Groq prompt structure and output schema for `spec.md` acceptance criteria.
- Validate Upstash Redis data model for workflow state / idempotency.
- Clarify Tavily & Exa usage sequencing relative to itinerary assembly.
- Determine optimal manual validation checklist to satisfy FR-017 & FR-018 logging requirements.

### Work
1. Audit `spec.md` and `research.md` to ensure all NEEDS CLARIFICATION flags are resolved; capture any remaining questions in `research.md`.
2. Gather Groq SDK best practices for streaming vs. single-shot completions aligned with Grok 1.5.
3. Compile Inngest Workflow Kit references covering `@inngest/next` App Router integration, step retries, and event definitions.
4. Document Redis key patterns (workflow status, cached sections) in `research.md` decisions.
5. Survey jsPDF/html2canvas client export patterns for Tailwind-based UIs.
6. Outline at least one fallback strategy if Groq inference fails (e.g., degrade to curated tips) and record in `research.md`.

### Outputs
- Updated `research.md` with decisions, rationales, and alternatives for AI stack, workflow orchestration, PDF export, and resilience.
- No code yet, but all open questions closed.

## Phase 1: Contracts & Design
### Files
- `specs/002-create-an-ai/contracts/` (create as needed)
- `specs/002-create-an-ai/data-model.md`
- `specs/002-create-an-ai/quickstart.md`
- `types/itinerary/itinerary.ts`
- `types/itinerary/workflow.ts`

### Steps
1. Define TypeScript contracts in `types/itinerary/*` covering:
   - `ItineraryRequest`, `ItineraryDay`, `ItinerarySegment`, `TravelTip`, `ItineraryResponse`.
   - Workflow events (`ItineraryRequested`, `ItineraryGenerated`, `ItineraryExported`).
   - Manual validation data used in FR-018 logging (status enums, timestamps).
2. Document data flow diagrams in `data-model.md` showing form submission → API route → Inngest workflow → Groq/Tavily/Exa → Redis → client polling.
3. Capture happy-path and failure-path sequence diagrams for itinerary generation plus export in `contracts/sequence.md`.
4. Compose `quickstart.md` with environment setup, secrets, and dev loop instructions.
5. Record how console logs map to each layer (matching `spec.md` Steps 10–24) in `contracts/logging.md`.
6. Update Constitution check, verifying design stays within static-site restrictions.

### Gates
- All contracts reviewed and consistent with `spec.md` acceptance criteria.
- Logging touchpoints aligned with spec step mapping.
- No unresolved `TODO`/`NEEDS CLARIFICATION` left in design artifacts.

## Phase 2: Tasks Preparation (via `/tasks`, already complete)
- Reference `tasks.md` for the ordered implementation sequence; ensure dependencies from Phase 1 are reflected there.

## Phase 3: Implementation Roadmap
### 3.1 Workflow & Config Foundations
1. Add `lib/workflow/inngestClient.ts` initializing `Inngest` with app/env names, referencing `process.env`.
2. Implement `lib/workflow/itineraryWorkflow.ts` using Workflow Kit patterns:
   - Event trigger: `app/itinerary.requested`.
   - Steps: gather research (Tavily/Exa), call Groq, assemble itinerary, persist to Redis, emit completion event, handle retries.
   - Ensure console logs per spec (Steps 16–21).
3. Create `lib/redis/stateStore.ts` wrappers for `setItineraryStatus`, `getItineraryStatus`, `saveItineraryPayload`, `saveExportStatus` with expiration and error logging.
4. Draft manual test instructions for workflow invocation via Inngest dashboard.

### 3.2 API Layer & Client-Side Hooks
1. Build `app/api/itinerary/generate/route.ts`:
   - Validate form payload against `ItineraryRequest` schema (`zod`).
   - Trigger Inngest event, return `workflowId`, write log Step 13.
2. Create `app/api/itinerary/status/[workflowId]/route.ts` reading Redis state, exposing `status`, `lastUpdated`, partial results.
3. Implement `app/api/itinerary/export/pdf/route.ts` to fetch stored itinerary, assemble PDF via `pdfService`, return binary.
4. Build `app/api/itinerary/email/prepare/route.ts` to format summary and queue email (stub returning 501 if email integration deferred; log Step 24).
5. Add `app/api/ai/health/route.ts` to ping Groq and Redis, providing readiness signal for manual QA.

### 3.3 Client Components & Hooks
1. Extend existing travel form submit handler to call `/api/itinerary/generate`, manage `workflowId`, and enter polling loop.
2. Implement `useItineraryPoller` hook in `components/itinerary/` for status polling and log Step 22.
3. Create UI components: `ItineraryDisplay`, `ItineraryHeader`, `TripSummary`, `KeyDetails`, `MapDisplay`, `DailyItinerary`, `TravelTips`, `ActionButtons`.
4. Integrate map display via `lib/maps/staticMap.ts` with caching and fallback imagery.
5. Ensure Tailwind styling matches design tokens; confirm accessible semantics.

### 3.4 Services & Utilities
1. Build `lib/ai/groqService.ts` encapsulating Groq client initialization and typed completion calls; include request/response logging.
2. Implement `lib/ai/researchService.ts` orchestrating Tavily/Exa lookups with caching, deduplication, and circuit breaker safeguards.
3. Author `lib/itinerary/assembler.ts` transforming AI outputs and research data into structured `ItineraryResponse`.
4. Add `lib/export/pdfService.ts` using jsPDF/html2canvas to render itinerary PDF.
5. Provide `lib/export/emailService.ts` stub or implementation aligned with manual validation (note TODO if deferred).
6. Write `utils/console-logger.ts` centralizing the log shape with metadata.
7. Create `utils/data-cleaner.ts` to sanitize AI output before display/export.

### 3.5 Wiring & Integration
1. Register Inngest handler via `app/api/ai/inngest/route.ts` calling `serve()` with itinerary workflow.
2. Update layout/providers if additional context/state required.
3. Wire manual validation toggles or dev flags defined in spec.
4. Add feature flag or environment guard to disable itinerary generation when secrets missing; log friendly error.
5. Ensure `/app/page.tsx` surfaces itinerary UI entry point or links from existing flow.

### 3.6 Manual Validation Enablement
1. Populate `manual-validation/002-create-an-ai.md` checklist covering spec FRs (FR-017 logging, FR-018 manual verification, FR-019 export).
2. Document QA steps for success, AI failure, partial data, PDF download, console logs.
3. Provide instructions for capturing network traces and log outputs for sign-off.

### 3.7 Finalization
1. Update `README.md` or feature-specific section with quickstart reference.
2. Add necessary environment variables to `.env.example` (if present) and docs.
3. Capture demo media for release notes (if required).
4. Prepare release notes summarizing feature scope, manual validation status, deployment considerations.

## Phase 4: Quality Gates
- **Build**: `pnpm lint` and `pnpm type-check` must pass.
- **Manual Tests**: Execute `manual-validation/002-create-an-ai.md` scenarios (workflow success, failure, PDF export, log verification).
- **Logging Audit**: Confirm console output order matches `spec.md` Steps 10–24.
- **Accessibility**: Run basic keyboard + screen reader smoke on itinerary components.
- **Performance**: Validate workflow completes within acceptable SLA using Inngest dashboard metrics.

## Phase 5: Deployment Readiness
1. Submit PR referencing spec link, include summary and testing notes.
2. Obtain review from AI platform owner + design QA.
3. Merge after approvals, verify Vercel preview, then promote to production.
4. Monitor logs and Redis throughput for first 24 hours; prepare rollback plan (feature flag disable) if instability detected.
