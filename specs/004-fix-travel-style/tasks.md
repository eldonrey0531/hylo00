# Tasks: Fix Travel Style Section Styling Issues

**Input**: Design documents from `/specs/004-fix-travel-style/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → SUCCESS: Implementation plan loaded with React + TypeScript tech stack
   → Extract: Tailwind CSS 3.4.1, Vitest 3.2.4, React Testing Library 16.3.0
2. Load optional design documents:
   → data-model.md: 3 entities (TravelStyleSection, TravelStyleForm, GenerateButton)
   → contracts/: 3 contract files → 3 contract test tasks
   → research.md: Design token decisions → setup validation
3. Generate tasks by category:
   → Setup: background color validation setup
   → Tests: 3 contract tests, 4 integration tests
   → Core: ConditionalTravelStyle styling, form preservation, button cleanup
   → Integration: App.tsx integration, full flow validation
   → Polish: visual regression tests, manual testing
4. Apply task rules:
   → Different test files = mark [P] for parallel
   → ConditionalTravelStyle modifications = sequential (same file)
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All 3 contracts have tests ✅
   → All styling entities addressed ✅
   → All visual requirements covered ✅
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: React frontend with TypeScript at repository root
- Paths: `src/components/`, `tests/components/`
- Existing components to modify rather than create new ones

## Phase 3.1: Setup


## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T011 Add bg-trip-details container wrapper to ConditionalTravelStyle component in src/components/ConditionalTravelStyle.tsx
- [ ] T012 Update travel style header text styling to use text-primary in src/components/ConditionalTravelStyle.tsx
- [ ] T013 Ensure form background preservation across all travel style forms in src/components/ConditionalTravelStyle.tsx
- [ ] T014 Remove any GenerateItineraryButton instances from ConditionalTravelStyle component render methods
- [ ] T015 Validate App.tsx GenerateItineraryButton placement and prevent duplication in src/App.tsx
- [ ] T016 Add proper rounded corners and padding to travel style container styling
- [ ] T017 Audit and remove any #406170 background usage in travel style components

## Phase 3.4: Integration
- [ ] T018 Test ConditionalTravelStyle integration with App.tsx styling consistency
- [ ] T019 Verify travel style background matches trip details section styling
- [ ] T020 Validate form styling preservation in DETAILED and SKIP states
- [ ] T021 Test button duplication prevention across all travel style states

## Phase 3.5: Polish
- [ ] T025 [P] Update component documentation with new styling requirements

## Dependencies
- Setup (T001-T003) before all tests
- Tests (T004-T010) before implementation (T011-T017)
- T011 blocks T012, T013 (same file modifications)
- T014 blocks T015 (button cleanup coordination)
- Core implementation before integration (T018-T022)
- Integration before polish (T023-T027)

## Parallel Example


## Critical Styling Requirements
- **MUST**: Travel style section uses bg-trip-details (#b0c29b) background
- **MUST**: All forms preserve bg-form-box (#ece8de) backgrounds
- **MUST NOT**: Any #406170 backgrounds in travel style content areas
- **MUST**: Exactly one GenerateItineraryButton per page
- **MUST**: Background consistency across NOT_SELECTED, DETAILED, SKIP states

## Task Generation Rules Applied

1. **From Contracts** (3 files):
   - container-styling.md → T004 (container styling tests)
   - form-background-preservation.md → T005 (form background tests)
   - button-duplication-prevention.md → T006 (button duplication tests)
   
2. **From Data Model** (3 entities):
   - TravelStyleSection → T011-T012 (container styling implementation)
   - TravelStyleForm → T013 (form preservation implementation)
   - GenerateButton → T014-T015 (button cleanup implementation)
   
3. **From User Stories** (4 acceptance scenarios):
   - Initial state → T007 (visual integration tests)
   - Choice interactions → T008 (background hierarchy tests)
   - Color exclusion → T009 (color exclusion tests)
   - Complete flow → T010 (flow styling tests)

4. **Ordering Applied**:
   - Setup → Tests → Implementation → Integration → Polish
   - TDD: All tests (T004-T010) before implementation (T011-T017)
   - Sequential: ConditionalTravelStyle modifications (T011-T013)
   - Parallel: Independent test files and documentation tasks

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T004-T006)
- [x] All entities have implementation tasks (T011-T015)
- [x] All tests come before implementation (T004-T010 before T011-T017)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Critical requirement (#406170 exclusion) has dedicated test (T009)
- [x] Visual validation covered (quickstart integration via T026)

## Notes
- [P] tasks = different files, no dependencies between them
- Verify all styling tests fail before implementing fixes
- Commit after each task for clear progress tracking
- Focus on preserving existing functionality while fixing styling
- Use browser dev tools to validate computed CSS values during testing