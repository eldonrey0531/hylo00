# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model implementation tasks
   → contracts/: Each file → endpoint implementation task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, configuration
   → Core Implementation: models, services, components, endpoints
   → Integration: DB connections, middleware, form integration
   → Validation & Polish: tests, documentation, performance
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Implementation before tests
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All entities have implementation tasks?
   → All endpoints have implementation tasks?
   → Core implementation before integration?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths and validation methods in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Install dependencies from package.json/requirements.txt
- [ ] T003 Configure linting and formatting rules

## Phase 3.2: Core Implementation

- [ ] T004 [P] Implement [Entity1] model in src/models/entity1.js
  - **Validation**: `node -c src/models/entity1.js`
- [ ] T005 [P] Implement [Entity2] model in src/models/entity2.js
  - **Validation**: `node -c src/models/entity2.js`
- [ ] T006 Implement [Service1] in src/services/service1.js
  - **Validation**: `node -c src/services/service1.js`
- [ ] T007 Implement [Component1] in src/components/Component1.jsx
  - **Validation**: `npm run build` (check compilation)

## Phase 3.3: Integration

- [ ] T008 Integrate [Component1] with existing forms
  - **Validation**: `npm start` and manual UI check
- [ ] T009 Connect services to database/APIs
  - **Validation**: `curl -X GET http://localhost:3000/api/health`

## Phase 3.4: Validation & Polish

- [ ] T010 [P] Write unit tests for models in tests/models/
  - **Validation**: `npm test -- --testPathPattern=models`
- [ ] T011 [P] Write integration tests in tests/integration/
  - **Validation**: `npm test -- --testPathPattern=integration`
- [ ] T012 Performance optimization and documentation
  - **Validation**: Bundle size check, performance metrics

## Parallel Execution Examples

```bash
# Run core implementation tasks in parallel
Task: "T004 - Implement Entity1 model"
Task: "T005 - Implement Entity2 model"
# These can run together since they're different files

# Run validation tasks in parallel
Task: "T010 - Unit tests for models"
Task: "T011 - Integration tests"
# These can run together since they're different test suites
```

## Notes

- [P] tasks = different files, no dependencies
- Focus on implementing working code first, validate with compilation and runtime checks
- Write tests after core implementation is complete
- Commit after each task or logical group of tasks
- Avoid vague tasks; each task should specify exact file paths and validation methods

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → endpoint implementation task
   - Each endpoint → validation task (runtime check)
2. **From Data Model**:
   - Each entity → model implementation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:
   - Each story → integration implementation task
   - Quickstart scenarios → validation tasks (post-implementation)
4. **Ordering**:
   - Setup → Core Implementation → Integration → Validation & Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All entities have model implementation tasks
- [ ] All endpoints have implementation tasks
- [ ] Core implementation tasks come before integration tasks
- [ ] Validation & polish tasks come after implementation
- [ ] Parallel tasks truly independent (different files)
- [ ] Each task specifies exact file path and validation method
- [ ] No task modifies same file as another [P] task
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T004 [P] Contract test POST /api/users in tests/contract/test_users_post.py
- [ ] T005 [P] Contract test GET /api/users/{id} in tests/contract/test_users_get.py
- [ ] T006 [P] Integration test user registration in tests/integration/test_registration.py
- [ ] T007 [P] Integration test auth flow in tests/integration/test_auth.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T008 [P] User model in src/models/user.py
- [ ] T009 [P] UserService CRUD in src/services/user_service.py
- [ ] T010 [P] CLI --create-user in src/cli/user_commands.py
- [ ] T011 POST /api/users endpoint
- [ ] T012 GET /api/users/{id} endpoint
- [ ] T013 Input validation
- [ ] T014 Error handling and logging

## Phase 3.4: Integration

- [ ] T015 Connect UserService to DB
- [ ] T016 Auth middleware
- [ ] T017 Request/response logging
- [ ] T018 CORS and security headers

## Phase 3.5: Polish

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
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

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

_GATE: Checked by main() before returning_

- [ ] All entities have model implementation tasks
- [ ] All endpoints have implementation tasks
- [ ] Core implementation tasks come before integration tasks
- [ ] Validation & polish tasks come after implementation
- [ ] Parallel tasks truly independent (different files)
- [ ] Each task specifies exact file path and validation method
- [ ] No task modifies same file as another [P] task
