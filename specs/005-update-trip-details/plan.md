# Implementation Plan: Trip Details Enhancements

**Branch**: `005-update-trip-details` | **Date**: September 19, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-update-trip-details/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Project Type: web application (React frontend)
   → ✅ Structure Decision: Frontend-focused updates with form enhancements
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → ✅ No constitutional violations detected
   → ✅ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ All technical requirements clear from existing codebase
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md
7. Re-evaluate Constitution Check section
   → ✅ No new violations after design
   → ✅ Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. ✅ STOP - Ready for /tasks command
```

## Summary
Primary requirement: Enhance trip details forms with budget mode switching (total vs per-person), complete travel group/interest/inclusion options with "Other" choices, comprehensive travel style data collection, and simplified contact form. Technical approach: Update existing React components with extended form handling, maintain TypeScript safety, preserve Tailwind styling patterns, and ensure all user selections are captured in form data.

## Technical Context
**Language/Version**: TypeScript 5.5.3 with React 18.3.1  
**Primary Dependencies**: React Hook Form 7.62.0, Zod 3.25.76, Tailwind CSS 3.4.1, Lucide React 0.344.0  
**Storage**: Local form state with React useState/useCallback patterns  
**Testing**: Vitest 3.2.4 + React Testing Library 16.3.0 (TDD required)  
**Target Platform**: Web browsers (responsive design)
**Project Type**: web - React frontend with form enhancements  
**Performance Goals**: No additional re-renders, maintain <2s response time  
**Constraints**: Type-safe forms with Zod validation, preserve existing design patterns  
**Scale/Scope**: 6 form components, 24 functional requirements, maintain existing architecture

**User-provided Implementation Details**: 
- Update all connected files for comprehensive data gathering
- Ensure visibility in gathered form data
- Don't integrate AI LLM first (will be done later)
- Focus on frontend form enhancements and data collection

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Test-First Development**: All form updates will have corresponding tests written first  
✅ **Type Safety**: TypeScript strict mode maintained, Zod schemas for validation  
✅ **Component-Based**: React functional components with hooks, no architectural changes  
✅ **Performance**: No impact on existing performance, local state management  
✅ **Cost Conscious**: Frontend-only changes, no impact on LLM costs  
✅ **Edge-First**: No backend changes required  
✅ **Observable**: Form interactions trackable through existing patterns

## Project Structure

### Documentation (this feature)
```
specs/005-update-trip-details/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── components/
│   ├── TripDetails/              # Main target directory
│   │   ├── index.tsx            # Updated to show budget toggle
│   │   ├── BudgetForm.tsx       # Enhanced with total/per-person switch
│   │   ├── TravelGroupSelector.tsx # Updated with specific names + Other
│   │   ├── TravelInterests.tsx  # Updated to capture specific choices + Other
│   │   ├── ItineraryInclusions.tsx # Enhanced with all options + Other
│   │   └── types.ts             # Extended with new form data types
│   └── travel-style/             # Travel style forms directory
│       ├── TripNickname.tsx     # Simplified to 3 fields only
│       ├── TravelExperience.tsx # Ensure all options captured
│       ├── TripVibe.tsx         # Ensure Other option captured
│       ├── SampleDays.tsx       # Ensure all selections captured
│       └── DinnerChoice.tsx     # Ensure all selections captured
├── types/
│   └── travel-style-choice.ts   # Updated for comprehensive data capture
└── schemas/
    └── formSchemas.ts           # Updated Zod schemas
```

**Structure Decision**: Frontend-focused (Option 2 web structure, frontend portion only)

## Phase 0: Outline & Research

All technical context is clear from existing codebase analysis. No NEEDS CLARIFICATION items remain.

**Research findings**:
- **Budget Toggle Pattern**: Use existing switch component pattern from BudgetForm flexibility toggle
- **Other Option Pattern**: Follow existing pattern from TripVibe component with conditional text input
- **Data Collection Strategy**: Extend existing FormData type and form handling patterns
- **Component Update Approach**: Maintain existing prop interfaces, extend with new optional fields

**Output**: research.md with implementation patterns documented

## Phase 1: Design & Contracts

### Entities & Data Model
1. **Enhanced FormData**: Extended TripDetails FormData with budget mode and complete selections
2. **Travel Style Data**: Comprehensive capture of all form responses including Other options
3. **Budget Configuration**: Mode switching between total and per-person calculations
4. **Selection Tracking**: Consistent pattern for predefined + custom options across all forms

### Component Contracts
1. **BudgetForm**: Enhanced with budget mode toggle and dynamic calculations
2. **TravelGroupSelector**: Complete with all group names and Other option
3. **TravelInterests**: Enhanced to capture specific choice names and Other
4. **ItineraryInclusions**: Complete options with preferences and Other
5. **Travel Style Forms**: Ensure all option selections are captured
6. **TripNickname**: Simplified to essential fields only

### Test Strategy
- Component tests for each updated form with new functionality
- Integration tests for data flow and form state management
- Type safety tests for extended FormData structures

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each component update → test task [P] + implementation task
- Each new data field → type definition task [P]
- Form data integration → integration test task
- Manual testing verification → quickstart validation task

**Ordering Strategy**:
- TDD order: Tests before implementation for each component
- Dependency order: Types → Components → Integration → Validation
- Parallel execution: Component updates can run in parallel [P]

**Estimated Output**: 18-22 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, form data validation)

## Complexity Tracking
*No constitutional violations detected*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

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
- [x] Complexity deviations documented

---
*Based on Constitution v2.0.0 - See `.specify/memory/constitution.md`*