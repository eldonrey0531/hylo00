# Implementation Plan: LangChain.js Multi-LLM Routing Infrastructure

**Branch**: `003-setup-langchain-js` | **Date**: September 17, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-setup-langchain-js/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Create a multi-LLM routing infrastructure that automatically selects the optimal AI provider (Cerebras, Gemini, or Groq) based on query complexity, provider availability, and cost considerations. The system must provide automatic fallback chains, API key rotation, comprehensive logging, and maintain service availability even when individual providers fail. This enables Hylo's travel planning system to deliver reliable AI-powered recommendations while optimizing for cost and performance through intelligent provider selection.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 18, LangChain.js, Vite, Vercel Edge Runtime, LangSmith (tracing)
**Storage**: N/A (stateless routing layer)  
**Testing**: Vitest, Playwright (E2E), Contract Testing with OpenAPI
**Platform**: Vercel (Edge Functions)
**Target Platform**: Vercel Edge Runtime (V8 isolates)
**Project Type**: web (frontend + backend edge functions)  
**Performance Goals**: <150ms edge function cold start, <2s LLM response streaming start, <30s API timeout
**Constraints**: Free tier quotas per provider, edge function memory limits (128MB), token usage optimization  
**Scale/Scope**: Support for 3 LLM providers, multiple API keys per provider, request complexity classification, fallback chain depth of 2-3 providers

**User-provided details**: Setup LangChain.js multi-LLM routing infrastructure with Cerebras, Gemini, and Groq providers, API key rotation, and basic fallback chains

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Edge-First Architecture ✅

- All LLM interactions will be routed through Vercel Edge Functions
- No API keys exposed in client-side code
- Authentication and rate limiting at edge layer

### II. Multi-LLM Resilience ✅

- Intelligent routing across Cerebras (complex), Gemini (balanced), Groq (fast)
- Automatic fallback chains with at least 2 alternatives per request
- API key rotation to maximize free tier usage

### III. Observable AI Operations ✅

- LangSmith tracing integration for all LLM interactions
- Structured logging: model, tokens, latency, complexity, fallback chain
- Cost tracking per operation and provider

### IV. Type-Safe Development ✅

- Strict TypeScript throughout codebase
- Zod validation for external API responses
- Proper LangChain.js type extensions

### V. Progressive Enhancement ✅

- Core functionality works with degraded providers
- Graceful error handling and loading states
- Streaming responses where possible

### VI. Cost-Conscious Design ✅

- Free tier limits respected through intelligent routing
- Usage tracking and automatic throttling
- Token-optimized prompts

### VII. Security by Default ✅

- Environment variables properly scoped in Vercel
- Rate limiting on all API routes
- Input sanitization mandatory
- Explicit CORS configuration

**Result**: PASS - All constitutional requirements aligned with feature design

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Frontend React app + Backend Edge Functions for multi-LLM routing

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved ✅

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file ✅

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
