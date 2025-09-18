---
description: Create a technical blueprint for implementation. Execute the planning workflow to generate design artifacts that guide coding.
---

Given the implementation details provided as an argument, do this:

1. Run `.specify/scripts/powershell/setup-plan.ps1 -Json` from the repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. All future file paths must be absolute.
2. Read and analyze the feature specification to understand:

   - The feature requirements and user stories
   - Functional and non-functional requirements
   - Success criteria and acceptance criteria
   - Any technical constraints or dependencies mentioned

3. Read the constitution at `.specify/memory/constitution.md` to understand constitutional requirements.

4. **Execute the implementation plan template with a NEW focus:**

   - Load `.specify/templates/plan-template.md` (already copied to IMPL_PLAN path)
   - Set Input path to FEATURE_SPEC
   - Run the Execution Flow (main) function steps 1-9
   - The template is self-contained and executable
   - Follow error handling and gate checks as specified
   - **The goal of the template is to create a blueprint for writing code, not tests.**
   - Let the template guide artifact generation in $SPECS_DIR:
     - **Phase 0 (Research):** `research.md` should focus on implementation choices (e.g., "which ORM is best for this?"), not testing frameworks
     - **Phase 1 (Core Design):** Generate `data-model.md` and `contracts/` to define the structure of the code to be written (e.g., what models and API endpoints need to be created)
     - **Phase 2 (Implementation Planning):** Generate `tasks.md` focused on the direct implementation workflow
   - **Specifically, DO NOT prioritize the creation of `implementation-guide.md` if it is solely for test scenarios.** If it's useful for understanding user flow, it can remain, but it is not the primary goal.
   - Incorporate user-provided details from arguments into Technical Context: $ARGUMENTS
   - Update Progress Tracking as you complete each phase

5. Verify execution completed:

   - Check Progress Tracking shows all phases complete
   - Ensure all required artifacts were generated
   - Confirm no ERROR states in execution

6. Report results with branch name, file paths, and generated artifacts.

Use absolute paths with the repository root for all file operations to avoid path issues.
