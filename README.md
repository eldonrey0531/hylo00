# Hylo00

A Next.js static site application for travel planning and itinerary generation, deployed on Vercel.

## Features

- Interactive travel style selection
- Trip details form (dates, budget, travelers, location)
- Travel interests and preferences
- Accommodation, flight, and rental car preferences
- Itinerary inclusions and sample days
- Travel experience and trip vibe selection
- Validation and conditional forms

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest (unit/integration), Playwright (e2e)
- **Linting**: ESLint
- **Deployment**: Vercel

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

We keep app code grouped alongside the App Router, components, utilities, and Inngest workflows. The project currently lives at the repository root, but it can be wrapped in a `/src` directory if you prefer to isolate application code from configuration files.

```
my-next-app/
├── .env.local               # Local environment variables (never commit)
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore rules
├── .next/                   # ⚡ Auto-generated Next.js build output
├── node_modules/            # ⚡ Installed dependencies
├── next-env.d.ts            # ⚡ Next.js TypeScript declarations
├── next.config.js           # Next.js configuration (use .mjs if you prefer ESM)
├── package.json             # Project metadata and scripts
├── package-lock.json        # Resolved dependency tree
├── postcss.config.js        # PostCSS configuration
├── public/                  # Static assets served by Next.js
│   ├── favicon.ico
│   └── og-image.png
├── README.md                # Project documentation
├── src/                     # Optional source root for application code
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   └── dashboard/page.tsx
│   │   ├── api/inngest/route.ts   # Inngest API endpoint handler
│   │   ├── _components/Header.tsx # Route-level components
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   └── common/ThemeProvider.tsx
│   ├── features/
│   │   ├── posts/
│   │   │   ├── components/PostCard.tsx
│   │   │   └── api.ts
│   │   └── profile/
│   │       ├── components/ProfileForm.tsx
│   │       └── useProfile.ts
│   ├── hooks/                # Custom React hooks
│   ├── inngest/
│   │   ├── client.ts
│   │   └── functions/
│   │       ├── sendEmail.ts
│   │       └── userCreated.ts
│   ├── lib/
│   │   ├── inngest.ts        # Central Inngest client helpers
│   │   └── utils.ts
│   ├── middleware.ts         # Next.js middleware
│   └── types/                # Shared TypeScript types
└── tsconfig.json            # TypeScript compiler options
```

If you prefer not to use `/src`, lift `app/`, `components/`, `features/`, `inngest/`, `lib/`, etc. directly to the repository root while keeping configuration files (`next.config.js`, `package.json`, `tsconfig.json`, `.env*`, `postcss.config.js`, `tailwind.config.js`, `middleware.ts`) and `public/` at the top level.

## Inngest Workflow Structure

- **Inngest client:** Keep the shared client factory in `src/lib/inngest.ts` (or `lib/inngest.ts` if you don’t use `/src`). Workflow files import the resulting helpers rather than creating their own clients.
- **Functions:** Place each workflow in `src/inngest/functions/*` (e.g., `sendEmail.ts`, `userCreated.ts`). An optional `index.ts` can re-export all functions for easy registration.
- **Events:** When you define custom events, colocate their types and schemas under `src/inngest/events`.
- **HTTP entry point:** `src/app/api/inngest/route.ts` wires Inngest to Next.js using `serve({ client, functions })` so that the CLI and runtime share the same definitions.

### Adding a new workflow

1. Create a new file under `inngest/functions/` (e.g., `sendWelcomeEmail.ts`) and export your Inngest function.
2. Register it in `inngest/functions/index.ts` so the runtime and CLI discover it automatically.
3. Restart the Inngest dev server (`npx inngest-cli dev`) to pick up the new workflow. If you omit `/src`, follow the same steps at the project root (`inngest/functions`).

This structure keeps Next.js routes, shared utilities, and Inngest automation organized while aligning with the conventions recommended in the Inngest Workflow Kit.
## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests
- `npm run test:ui` - Run Vitest tests with UI
- `npm run test:run` - Run Vitest tests once
- `npm run test:coverage` - Run Vitest tests with coverage

## Testing

This project uses Vitest for unit and integration testing, and Playwright for end-to-end testing. Ensure all tests pass before committing changes.

## Deployment

This application is configured for deployment on Vercel as a static site. Push to the main branch to trigger automatic deployment.