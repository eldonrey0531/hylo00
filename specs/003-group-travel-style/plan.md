# Implementation Plan: Group Travel Style Section with Conditional Display

**Branch**: `003-group-travel-style` | **Date**: September 19, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-group-travel-style/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → COMPLETED: Feature spec loaded with clear requirements
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type: web application (React frontend + Vercel Edge backend)
   → Set Structure Decision: Option 2 (Web application structure)
3. Fill the Constitution Check section based on constitution document
4. Evaluate Constitution Check section
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md
7. Re-evaluate Constitution Check section
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Summary
Primary requirement: Group travel style section starting from "🌏 TRAVEL STYLE" header into a conditional display system with two user paths - detailed preference forms or skip to nickname. Technical approach: Create choice component using existing GenerateItineraryButton styling template, implement state management for path selection, and preserve all existing form functionality within the current React/TypeScript architecture.

## Technical Context
**Language/Version**: TypeScript 5.5.3 with React 18.3.1  
**Primary Dependencies**: React Hook Form 7.62.0, Zod 3.25.76, Tailwind CSS 3.4.1, Lucide React 0.344.0  
**Storage**: Client-side state management with useState/useReducer  
**Testing**: Vitest 3.2.4 + React Testing Library 16.3.0  
**Target Platform**: Web browsers (modern ES2020+ support)  
**Project Type**: web - determines frontend structure  
**Performance Goals**: <2s form interaction response, maintain <200KB bundle size  
**Constraints**: Edge-compatible code, no client-side API keys, TDD mandatory  
**Scale/Scope**: Single feature affecting App.tsx and 3-5 new components  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Test-First Development**: All components require failing tests before implementation
- [x] **Edge-Compatible**: Client-side only, no edge function changes needed
- [x] **Type Safety**: TypeScript strict mode with Zod validation schemas
- [x] **Component Architecture**: React functional components with clear separation
- [x] **Cost Conscious**: UI-only changes, no LLM operations impact
- [x] **Observable**: Form state changes trackable, no backend impact
- [x] **Performance**: No impact on existing <2s API response time

**Constitutional Compliance**: ✅ PASS - This is a pure frontend UI enhancement that aligns with all constitutional principles.

## Project Structure

### Documentation (this feature)
```
specs/003-group-travel-style/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (frontend + backend detected)
src/
├── components/
│   ├── TravelStyleChoice.tsx        # NEW: Choice between detailed/skip
│   ├── ConditionalTravelStyle.tsx   # NEW: Container for conditional display
│   ├── App.tsx                      # MODIFIED: Integration point
│   └── travel-style/                # EXISTING: Form components
└── types/
    └── travel-style-choice.ts       # NEW: Choice state types

tests/
├── components/
│   ├── TravelStyleChoice.test.tsx   # NEW: Choice component tests
│   └── ConditionalTravelStyle.test.tsx # NEW: Integration tests
└── integration/
    └── travel-style-flow.test.tsx   # NEW: End-to-end flow tests
```

**Structure Decision**: Option 2 (Web application) - Frontend modifications only, no backend changes required

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Button styling template investigation: ✅ RESOLVED (GenerateItineraryButton pattern identified)
   - State management approach for choice persistence: Research needed
   - Integration approach with existing App.tsx structure: Research needed

2. **Generate and dispatch research agents**:
   ```
   Task: "Research GenerateItineraryButton styling template for consistent choice buttons"
   Task: "Research React state management patterns for conditional form display"
   Task: "Research existing App.tsx integration points for travel style section"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical approaches resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - TravelStyleChoice (enum: detailed, skip, not-selected)
   - ConditionalDisplayState (choice, showDetailedForms, preservedData)
   - ChoiceButtonProps (styling, handlers, states)

2. **Generate API contracts** from functional requirements:
   - Choice selection event interface
   - Form state preservation contract
   - Component prop interfaces
   - Output TypeScript interfaces to `/contracts/`

3. **Generate contract tests** from contracts:
   - Choice button interaction tests
   - State management validation tests
   - Integration with existing forms tests

4. **Extract test scenarios** from user stories:
   - User chooses detailed path → all forms displayed
   - User chooses skip path → only nickname form displayed
   - Form state preservation during navigation

5. **Update agent file incrementally**:
   - Run update-agent-context.ps1 for GitHub Copilot
   - Add travel style choice patterns
   - Update current feature context
   - Preserve existing TravelersForm and preference modal improvements

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, updated .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs
- Each TypeScript interface → contract test task [P]
- Each component → component test + implementation task
- Integration task for App.tsx modification
- Styling alignment tasks using GenerateItineraryButton template

**Ordering Strategy**:
- TDD order: Interface tests → component tests → implementation
- Dependency order: Types → individual components → integration
- Mark [P] for parallel execution (independent components)

**Estimated Output**: 12-15 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following TDD principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, visual regression testing)

## Complexity Tracking
*No constitutional violations requiring justification*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (None required)

---
*Based on Constitution v2.0.0 - See `.specify/memory/constitution.md`*