# Tasks: Trip Details Enhancements

**Input**: Design documents from `/specs/005-update-trip-details/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Feature Context

**Technology Stack**: React 18.3.1 + TypeScript 5.5.3, Tailwind CSS 3.4.1, React Hook Form 7.62.0, Zod 3.25.76
**Project Structure**: Frontend-focused web application
**Scope**: 6 form components, enhanced FormData interface, comprehensive data gathering
**Testing**: Vitest 3.2.4 + React Testing Library 16.3.0 (TDD required)

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup & Type Definitions
- [ ] T001 [P] Extend FormData interface in `src/components/TripDetails/types.ts` with budget mode and selection fields
- [ ] T002 [P] Update Zod schemas in `src/schemas/formSchemas.ts` for enhanced form validation
- [ ] T003 [P] Create TypeScript type definitions for travel style data in `src/types/travel-style-choice.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Component Tests
- [ ] T004 [P] BudgetForm enhanced test in `tests/components/BudgetForm.test.tsx` - budget mode toggle functionality
- [ ] T005 [P] TravelGroupSelector enhanced test in `tests/components/TravelGroupSelector.test.tsx` - specific group names and Other option
- [ ] T006 [P] TravelInterests enhanced test in `tests/components/TravelInterests.test.tsx` - choice name capture and Other option
- [ ] T007 [P] ItineraryInclusions enhanced test in `tests/components/ItineraryInclusions.test.tsx` - all options with preferences and Other
- [ ] T008 [P] TripNickname simplified test in `tests/components/travel-style/TripNickname.test.tsx` - only three fields
- [ ] T009 [P] TravelExperience test in `tests/components/travel-style/TravelExperience.test.tsx` - all option selection capture
- [ ] T010 [P] TripVibe test in `tests/components/travel-style/TripVibe.test.tsx` - Other option with custom text capture
- [ ] T011 [P] SampleDays test in `tests/components/travel-style/SampleDays.test.tsx` - all selection capture
- [ ] T012 [P] DinnerChoice test in `tests/components/travel-style/DinnerChoice.test.tsx` - all selection capture

### Integration Tests
- [ ] T013 [P] TripDetails integration test in `tests/components/TripDetails/TripDetails.integration.test.tsx` - complete form data flow
- [ ] T014 [P] Budget calculation integration test in `tests/components/TripDetails/BudgetCalculation.integration.test.tsx` - mode switching and calculations
- [ ] T015 [P] Form data gathering test in `tests/components/FormDataGathering.integration.test.tsx` - comprehensive data collection

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type System Updates
- [ ] T016 Update FormData interface implementation in `src/components/TripDetails/types.ts`
- [ ] T017 Update form validation schemas in `src/schemas/formSchemas.ts`

### Component Enhancements (Independent Files - Can Run in Parallel)
- [ ] T018 [P] Enhance BudgetForm component in `src/components/TripDetails/BudgetForm.tsx` - add budget mode toggle and calculations
- [ ] T019 [P] Enhance TravelGroupSelector in `src/components/TripDetails/TravelGroupSelector.tsx` - add specific group names and Other option
- [ ] T020 [P] Enhance TravelInterests in `src/components/TripDetails/TravelInterests.tsx` - capture specific choice names and Other option
- [ ] T021 [P] Enhance ItineraryInclusions in `src/components/TripDetails/ItineraryInclusions.tsx` - all options with preferences and Other
- [ ] T022 [P] Simplify TripNickname in `src/components/travel-style/TripNickname.tsx` - reduce to three fields only
- [ ] T023 [P] Update TravelExperience in `src/components/travel-style/TravelExperience.tsx` - ensure all options captured
- [ ] T024 [P] Update TripVibe in `src/components/travel-style/TripVibe.tsx` - ensure Other option captured
- [ ] T025 [P] Update SampleDays in `src/components/travel-style/SampleDays.tsx` - ensure all selections captured
- [ ] T026 [P] Update DinnerChoice in `src/components/travel-style/DinnerChoice.tsx` - ensure all selections captured

### Component Integration
- [ ] T027 Update TripDetails index component in `src/components/TripDetails/index.tsx` - integrate enhanced components
- [ ] T028 Update form data flow and prop passing between components

## Phase 3.4: Data Integration & Validation

### Form Data Management
- [ ] T029 Update form data handling to capture all enhanced selections
- [ ] T030 Implement budget mode calculations and display logic
- [ ] T031 Ensure Other option text capture across all components
- [ ] T032 Validate form data structure matches expected interface

### Selection Constants Updates
- [ ] T033 [P] Verify TRAVEL_GROUPS constant in `src/components/TripDetails/types.ts` includes all group names
- [ ] T034 [P] Verify TRAVEL_INTERESTS constant includes Other option
- [ ] T035 [P] Verify ITINERARY_INCLUSIONS constant includes all options and Other

## Phase 3.5: Testing & Validation

### Component Testing
- [ ] T036 [P] Run BudgetForm tests and verify budget mode functionality
- [ ] T037 [P] Run TravelGroupSelector tests and verify group names and Other option
- [ ] T038 [P] Run TravelInterests tests and verify choice name capture
- [ ] T039 [P] Run ItineraryInclusions tests and verify all options and preferences
- [ ] T040 [P] Run travel style component tests and verify data capture

### Integration Testing
- [ ] T041 Run complete form data flow integration tests
- [ ] T042 Test budget calculations with different traveler counts
- [ ] T043 Test Other option functionality across all components
- [ ] T044 Validate form data structure and completeness

### Manual Testing
- [ ] T045 Execute quickstart guide scenarios for budget mode toggle
- [ ] T046 Execute quickstart guide scenarios for travel group selection
- [ ] T047 Execute quickstart guide scenarios for travel interests
- [ ] T048 Execute quickstart guide scenarios for itinerary inclusions
- [ ] T049 Execute quickstart guide scenarios for travel style forms
- [ ] T050 Execute quickstart guide scenarios for simplified trip nickname form

## Phase 3.6: Polish & Documentation

### Code Quality
- [ ] T051 [P] Review and refactor BudgetForm for code quality and consistency
- [ ] T052 [P] Review and refactor selection components for consistent Other option patterns
- [ ] T053 [P] Review and refactor travel style components for data capture completeness
- [ ] T054 Remove any duplicate code or unused imports

### Documentation Updates
- [ ] T055 [P] Update component documentation for enhanced functionality
- [ ] T056 [P] Update form data interface documentation
- [ ] T057 Verify all changes are documented in README or component comments

### Final Validation
- [ ] T058 Run complete test suite and ensure all tests pass
- [ ] T059 Verify form data visibility in browser developer tools
- [ ] T060 Confirm no AI/LLM integration has been added (as requested)
- [ ] T061 Execute complete quickstart validation guide

## Dependencies

### Critical Dependencies
- **Setup** (T001-T003) must complete before tests
- **Tests** (T004-T015) MUST FAIL before any implementation
- **Implementation** (T016-T028) only after tests are failing
- **Integration** (T029-T035) after core implementation
- **Validation** (T036-T061) after integration complete

### Parallel Execution Groups

**Group 1 - Type Definitions** (can run together):
- T001, T002, T003

**Group 2 - Component Tests** (can run together):
- T004, T005, T006, T007, T008, T009, T010, T011, T012

**Group 3 - Integration Tests** (can run together):
- T013, T014, T015

**Group 4 - Component Implementation** (can run together):
- T018, T019, T020, T021, T022, T023, T024, T025, T026

**Group 5 - Constants Verification** (can run together):
- T033, T034, T035

**Group 6 - Component Testing** (can run together):
- T036, T037, T038, T039, T040

**Group 7 - Code Quality** (can run together):
- T051, T052, T053

**Group 8 - Documentation** (can run together):
- T055, T056

## Parallel Execution Example

```bash
# Group 4 - Component Implementation (Example)
Task: "Enhance BudgetForm component in src/components/TripDetails/BudgetForm.tsx"
Task: "Enhance TravelGroupSelector in src/components/TripDetails/TravelGroupSelector.tsx"
Task: "Enhance TravelInterests in src/components/TripDetails/TravelInterests.tsx"
Task: "Enhance ItineraryInclusions in src/components/TripDetails/ItineraryInclusions.tsx"
Task: "Simplify TripNickname in src/components/travel-style/TripNickname.tsx"
```

## Key Implementation Notes

1. **TDD Compliance**: All tests (T004-T015) must be written and failing before implementation begins
2. **Backward Compatibility**: All changes extend existing interfaces without breaking changes
3. **Other Option Pattern**: Follow TripVibe component pattern for consistent Other option implementation
4. **Budget Calculations**: Use existing switch pattern from budget flexibility toggle
5. **Data Capture**: Ensure all user selections are captured in form data for future AI integration
6. **No AI Integration**: Frontend data gathering focus only, no LLM integration yet

## Validation Checklist

- [ ] All enhanced components have corresponding tests
- [ ] All form data fields are captured and accessible
- [ ] Budget mode toggle works with accurate calculations
- [ ] Other options provide text input and capture custom text
- [ ] Travel style forms capture all user selections
- [ ] Trip nickname form simplified to three fields only
- [ ] Form data structure matches expected interface
- [ ] All tests pass after implementation
- [ ] Quickstart guide scenarios all work correctly
- [ ] No breaking changes to existing functionality

## Success Criteria

✅ **Complete when**:
- All 61 tasks completed successfully
- All tests pass
- Quickstart guide validates successfully  
- Form data comprehensively captures all user selections
- Budget mode toggle works correctly
- Other options work consistently across all components
- Travel style data is completely gathered
- Contact form simplified to essential fields only
- No AI/LLM integration added (as requested)

## Estimated Timeline

- **Phase 3.1**: 1-2 hours (type definitions)
- **Phase 3.2**: 4-6 hours (comprehensive tests)
- **Phase 3.3**: 6-8 hours (component implementation)
- **Phase 3.4**: 2-3 hours (integration)
- **Phase 3.5**: 3-4 hours (testing validation)
- **Phase 3.6**: 2-3 hours (polish)

**Total Estimated Time**: 18-26 hours