---
description: Generate an actionable, dependency-ordered tasks.md for the feature focused on direct implementation.
---

Given the context provided as an argument, do this:

1. Run `.specify/scripts/powershell/check-task-prerequisites.ps1 -Json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

2. Load and analyze available design documents:

   - Always read plan.md for tech stack and libraries
   - IF EXISTS: Read data-model.md for entities
   - IF EXISTS: Read contracts/ for API endpoints
   - IF EXISTS: Read research.md for technical decisions
   - IF EXISTS: Read implementation-guide.md for implementation scenarios

   Note: Not all projects have all documents. For example:

   - CLI tools might not have contracts/
   - Simple libraries might not need data-model.md
   - Generate tasks based on what's available

3. **Generate tasks following this NEW priority:**

   - **Setup tasks:** Project init, dependencies, linting
   - **Core Implementation tasks:** One per entity, service, CLI command, endpoint. This is the main focus.
   - **Integration tasks:** DB connections, middleware, logging setup
   - **Validation & Polish tasks:** Write unit/integration tests, add documentation, performance checks.

4. **NEW Task Generation Rules:**

   - Each entity in data-model → model _code_ creation task (e.g., `models/User.py`) marked `[P]` if in separate files.
   - Each endpoint → endpoint _implementation_ task (controller, route handler).
   - Each contract file → _implementation_ of the contract logic, not the test.
   - Different implementation files = can be parallel `[P]`.
   - Same file = sequential (no `[P]`).

5. **NEW Order of tasks by dependencies:**

   - Setup before everything
   - **Models and core logic before services and endpoints**
   - Services before endpoints
   - Core implementation before integration
   - **All implementation before validation and polish (tests)**

6. For the "Validation" step of each implementation task, use commands like:

   - `python -m py_compile path/to/file.py` (Check syntax)
   - `node -c path/to/file.js` (Check syntax)
   - `dotnet build` (Check compilation)
   - `curl -X GET http://localhost:8000/docs` (Check if the API comes up)

7. Create FEATURE_DIR/tasks.md with:
   - Correct feature name from implementation plan
   - Numbered tasks (T001, T002, etc.)
   - A clear "Validation" step for each task that checks the **code works**, not that a test passes.
   - A final phase for writing tests and documentation.

Context for task generation: $ARGUMENTS

The tasks.md should be immediately executable for writing application code.
