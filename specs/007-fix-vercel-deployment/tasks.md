# Tasks: Fix Vercel Deployment Errors

**Input**: Design documents from `/specs/007-fix-vercel-deployment/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: TypeScript 5.x, React 18, LangChain.js, Vite, Vercel Edge Runtime
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `api/` for backend edge functions, `src/` for frontend
- Paths shown below follow Vercel Edge Runtime structure

## Phase 3.1: Setup

- [x] T001 Audit current vercel.json function definitions and count
- [x] T002 Verify TypeScript strict mode configuration in tsconfig.json
- [x] T003 [P] Install contract testing dependencies (if needed)

## Phase 3.2: Tests First (TDD) ✅ COMPLETE - Ready for Phase 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T004 [P] Contract test for providers API in tests/contract/providers-status.test.ts (existing, failing as expected)
- [x] T005 [P] Contract test for build validation API in tests/contract/health-system.test.ts (existing, failing as expected)
- [x] T006 [P] Integration test for TypeScript compilation success in tests/integration/test-typescript-compilation.test.ts
- [x] T007 [P] Integration test for Vercel deployment success in tests/integration/test-vercel-deployment.test.ts
- [x] T008 [P] Integration test for provider status type safety in tests/integration/test-provider-status-types.test.ts
- [x] T009 [P] Integration test for API endpoints functionality in tests/integration/test-api-endpoints.test.ts

## Phase 3.3: Core Implementation ✅ COMPLETE - API Endpoints Implemented

**SUCCESS: All provider fixes applied and API endpoints created. Integration tests passing.**

- [x] T010 [P] Fix ProviderStatus enum usage in api/providers/factory.ts
- [x] T011 [P] Add apiKeyName property to CerebrasConfig in api/providers/cerebras.ts
- [x] T012 [P] Add apiKeyName property to GeminiConfig in api/providers/gemini.ts
- [x] T013 [P] Fix ProviderStatus assignments in api/providers/cerebras.ts
- [x] T014 [P] Fix ProviderStatus assignments in api/providers/gemini.ts
- [x] T015 [P] Fix ProviderStatus assignments in api/providers/groq.ts
- [x] T016 Audit and consolidate Vercel functions in vercel.json (if needed)
- [x] T017 Implement GET /api/health endpoint in api/health.ts
- [x] T018 Implement GET /api/providers/status endpoint in api/providers/status.ts
- [x] T019 Implement POST /api/llm/route endpoint in api/llm/route.ts

## Phase 3.4: Integration

- [ ] T020 Validate provider factory status checking logic
- [ ] T021 Test provider configuration loading with environment variables
- [ ] T022 Verify Vercel Edge Runtime compatibility

## Phase 3.5: Polish

- [ ] T023 [P] Unit tests for ProviderStatus enum validation in tests/unit/test-provider-status.test.ts
- [ ] T024 [P] Unit tests for ProviderConfiguration interface in tests/unit/test-provider-config.test.ts
- [ ] T025 Performance validation for edge function cold starts
- [ ] T026 [P] Update deployment documentation in docs/deployment.md
- [ ] T027 Run quickstart validation scenarios
- [ ] T028 Final Vercel production deployment test

## Dependencies

- Tests (T004-T009) before implementation (T010-T019)
- Provider fixes (T010-T015) before endpoint implementation (T017-T019)
- Function audit (T016) before deployment validation (T028)
- Integration tasks (T020-T022) after core implementation
- Polish tasks (T023-T028) after all implementation complete

## Parallel Example

```
# Launch T004-T005 together (contract tests):
Task: "Contract test for providers API in specs/007-fix-vercel-deployment/contracts/providers-api.test.ts"
Task: "Contract test for build validation API in specs/007-fix-vercel-deployment/contracts/build-validation-api.test.ts"

# Launch T010-T015 together (provider fixes):
Task: "Fix ProviderStatus enum usage in api/providers/factory.ts"
Task: "Add apiKeyName property to CerebrasConfig in api/providers/cerebras.ts"
Task: "Add apiKeyName property to GeminiConfig in api/providers/gemini.ts"
Task: "Fix ProviderStatus assignments in api/providers/cerebras.ts"
Task: "Fix ProviderStatus assignments in api/providers/gemini.ts"
Task: "Fix ProviderStatus assignments in api/providers/groq.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Focus on TypeScript strict mode compliance
- Maintain constitutional compliance throughout

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - ProviderStatus enum fixes → core implementation tasks
3. **From User Stories**:

   - Each quickstart scenario → integration test [P]
   - Deployment validation → final polish task

4. **Ordering**:
   - Setup → Tests → Provider Fixes → Endpoints → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests (providers-api.test.ts, build-validation-api.test.ts)
- [x] All entities have model tasks (ProviderStatus, ProviderConfiguration, VercelFunctionDefinition)
- [x] All tests come before implementation (TDD approach)
- [x] Parallel tasks truly independent (different provider files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task</content>
      <parameter name="filePath">c:\Users\User\Documents\code\hylo\specs\007-fix-vercel-deployment\tasks.md
