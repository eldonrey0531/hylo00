# Tasks: Group Travel Style Section with Conditional Display

**Input**: Design documents from `/specs/003-group-travel-style/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript 5.5.3, React 18.3.1, Vitest, React Testing Library
   → Structure: Web application (frontend only)
2. Load design documents ✅:
   → data-model.md: TravelStyleChoice, ConditionalDisplayState entities
   → contracts/: types.ts, components.ts contracts
   → research.md: GenerateItineraryButton styling, React state patterns
3. Generate tasks by category ✅:
   → Tests: Component tests, integration tests (TDD)
   → Core: TypeScript types, React components
   → Integration: App.tsx modification, styling alignment
4. Apply task rules ✅:
   → Different files = [P] for parallel
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. SUCCESS: Tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [ ] T001 [P] Create TypeScript types file `src/types/travel-style-choice.ts` with TravelStyleChoice enum

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Component Tests

### Integration Tests

## Phase 3.3: Core Implementation (ONLY after tests are failing)
### Type Definitions
- [ ] T011 [P] Implement TravelStyleChoice enum and related types in `src/types/travel-style-choice.ts`

### Components
- [ ] T012 Create TravelStyleChoice component structure in `src/components/TravelStyleChoice.tsx`
- [ ] T013 Implement button rendering with GenerateItineraryButton styling in `src/components/TravelStyleChoice.tsx`
- [ ] T014 Implement onClick handlers for choice selection in `src/components/TravelStyleChoice.tsx`
- [ ] T015 Create ConditionalTravelStyle component structure in `src/components/ConditionalTravelStyle.tsx`
- [ ] T016 Implement conditional rendering logic based on choice state in `src/components/ConditionalTravelStyle.tsx`
- [ ] T017 Implement form component integration for DETAILED path in `src/components/ConditionalTravelStyle.tsx`
- [ ] T018 Implement SKIP path with only TripNickname form in `src/components/ConditionalTravelStyle.tsx`

## Phase 3.4: Integration
- [ ] T019 Add travelStyleChoice state to App.tsx with useState hook
- [ ] T020 Replace existing travel style section (lines 124-210) with ConditionalTravelStyle component in App.tsx
- [ ] T021 Wire up all existing form props to ConditionalTravelStyle component in App.tsx
- [ ] T022 Ensure GenerateItineraryButton placement in both choice paths within ConditionalTravelStyle

## Phase 3.5: Polish & Validation
- [ ] T023 [P] Add ARIA labels and keyboard navigation support to TravelStyleChoice component
- [ ] T024 [P] Add responsive design breakpoints (mobile, tablet, desktop) to choice buttons

## Dependencies
- Setup (T001-T002) can run in parallel, blocks all tests
- Tests (T003-T008) can run in parallel, must ALL fail before implementation
- Integration tests (T009-T010) require component tests complete
- Type implementation (T011) can run independently after tests
- Component implementation (T012-T018) must be sequential within component
- App.tsx integration (T019-T022) must be sequential
- Polish tasks (T023-T028) can mostly run in parallel after integration

## Parallel Execution Examples

### Phase 3.2 - Component Tests (All Parallel)
```bash
# Launch T003-T008 together:
npm test -- tests/components/TravelStyleChoice.test.tsx --watch
npm test -- tests/components/ConditionalTravelStyle.test.tsx --watch
```

### Phase 3.5 - Polish Tasks (Parallel Group)
```bash
# Launch T023, T024, T025, T026, T028 together:
Task: "Add ARIA labels to TravelStyleChoice component"
Task: "Add responsive breakpoints to choice buttons"
Task: "Performance test choice selection response time"
Task: "Validate bundle size increase"
Task: "Add JSDoc documentation to components"
```

## Task Details

### T003-T008: Component Test Creation
**Key Test Assertions**:
```typescript
// TravelStyleChoice tests
- expect(getByText('I want to add answer more forms to suit my travel style')).toBeInTheDocument()
- expect(getByText('Skip ahead')).toBeInTheDocument()
- expect(container.querySelector('.bg-gradient-to-br')).toBeInTheDocument()
- expect(mockOnChoiceSelect).toHaveBeenCalledWith(TravelStyleChoice.DETAILED)

// ConditionalTravelStyle tests
- expect(getByText('🌏 TRAVEL STYLE')).toBeInTheDocument() // when NOT_SELECTED
- expect(getAllByTestId('travel-form').length).toBe(4) // when DETAILED
- expect(getByTestId('trip-nickname-form')).toBeInTheDocument() // when SKIP
```

### T012-T014: TravelStyleChoice Implementation
**Critical Styling to Match**:
```tsx
// Container must use exact GenerateItineraryButton pattern:
className="bg-gradient-to-br from-[#406170] to-[#2a4552] rounded-[36px] p-8 text-white"

// Buttons must match:
className="bg-white text-primary hover:shadow-2xl hover:shadow-white/30 
           border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]
           rounded-[20px] font-bold font-raleway text-xl
           transition-all duration-300 transform hover:scale-105"
```

### T019-T022: App.tsx Integration Points
**Exact Integration Locations**:
- Line ~30: Add import statements
- Line ~50: Add state declaration
- Line ~124-210: Replace entire section with ConditionalTravelStyle
- Preserve ALL existing props and handlers

## Critical Success Criteria
✅ All tests written and failing before implementation (TDD)
✅ Choice buttons match GenerateItineraryButton styling exactly
✅ All existing forms work unchanged in DETAILED path
✅ SKIP path shows only nickname form
✅ Generate button works identically in both paths
✅ No regression in existing functionality
✅ Bundle size increase < 5KB
✅ Choice selection response < 100ms

## Validation Checklist
*GATE: Checked before tasks completion*

- [ ] All contracts have corresponding tests (T003-T010)
- [ ] All entities have type definitions (T011)  
- [ ] All tests come before implementation (Phase 3.2 → 3.3)
- [ ] Parallel tasks are truly independent ([P] markers verified)
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] App.tsx integration preserves existing functionality
- [ ] Quickstart validation steps executable

## Notes
- [P] tasks can run simultaneously (different files, no dependencies)
- Verify all tests fail before implementing (TDD)
- Commit after each task completion
- Choice buttons MUST use exact GenerateItineraryButton styling template
- All existing form functionality MUST be preserved
- No backward navigation in choice flow (session-persistent)
- Use React Testing Library best practices for all tests
- Follow existing component patterns from codebase

---
**Tasks Generated**: 28 total | **Parallel Opportunities**: 13 tasks | **Estimated Completion**: 6-8 hours following TDD principles