# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
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
- **Next.js App**: `src/app/` for routes, `src/components/` for UI, `src/lib/` for shared utilities, `src/types/` for TypeScript types, `src/utils/` for helpers
- **Testing**: `tests/` with subdirs `contract/`, `integration/`, `unit/` using Vitest (.test.ts files)
- **Scripts**: `scripts/` for CLI tools
- Paths shown below assume Next.js App Router - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test POST /api/users in tests/contract/test_users_post.test.ts
- [ ] T005 [P] Contract test GET /api/users/{id} in tests/contract/test_users_get.test.ts
- [ ] T006 [P] Integration test user registration in tests/integration/test_registration.test.ts
- [ ] T007 [P] Integration test auth flow in tests/integration/test_auth.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T008 [P] User type in src/types/user.ts
- [ ] T009 [P] UserService CRUD in src/lib/userService.ts
- [ ] T010 [P] CLI --create-user in scripts/user-commands.ts
- [ ] T011 POST /api/users route in src/app/api/users/route.ts
- [ ] T012 GET /api/users/[id]/route.ts endpoint in src/app/api/users/[id]/route.ts
- [ ] T013 Input validation with Zod
- [ ] T014 Error handling and logging

## Phase 3.4: Integration
- [ ] T015 Connect UserService to data storage
- [ ] T016 Auth middleware in src/middleware.ts
- [ ] T017 Request/response logging
- [ ] T018 CORS and security headers

## Phase 3.5: Polish
- [ ] T019 [P] Unit tests for validation in tests/unit/test_validation.test.ts
- [ ] T020 Performance tests (<200ms)
- [ ] T021 [P] Update docs/api.md
- [ ] T022 Remove duplication
- [ ] T023 Run manual-testing.md

## Dependencies
- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.test.ts"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.test.ts"
Task: "Integration test registration in tests/integration/test_registration.test.ts"
Task: "Integration test auth in tests/integration/test_auth.test.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Include explicit tasks to update configuration globs (tsconfig paths, ESLint/Tailwind, Next.js route aliases) and documentation whenever files move

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task