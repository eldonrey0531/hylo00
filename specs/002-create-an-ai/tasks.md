# Tasks: AI-Generated Personalized Itinerary

**Input**: Design documents from `C:/Users/raze0/Documents/hylo00/hylo00/specs/002-create-an-ai/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Confirm prerequisites via check-prerequisites.ps1 output → FEATURE_DIR ready
2. Load plan.md, research.md, data-model.md, contracts/, quickstart.md
3. Generate ordered tasks honoring setup → manual validation prep → models → services → routes → UI → validation
4. Mark tasks touching distinct files with [P] for parallel execution
5. Reference Context7 snippets before coding Inngest/Groq integrations
6. Output numbered task list with dependencies and manual validation focus
```

## Task List

### Phase 3.1 – Setup & Context Gathering
- [X] T001 Configure environment template per `contracts/configuration.md`; create/update `/.env.template` and ensure required keys documented for manual validation. *(Blocks all implementation)*
- [X] T002 Update `package.json` and lockfile with required deps (`ai`, `groq-sdk`, `inngest`, `@upstash/redis`, `tavily`, `exa-js`, `zod`, `date-fns`, `uuid`); run install. *(Depends on T001)*
- [X] T003 [P] Use Context7 to capture the current Inngest Workflow Kit + Next.js sample; store findings in `specs/002-create-an-ai/context7/inngest-notes.md`. *(Depends on T002)*
- [X] T004 [P] Use Context7 to collect Groq AI SDK usage patterns with AI SDK Vercel; document in `specs/002-create-an-ai/context7/groq-notes.md`. *(Depends on T002)*
- [X] T005 [P] Use Context7 to gather Tavily + Exa integration examples for TypeScript; document in `specs/002-create-an-ai/context7/research-notes.md`. *(Depends on T002)*
- [X] T006 [P] Use Context7 to capture email deep link patterns and accessible HTML export guidance; document in `specs/002-create-an-ai/context7/email-template-notes.md`. *(Depends on T002)*

### Phase 3.2 – Manual Validation Blueprints (replace automated tests)
 [X] T007 [P] Draft manual validation checklist for `POST /api/itinerary/generate` in `manual-validation/api/generate.md` (curl steps, expected payloads). *(Depends on T003-T006)*
 [X] T008 [P] Draft manual validation checklist for `GET /api/itinerary/status/{workflowId}` in `manual-validation/api/status.md`. *(Depends on T003-T006)*
 [X] T010 [P] Draft manual validation checklist for `POST /api/itinerary/email/prepare` in `manual-validation/api/email-prepare.md`. *(Depends on T003-T006)*
 [X] T011 [P] Draft manual validation checklist for `GET /api/ai/health` in `manual-validation/api/ai-health.md`. *(Depends on T003-T006)*
 [X] T012 [P] Draft manual validation checklist for `GET /api/maps/static` in `manual-validation/api/maps-static.md`. *(Depends on T003-T006)*
 [X] T013 [P] Document quickstart Scenario 1 (complete form) steps in `manual-validation/ui/scenario-complete.md`. *(Depends on T003-T006)*
 [X] T014 [P] Document quickstart error scenarios (invalid data cases) in `manual-validation/ui/scenario-errors.md`. *(Depends on T003-T006)*
 [X] T015 [P] Document console logging verification steps (24-step contract) in `manual-validation/logging/sequence.md`. *(Depends on T003-T006)*

### Phase 3.3 – Data Models & Types (informed by data-model.md)
- [X] T016 Define `TripFormData`, related enums, and `ContactInfo` in `types/itinerary/trip-form-data.ts`; export via `types/index.ts`. *(Depends on T015)*
- [X] T017 Define `Itinerary`, `TripSummary`, `KeyDetails`, `ItineraryMetadata`, `ConsoleLogEntry` in `types/itinerary/itinerary.ts`; update `types/index.ts`. *(Depends on T015)*
- [X] T018 Define `DailyActivity`, `Activity`, `TimeSlot` in `types/itinerary/daily-activity.ts`; update `types/index.ts`. *(Depends on T015)*
- [X] T019 Define `TravelTip`, `TipCategory`, and `Priority` in `types/itinerary/travel-tip.ts`; update `types/index.ts`. *(Depends on T015)*
- [X] T020 Ensure shared enums (`Currency`, `BudgetMode`, `ItineraryStatus`, `LogStatus`) live in `types/itinerary/enums.ts` and are re-exported. *(Depends on T016-T019)*

### Phase 3.4 – Foundation Utilities & Services
- [X] T021 Implement singleton console logger per contract in `utils/console-logger.ts`. *(Depends on T020)*
- [X] T023 Implement configuration helper in `lib/config/itinerary-config.ts` to read env vars with safe defaults. *(Depends on T001, T020)*
- [X] T024 Implement Groq AI service in `lib/ai/groqService.ts` using Context7 Groq notes; support prompts + logging. *(Depends on T004, T021, T023)*
- [ ] T025 Implement Tavily/Exa enrichment service in `lib/ai/researchService.ts` using Context7 research notes. *(Depends on T005, T021, T023)*
- [ ] T026 Implement SERP maps client in `lib/maps/staticMap.ts` to fetch and cache URLs. *(Depends on T023)*
- [X] T027 Implement Upstash Redis helper in `lib/redis/stateStore.ts` for itinerary state + caching. *(Depends on T005, T023)*
- [X] T028 Implement Inngest client bootstrap in `lib/workflow/inngestClient.ts` following Context7 Inngest notes. *(Depends on T003, T023, T027)*
- [X] T029 Implement itinerary workflow handler in `lib/workflow/itineraryWorkflow.ts` orchestrating AI calls, research, logging, and Redis persistence. *(Depends on T024-T028)*
- [ ] T030 Implement itinerary assembler in `lib/itinerary/assembler.ts` to convert AI outputs into typed `Itinerary`. *(Depends on T016-T029)*
- [ ] T032 Implement email preparation helper in `lib/export/emailService.ts` including mailto deep link and accessible HTML templating. *(Depends on T006, T030)*

### Phase 3.5 – API Routes (per contracts)
- [X] T033 Implement `app/api/itinerary/generate/route.ts` to enqueue Inngest workflow and return status link. *(Depends on T024-T030)*
- [X] T034 Implement `app/api/itinerary/status/[workflowId]/route.ts` to expose progress + logs per contract. *(Depends on T027, T029)*
- [X] T036 Implement `app/api/itinerary/email/prepare/route.ts` invoking email helper and returning payload. *(Depends on T032, T027)*
- [X] T037 Implement `app/api/ai/health/route.ts` aggregating health info from Groq/Tavily/Exa. *(Depends on T024, T025)*
- [X] T038 Implement `app/api/maps/static/route.ts` proxying SERP map responses with caching. *(Depends on T026, T027)*

### Phase 3.6 – UI Composition & Styling
- [X] T039 Create `components/itinerary/ItineraryDisplay.tsx` as container wiring all subsections and action triggers. *(Depends on T033, T034, T036-T038, T030)*
- [X] T040 [P] Create `components/itinerary/ItineraryHeader.tsx` per styling contract. *(Depends on T039)*
- [X] T041 [P] Create `components/itinerary/TripSummary.tsx` rendering summary data. *(Depends on T039)*
- [X] T042 [P] Create `components/itinerary/KeyDetails.tsx` rendering five detail pills. *(Depends on T039)*
- [X] T043 [P] Create `components/itinerary/MapDisplay.tsx` showing static map with caption. *(Depends on T039, T026)*
- [X] T044 [P] Create `components/itinerary/DailyItinerary.tsx` iterating daily activities. *(Depends on T039)*
- [X] T045 [P] Create `components/itinerary/TravelTips.tsx` rendering tips list. *(Depends on T039)*
- [ ] T048 Update `tailwind.config.js` and `app/globals.css` to apply styling contract tokens, gradients, and responsive rules. *(Depends on T040-T047)*

### Phase 3.7 – Manual Validation & Verification
- [ ] T049 [P] Execute API manual validation checklists (T007, T008, T010-T012) and log outcomes in `manual-validation/api/results.md`. *(Depends on T033, T034, T036-T038)*
- [ ] T050 [P] Execute UI quickstart scenarios (T013-T014) and capture findings in `manual-validation/ui/results.md`. *(Depends on T039-T048)*
- [ ] T051 [P] Run manual console logging audit (T015) ensuring all 24 steps recorded; document in `manual-validation/logging/results.md`. *(Depends on T047)*
- [ ] T052 Perform performance & resilience manual checks (quickstart Steps 15-16) and summarize in `manual-validation/performance.md`. *(Depends on T049-T051)*

## Dependencies & Notes
- Setup (T001-T006) must complete before downstream tasks.
- Manual validation blueprints (T007-T015) replace automated tests and must exist before implementation begins.
- Types (T016-T020) gate service implementation.
- Workflow & services (T021-T032) feed all API routes; respect dependencies noted.
- UI component tasks marked [P] reside in distinct files and may run concurrently once T039 is ready.
- Manual validation execution (T049-T052) concludes the workflow.
- All implementation tasks requiring external patterns must reference stored Context7 notes before coding.

## Parallel Execution Example
```
# After completing T033 and T034, start parallel manual checklist drafting:
/task run T007
/task run T008
/task run T010
/task run T011
/task run T012

# After T039 is complete, build UI subsections in parallel:
/task run T040
/task run T041
/task run T042
/task run T043
/task run T044
/task run T045
```

## Validation Checklist
- [ ] All manual validation checklists drafted before implementation (T007-T015)
- [ ] Every entity from data-model mapped to a type task (T016-T019)
- [ ] Each API contract mapped to a route implementation task (T033, T034, T036-T038)
- [ ] Context7 research captured for major integrations (T003-T006)
- [ ] Manual validation execution tasks cover quickstart scenarios and logging (T049-T052)
- [ ] Styling and theming applied per contracts (T048)

Ready for Phase 3 execution once T001 begins.```}endjson}_RESULTS to=functions.create_file to=functions.create_file to=functions.create_file to=functions.create_file 