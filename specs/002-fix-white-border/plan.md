# Implementation Plan: Fix White Border and Preference Component Styling Issues

**Branch**: `002-fix-white-border` | **Date**: September 19, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fix-white-border/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
2. Fill Technical Context ✓
3. Fill the Constitution Check section ✓
4. Evaluate Constitution Check section ✓
5. Execute Phase 0 → research.md ✓
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md ✓
7. Re-evaluate Constitution Check section ✓
8. Plan Phase 2 → Describe task generation approach ✓
9. STOP - Ready for /tasks command ✓
```

## Summary
Fix preference component styling issues including white border padding, header formatting, "Other" field placeholder behavior, and grid layout organization. Focus on visual consistency and user experience improvements across accommodation and rental car preference forms. Additional requirement: First div should occupy full row width, remove rounded corners, add top spacing, and change "ITINERARY INCLUSIONS" text to "What Should We Include in Your Itinerary?"

## Technical Context
**Language/Version**: TypeScript 5.5.3 with React 18.3.1  
**Primary Dependencies**: Tailwind CSS 3.4.1, React Hook Form 7.62.0, Zod 3.25.76, Lucide React 0.344.0  
**Storage**: N/A (UI-only changes)  
**Testing**: Vitest 3.2.4 + React Testing Library 16.3.0  
**Target Platform**: Web browsers (React SPA)  
**Project Type**: Web application (frontend components)  
**Performance Goals**: <2s page load, smooth visual transitions  
**Constraints**: Maintain existing functionality, preserve accessibility, follow design system  
**Scale/Scope**: 3 preference components (Accommodation, Rental Car, Flight), header text change in parent component

**Additional Details from User**: 
- Every preference component has 3 divs: parent, 1st div, 2nd div
- 1st div should occupy entire row from left to right
- Remove rounded corners from 1st div and add top spacing
- Change "ITINERARY INCLUSIONS" text to "What Should We Include in Your Itinerary?"

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Test-First Development**: Will implement comprehensive test suite before styling changes
- ✅ **Type-Safe Development**: TypeScript strict mode maintained, component interfaces preserved
- ✅ **Component-Based Architecture**: Working within existing React functional components
- ✅ **Tailwind CSS Standards**: Using utility-first styling with existing design tokens
- ✅ **Cost-Conscious Design**: UI-only changes, no additional dependencies or API calls
- ✅ **Observable Operations**: Changes will be testable and measurable through UI tests

No constitutional violations detected. All changes align with existing architecture and standards.

## Project Structure

### Documentation (this feature)
```
specs/002-fix-white-border/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application structure (Option 2)
src/
├── components/
│   └── TripDetails/
│       ├── ItineraryInclusions.tsx    # Header text change
│       ├── PreferenceModals/
│       │   ├── AccommodationPreferences.tsx
│       │   ├── RentalCarPreferences.tsx  
│       │   └── FlightPreferences.tsx
│       └── ...
├── types/
└── utils/

tests/
├── components/
│   └── TripDetails/
│       ├── ItineraryInclusions.test.tsx
│       └── PreferenceModals/
│           ├── AccommodationPreferences.test.tsx
│           ├── RentalCarPreferences.test.tsx
│           └── FlightPreferences.test.tsx
└── ...
```

**Structure Decision**: Web application (Option 2) - Frontend components with existing React/TypeScript/Tailwind stack

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Tailwind CSS best practices for full-width layouts and spacing ✓
   - React placeholder input patterns and behavior ✓  
   - Grid layout patterns for 2x2 arrangements ✓
   - Component structure analysis for 3-div pattern ✓

2. **Generate and dispatch research agents**:
   ```
   Task: "Research Tailwind CSS full-width layout patterns for header components"
   Task: "Research React input placeholder best practices and non-editable text handling"
   Task: "Research CSS Grid 2x2 layout patterns with Tailwind utilities"
   Task: "Analyze existing preference component structure and styling patterns"
   Task: "Research accessibility considerations for placeholder text and grid layouts"
   ```

3. **Consolidate findings** in `research.md`

**Output**: research.md with styling patterns and implementation approaches

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - PreferenceComponent interface with 3-div structure
   - PlaceholderField behavior specification
   - GridLayout configuration for 2x2 patterns

2. **Generate component contracts** from functional requirements:
   - Header styling contract (full-width, no rounded corners)
   - Placeholder field contract (non-editable placeholder behavior)
   - Grid layout contract (2x2 arrangement)
   - Text content contract (header text change)

3. **Generate component tests** from contracts:
   - Visual regression tests for styling changes
   - Placeholder behavior tests
   - Grid layout arrangement tests
   - Accessibility tests for modified components

4. **Extract test scenarios** from user stories:
   - Header appearance and spacing scenarios
   - Placeholder interaction scenarios
   - Grid layout visual scenarios
   - Text content verification scenarios

5. **Update copilot instructions** with new styling patterns and requirements

**Output**: data-model.md, /contracts/*, failing component tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from component styling requirements
- Header text change task (ItineraryInclusions.tsx) [P]
- Each preference component → styling update task [P]
- Placeholder behavior → AccommodationPreferences specific task
- Grid layout → both AccommodationPreferences and RentalCarPreferences tasks [P]
- Test creation tasks before implementation tasks (TDD)

**Ordering Strategy**:
- TDD order: Component tests before styling implementation
- Visual order: Header changes before component details
- Parallel execution: Independent component changes marked [P]
- Test validation: Each styling change followed by test verification

**Estimated Output**: 12-15 numbered, ordered tasks covering test creation, header text change, styling improvements, and validation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following TDD and design system principles)  
**Phase 5**: Validation (run component tests, visual regression tests, accessibility validation)

## Complexity Tracking
*No constitutional violations identified - no entries needed*

## Progress Tracking
*This checklist is updated during execution flow*

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
- [x] Complexity deviations documented (none needed)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*