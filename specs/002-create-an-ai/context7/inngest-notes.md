# Context7 Notes: Inngest + Next.js Workflow Kit

## Key Integration Patterns
- Use the published `inngest` SDK to instantiate a client (`new Inngest({ id: "my-app" })`).
- Next.js integrations import the `serve` helper from `inngest/next` and export it from the API handler to register functions (`export default serve(inngest, [myFunction])`).
- App Router projects colocate the handler under `app/api/inngest/route.ts` (Pages Router uses `pages/api/inngest.ts`).
- Example templates from the Inngest repo (`examples/framework-nextjs-app-router`) show ready-to-clone setups with the handler and sample functions wired in.
- Real-time examples rely on `useInngestSubscription` from `@inngest/realtime/hooks` when streaming updates back to the client.

## Function Authoring Tips
- Workflows are declared with `inngest.createFunction({ id }, { event }, async ({ event, step }) => { ... })` and can leverage `step.run` to break work into retries.
- Ensure each function is exported and passed to `serve` so it is reachable by the Inngest Dev Server and production runtime.
- The Dev Server runs via `npx inngest-cli@latest dev` in parallel with `npm run dev`.

## Helpful References
- Inngest JS repo App Router example: `https://github.com/inngest/inngest-js/tree/main/examples/framework-nextjs-app-router`
- README snippet demonstrating `serve` usage: `packages/inngest/README.md#_snippet_1`
- Realtime hook example: `examples/realtime/next-realtime-hooks/README.md#_snippet_4`
