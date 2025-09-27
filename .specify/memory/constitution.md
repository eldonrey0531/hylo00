<!-- Sync Impact Report
Version change: 1.5.0 → 1.6.0
List of modified principles: Source Root Governance → Source Root Governance (expanded refactor guidance), Development Workflow Discipline → Development Workflow Discipline (config sync checks)
Added sections: Configuration & Documentation Sync principle
Removed sections: None
Templates requiring updates: plan-template.md (✅ updated), tasks-template.md (✅ updated), spec-template.md (✅ no changes required)
Follow-up TODOs: None
-->
# Hylo00 Constitution

## Core Principles

### Next.js App Router Delivery
Build and render the user experience with Next.js 14 App Router, favoring static generation or cached ISR responses for all marketing and itinerary flows.

Rationale: Aligns the project with the framework the site is deployed on, keeps routing consistent, and preserves fast, SEO-friendly delivery.

### Type-Safe React Interfaces
Implement UI logic with React 18 and TypeScript, keeping components strongly typed and colocated with their form contracts.

Rationale: Type safety improves maintainability, reduces runtime errors, and matches the patterns expected by the forms, hooks, and tests in this repository.

### Tailwind-Centric Styling
Style the application exclusively with Tailwind CSS utilities and configuration defined in `tailwind.config.js`.

Rationale: Tailwind underpins the design system in this project, enabling rapid iteration while guaranteeing consistent primitives across the UI.

### Form and Validation Tooling
Use React Hook Form together with Zod schemas for all user-input workflows, keeping validation logic in shared schema files.

Rationale: The existing forms depend on these libraries for declarative validation and error handling, ensuring a predictable user experience.

### Dependency Governance
Rely on the dependencies already declared in `package.json`. Add or upgrade packages only with explicit user approval and corresponding updates to lockfiles.

Rationale: Preserves a controlled surface area, keeps deployments reproducible, and avoids unreviewed transitive changes.

### Deployment on Vercel
Deploy production builds via Vercel, leveraging its integration with Next.js and edge middleware support.

Rationale: Vercel provides zero-config hosting for Next.js, ensuring the middleware and ISR behavior match local expectations.

### Source Root Governance
Keep all application code, middleware, workflows, shared libraries, and types inside the `/src` directory, following the structure documented below. Refactors within `src/` are encouraged when they preserve this hierarchy and immediately update configuration globs, path aliases, and documentation.

Rationale: A consistent source root simplifies imports, enforces aliasing conventions, and ensures middleware executes correctly in the App Router while allowing iterative improvements.

### Configuration & Documentation Sync
Whenever directories or filenames move, immediately update dependent configuration (e.g., `tsconfig.json` paths, ESLint/Tailwind globs, Next.js route aliases) and refresh relevant documentation so code remains discoverable.

Rationale: Keeping configuration and docs aligned with the source tree prevents broken builds, dangling imports, and onboarding friction after refactors.

### Development Workflow Discipline
Use the provided npm scripts (`dev`, `build`, `lint`, `test`, `type-check`) along with Vitest and Playwright to validate changes before merge. Run `npm run lint` and `npm run type-check` after any structural adjustments to confirm configuration updates keep modules resolvable.

Rationale: These workflows maintain quality gates, keep automation green, and align with the repository's testing and linting investments.

### Context-Aware Research
When gathering implementation references, use the Context7 MCP server to source canonical library documentation and examples.

Rationale: Centralizing research through Context7 ensures the team references up-to-date, authoritative material and avoids stale guidance.

## Technology Stack
Adopt the stack codified in the repository:
- Next.js 14 (App Router) with React 18
- TypeScript for static typing
- Tailwind CSS for styling primitives
- React Hook Form and Zod for forms and validation
- Vitest for unit and integration tests, Playwright for end-to-end flows
- ESLint for linting and Vercel for deployment automation

## Project Structure

```
hylo00/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   ├── inngest/
│   │   │   ├── itinerary/
│   │   │   ├── logs/
│   │   │   └── maps/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── forms/
│   │   │   ├── travel-style/
│   │   │   └── TripDetails/
│   │   └── layout/
│   ├── inngest/
│   │   ├── client.ts
│   │   └── functions/
│   │       └── itinerary.ts
│   ├── lib/
│   │   ├── ai/
│   │   ├── config/
│   │   ├── redis/
│   │   ├── vector/
│   │   └── formSchemas.ts
│   ├── middleware.ts             # Next.js middleware (src root)
│   ├── types/
│   └── utils/
├── public/
│   ├── fonts/
│   └── images/
├── scripts/
├── specs/
├── tests/
├── .specify/
├── manual-validation/
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

### Structure Enforcement Rules
- **Source Root**: Application code MUST live under `src/`; only configuration, specs, scripts, tests, public assets, and tooling live at the repository root.
- **Routing**: App Router routes and API handlers MUST reside in `src/app`, using folders for each API namespace (`ai`, `inngest`, `itinerary`, `logs`, `maps`).
- **UI Components**: Reusable UI lives in `src/components`, with form flows under `forms/` and shared shells under `layout/`.
- **Workflows**: Inngest workflows and registration MUST remain in `src/inngest/functions`, with the shared client in `src/inngest/client.ts`.
- **Shared Libraries**: Configuration, AI helpers, Redis/vector clients, and schemas MUST stay in `src/lib`.
- **Middleware**: `src/middleware.ts` is the single middleware entry point and MUST not move.
- **Types & Utilities**: Global TypeScript definitions belong in `src/types`, and cross-cutting helpers in `src/utils`.
- **Assets**: Static assets live in `public/` with fonts and images in dedicated subdirectories.
- **Quality Assets**: Tests go in `tests/`, manual QA artifacts in `manual-validation/`, and automation specs in `specs/`.
- **Configuration**: Next.js, Tailwind, TypeScript, ESLint, Vercel, and PostCSS configs remain at the repository root.

## Development Workflow
Use the established npm scripts:
- `npm run dev` for local development
- `npm run build` for production builds (must succeed prior to deployment)
- `npm run start` for production preview
- `npm run lint`, `npm run test`, and `npm run test:coverage` to enforce quality gates
- `npm run type-check` to validate TypeScript contracts

Ensure Vitest, Playwright, ESLint, and TypeScript checks all pass before merging, especially after refactors that touch configuration. Reference Context7 MCP for implementation research, and document architectural decisions in `specs/` when altering workflows or AI integrations.

## Governance
Amendments require a pull request, reviewer approval, and updates to impacted templates. Versioning follows semantic rules: major for breaking governance shifts, minor for new or materially expanded principles, patch for clarifications. Code reviews must confirm structure compliance, dependency governance, and passing quality gates. Conduct at least annual audits to reaffirm adherence.

**Version**: 1.6.0 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-27