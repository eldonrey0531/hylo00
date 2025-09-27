# Inngest Workflow Layout

This directory contains all server-side workflow orchestration for the AI itinerary feature. The layout mirrors the Inngest + Next.js workflow kit referenced in our specs and keeps implementation concerns isolated from the rest of the app.

```
inngest/
├── client.ts              # Singleton Inngest client (reads env via itinerary-config)
├── functions/
│   ├── index.ts           # Barrel export for every registered workflow
│   └── itinerary.ts       # AI itinerary workflow (dispatches Grok, persists state)
└── README.md
```

## Adding a new workflow
1. Create `inngest/functions/<name>.ts` and export a function via `inngest.createFunction`.
2. Append the new function to the array in `inngest/functions/index.ts`.
3. The `/api/inngest` route automatically serves every function listed in the barrel export.

## Local development
- Start the Next.js dev server: `npm run dev`.
- Launch the Inngest dev server (in a separate terminal): `npx inngest-cli dev --watch inngest/functions`.
- The generate route enqueues events by importing the client from `@/inngest/client`.

## Why this structure?
- Aligns with the official Inngest workflow kit, making future upgrades straightforward.
- Keeps workflow logic separate from shared libs (`lib/**`) and API handlers (`app/api/**`).
- Enables automatic function discovery when using the Inngest CLI or dashboard.
