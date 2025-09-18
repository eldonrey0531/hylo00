# Tasks: Fix White Border and Preference Component Styling Issues

**Input**: Design documents from `/specs/002-fix-white-border/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: TypeScript 5.5.3, React 18.3.1, Tailwind CSS 3.4.1
   → Testing: Vitest 3.2.4 + React Testing Library 16.3.0
   → Structure: Web application (frontend components)
2. Load optional design documents ✓
   → data-model.md: PreferenceComponent entities
   → contracts/: Header, Grid, Placeholder, Text contracts  
   → research.md: Tailwind patterns, placeholder behavior
3. Generate tasks by category ✓
4. Apply task rules ✓
5. Number tasks sequentially ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: `src/components/`, `tests/components/`
- **React components**: `.tsx` files with corresponding `.test.tsx`
- **Existing structure**: Building on previous UI improvements

## Phase 3.1: Setup

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Header Text Implementation
- [ ] T014 Update header text from "ITINERARY INCLUSIONS" to "What Should We Include in Your Itinerary?" in `src/components/TripDetails/ItineraryInclusions.tsx`

### Full-Width Header Implementation
- [ ] T015 [P] Implement full-width header styling for AccommodationPreferences in `src/components/TripDetails/PreferenceModals/AccommodationPreferences.tsx`
- [ ] T016 [P] Implement full-width header styling for RentalCarPreferences in `src/components/TripDetails/PreferenceModals/RentalCarPreferences.tsx`  
- [ ] T017 [P] Implement full-width header styling for FlightPreferences in `src/components/TripDetails/PreferenceModals/FlightPreferences.tsx`

### Grid Layout Implementation
- [ ] T018 Implement 2x2 grid layout for AccommodationPreferences options in `src/components/TripDetails/PreferenceModals/AccommodationPreferences.tsx`
- [ ] T019 Implement 2x2 grid layout for RentalCarPreferences options in `src/components/TripDetails/PreferenceModals/RentalCarPreferences.tsx`

### Placeholder Behavior Implementation
- [ ] T020 Implement non-editable placeholder behavior for AccommodationPreferences "Other" field in `src/components/TripDetails/PreferenceModals/AccommodationPreferences.tsx`

## Phase 3.4: Integration & Refinement
- [ ] T021 Verify header styling consistency across all preference components
- [ ] T022 Adjust content spacing and padding for optimal visual hierarchy
- [ ] T023 Ensure accessibility compliance for all styling changes

## Phase 3.5: Polish
- [ ] T029 Update documentation and quickstart validation scenarios
- [ ] T030 Clean up any temporary styling classes or unused code

## Dependencies
- Tests (T004-T013) MUST be completed and FAILING before implementation (T014-T020)
- T014 (header text) can run independently
- T015-T017 (header styling) can run in parallel
- T018-T019 (grid layout) depend on header styling completion for context
- T020 (placeholder) can run independently after T018
- Integration (T021-T024) requires all core implementation complete
- Polish (T025-T030) requires all previous phases complete

## Parallel Execution Examples

### Phase 3.2 - Contract Tests (All Parallel)
```bash
# Launch T004-T010 together:
Task: "Contract test for header text change in tests/components/TripDetails/ItineraryInclusions.test.tsx"
Task: "Contract test for AccommodationPreferences full-width header"
Task: "Contract test for RentalCarPreferences full-width header"
Task: "Contract test for FlightPreferences full-width header"
Task: "Contract test for AccommodationPreferences 2x2 grid layout"
Task: "Contract test for RentalCarPreferences 2x2 grid layout"
Task: "Contract test for non-editable placeholder in AccommodationPreferences"
```

### Phase 3.2 - Integration Tests (All Parallel)  
```bash
# Launch T011-T013 together:
Task: "Integration test for header text display scenario"
Task: "Integration test for header styling consistency"
Task: "Integration test for grid layout responsiveness"
```

### Phase 3.3 - Header Styling (Parallel Group)
```bash
# Launch T015-T017 together:
Task: "Implement full-width header styling for AccommodationPreferences"
Task: "Implement full-width header styling for RentalCarPreferences"
Task: "Implement full-width header styling for FlightPreferences"
```

### Phase 3.5 - Polish Tasks (Parallel Group)
```bash
# Launch T025-T028 together:
Task: "Add comprehensive component unit tests for styling edge cases"
Task: "Performance validation: ensure styling changes don't impact render times"
Task: "Cross-browser compatibility testing"
Task: "Visual regression test coverage for all modified components"
```

## Validation Checkpoints

### After Phase 3.2 (Tests)
- [ ] All tests are written and FAILING
- [ ] Test coverage includes all contract requirements
- [ ] Integration tests cover user scenarios from quickstart.md

### After Phase 3.3 (Implementation)
- [ ] All tests are now PASSING
- [ ] Header text displays correct content
- [ ] Headers are full-width without rounded corners
- [ ] Grid layouts show 2x2 arrangement
- [ ] Placeholder behavior works as specified

### After Phase 3.4 (Integration)
- [ ] Visual consistency across all components
- [ ] Proper spacing and alignment maintained
- [ ] Accessibility standards met
- [ ] Responsive design functional

### After Phase 3.5 (Polish)
- [ ] Performance benchmarks met (<2s load, <100ms render)
- [ ] Cross-browser compatibility verified
- [ ] Documentation updated
- [ ] Code quality standards maintained

## Notes
- [P] tasks target different files with no dependencies
- Follow TDD strictly: tests must fail before implementation
- Commit after each completed task
- Test all changes in development environment before proceeding
- Maintain existing functionality while implementing styling improvements
- Use existing Tailwind design tokens and classes where possible

## File Path Reference
```
src/components/TripDetails/
├── ItineraryInclusions.tsx                    # T014 - Header text change
└── PreferenceModals/
    ├── AccommodationPreferences.tsx           # T015, T018, T020 - Styling changes
    ├── RentalCarPreferences.tsx              # T016, T019 - Styling changes
    └── FlightPreferences.tsx                 # T017 - Header styling only

tests/components/TripDetails/
├── ItineraryInclusions.test.tsx              # T004, T011 - Header text tests
└── PreferenceModals/
    ├── AccommodationPreferences.test.tsx     # T005, T008, T010 - Component tests
    ├── RentalCarPreferences.test.tsx         # T006, T009 - Component tests
    └── FlightPreferences.test.tsx            # T007 - Header tests
```