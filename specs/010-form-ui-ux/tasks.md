# Tasks: Form UI/UX Optimization & Categorization

**Input**: Design documents from `/specs/010-form-ui-ux/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   ✓ Implementation plan loaded - React/TypeScript form optimizations
   ✓ Tech stack: React 18, TypeScript 5.x, Vite, Vitest, Playwright
2. Load optional design documents:
   ✓ data-model.md: DateSectionState, BudgetDisplayState, FormCategory entities
   ✓ contracts/: TripDetailsForm, FormCategoryWrapper component contracts
   ✓ research.md: Current implementation analysis and technical decisions
   ✓ quickstart.md: Test scenarios for flexible dates, budget slider, categorization
3. Generate tasks by category:
   ✓ Setup: TypeScript interfaces, test configuration
   ✓ Tests: Component behavior tests, integration tests
   ✓ Core: Enhanced form components, category wrapper
   ✓ Integration: App.tsx reorganization, state management
   ✓ Polish: Accessibility, performance validation
4. Apply task rules:
   ✓ Different components = mark [P] for parallel
   ✓ Same component = sequential (no [P])
   ✓ Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   ✓ All contracts have tests
   ✓ All entities have implementations
   ✓ All user scenarios covered
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **React frontend**: `src/components/`, `src/types/`, `tests/` at repository root
- **Testing**: `tests/unit/`, `tests/e2e/`, `tests/integration/`
- Paths assume React frontend structure per plan.md

## Phase 3.1: Setup

- [ ] **T001** Create TypeScript interfaces for enhanced form state in `src/types/form-ui-enhancements.ts`
- [ ] **T002** [P] Configure test utilities for form component testing in `tests/utils/form-test-helpers.ts`
- [ ] **T003** [P] Set up Playwright test configuration for form interactions in `tests/e2e/setup.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Component Contract Tests

- [ ] **T004** [P] Contract test for TripDetailsForm flexible dates behavior in `tests/unit/TripDetailsForm-flexible-dates.test.tsx`
- [ ] **T005** [P] Contract test for TripDetailsForm budget mode indicator in `tests/unit/TripDetailsForm-budget-indicator.test.tsx`
- [ ] **T006** [P] Contract test for TripDetailsForm budget slider synchronization in `tests/unit/TripDetailsForm-budget-slider.test.tsx`
- [ ] **T007** [P] Contract test for FormCategoryWrapper component behavior in `tests/unit/FormCategoryWrapper.test.tsx`

### Integration Test Scenarios

- [ ] **T008** [P] Integration test for flexible dates workflow (quickstart scenario 1) in `tests/integration/flexible-dates-workflow.test.tsx`
- [ ] **T009** [P] Integration test for budget mode & slider workflow (quickstart scenario 2) in `tests/integration/budget-workflow.test.tsx`
- [ ] **T010** [P] Integration test for form category navigation (quickstart scenario 3) in `tests/integration/form-categorization.test.tsx`

### End-to-End Test Scenarios

- [ ] **T011** [P] E2E test for complete form categorization flow in `tests/e2e/form-categories.spec.ts`
- [ ] **T012** [P] E2E test for performance validation (slider real-time updates) in `tests/e2e/performance-validation.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions & Interfaces

- [ ] **T013** [P] Implement DateSectionState interface and utilities in `src/types/form-ui-enhancements.ts`
- [ ] **T014** [P] Implement BudgetDisplayState interface and utilities in `src/types/form-ui-enhancements.ts`
- [ ] **T015** [P] Implement FormCategory and related interfaces in `src/types/form-ui-enhancements.ts`

### Form Component Enhancements

- [ ] **T016** Enhance TripDetailsForm with flexible date labels (lines 442-476) in `src/components/TripDetailsForm.tsx`
- [ ] **T017** Add budget mode indicator to TripDetailsForm (lines 759-790) in `src/components/TripDetailsForm.tsx`
- [ ] **T018** Implement real-time budget slider synchronization in `src/components/TripDetailsForm.tsx`
- [ ] **T019** [P] Create FormCategoryWrapper component in `src/components/FormCategoryWrapper.tsx`

### State Management Enhancements

- [ ] **T020** [P] Create form UI state management utilities in `src/utils/form-ui-state.ts`
- [ ] **T021** [P] Implement form category configuration constants in `src/constants/form-categories.ts`

## Phase 3.4: Integration

### App Structure Reorganization

- [ ] **T022** Reorganize App.tsx to use form categorization structure (lines 97-160) in `src/App.tsx`
- [ ] **T023** Integrate FormCategoryWrapper with existing form components in `src/App.tsx`
- [ ] **T024** Implement form category navigation and state management in `src/App.tsx`

### Component Integration

- [ ] **T025** Update form data flow to support enhanced UI state in `src/App.tsx`
- [ ] **T026** [P] Add form validation integration for categorized structure in `src/utils/form-validation.ts`
- [ ] **T027** [P] Implement local storage persistence for UI state in `src/utils/form-persistence.ts`

## Phase 3.5: Polish

### Testing & Validation

- [ ] **T028** [P] Add accessibility tests for enhanced form components in `tests/accessibility/form-a11y.test.ts`
- [ ] **T029** [P] Performance testing for budget slider (<50ms target) in `tests/performance/slider-performance.test.ts`
- [ ] **T030** [P] Visual regression tests for form categorization in `tests/visual/form-categories.test.ts`

### Documentation & Cleanup

- [ ] **T031** [P] Update component documentation for TripDetailsForm enhancements in `src/components/TripDetailsForm.tsx`
- [ ] **T032** [P] Create form categorization usage examples in `docs/form-categorization-examples.md`
- [ ] **T033** [P] Update TypeScript strict mode compliance across all enhanced components

### Final Validation

- [ ] **T034** Execute quickstart manual testing scenarios for all three issues
- [ ] **T035** Run comprehensive test suite and validate all acceptance criteria
- [ ] **T036** [P] Performance audit and accessibility compliance check

## Parallel Execution Examples

### Phase 3.2 (Tests) - Can run simultaneously:

```bash
# All contract tests (T004-T007)
Task T004: Component contract test for flexible dates
Task T005: Component contract test for budget indicator
Task T006: Component contract test for budget slider
Task T007: Component contract test for category wrapper

# All integration tests (T008-T010)
Task T008: Integration test flexible dates workflow
Task T009: Integration test budget workflow
Task T010: Integration test categorization workflow
```

### Phase 3.3 (Core) - Type definitions can run in parallel:

```bash
# Type definitions (T013-T015)
Task T013: DateSectionState interface
Task T014: BudgetDisplayState interface
Task T015: FormCategory interfaces

# After T016-T018 complete TripDetailsForm:
Task T019: FormCategoryWrapper component
Task T020: UI state utilities
Task T021: Category configuration
```

### Phase 3.5 (Polish) - Most tasks can run in parallel:

```bash
# Testing & validation (T028-T030)
Task T028: Accessibility tests
Task T029: Performance tests
Task T030: Visual regression tests

# Documentation (T031-T033)
Task T031: Component documentation
Task T032: Usage examples
Task T033: TypeScript compliance
```

## Success Criteria

**After T035 completion, verify**:

- [ ] Flexible dates toggle shows contextual labels ("Trip Start", "Duration")
- [ ] Budget mode indicator appears above money amount
- [ ] Budget slider updates display in real-time (<50ms)
- [ ] Form is organized into "Trip Details" and "Travel Style" categories
- [ ] All existing functionality preserved
- [ ] Performance targets met
- [ ] Accessibility standards maintained

## Dependencies

- **T001-T003** must complete before any other tasks
- **T004-T012** (all tests) must complete and FAIL before T013+
- **T013-T015** (types) must complete before T016-T021
- **T016-T018** (TripDetailsForm) must complete before T022-T024
- **T022-T024** (App integration) must complete before T025-T027
- **T025-T027** must complete before T028+
- **T034-T035** must be final validation tasks

---

**Tasks Ready**: 36 numbered tasks with clear dependencies and parallel execution guidance
