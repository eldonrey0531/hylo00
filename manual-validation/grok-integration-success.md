# Grok Reasoning Integration – Implementation Notes

## Overview
The Grok reasoning integration now uses xAI's `responses` endpoint directly. This change replaces the previous SDK call path, ensuring itineraries generated inside the Inngest workflow consistently return rich textual output. The same helper is used by both the CLI validation script (`scripts/run-grok-demo.ts`) and the itinerary workflow (`src/lib/ai/architectAI.ts`).

## Why It Works Now
- **Direct API requests**: Requests are sent to `https://api.x.ai/v1/responses`, bypassing SDK abstractions that occasionally returned empty `text` fields.
- **Structured text extraction**: Responses are parsed from the `output` array first, then fall back to `choices`, tool call arguments, reasoning traces, or stringifying the payload. This guarantees usable text for JSON parsing.
- **Detailed metadata logging**: Finish reason, usage, response preview, and fallback source are logged at each step, making observability and debugging straightforward during workflow runs.
- **Shared helper**: `generateGrokItineraryDraft` centralizes response handling, so the CLI demo and Inngest workflow stay in sync.

## Requirements for Successful Runs
1. **Environment variables**
   - `XAI_API_KEY` must be present (and valid) in both local and deployed environments.
   - Optional: `NODE_TLS_REJECT_UNAUTHORIZED=0` is _not_ required; keep TLS defaults intact.
2. **Runtime prerequisites**
   - Node.js ≥ 18 (for native `fetch`).
   - Network access to `https://api.x.ai`.
3. **Code paths**
   - Use `buildGrokItineraryPrompt` to build the request prompt from form data.
   - Call `generateGrokItineraryDraft` for Grok responses. Avoid rolling your own fetch logic elsewhere to keep behavior consistent.
4. **Error handling**
   - Non-`ok` HTTP responses throw with the server message included in logs.
   - Empty bodies or malformed JSON trigger descriptive errors, allowing retries via Inngest.

## Validation Checklist
- Run the CLI demo to confirm a narrative response:
  - `npx ts-node --esm scripts/run-grok-demo.ts`
- Execute TypeScript checks:
  - `npm run type-check`
- Optionally trigger the Inngest workflow locally (requires ingress + event fixture) to confirm Redis + vector persistence still succeed.

## Observed Output (Example)
- Latency: ~20–25s for `grok-4-fast-reasoning` in recent runs.
- Usage payload includes reasoning token counts (e.g., `reasoning_tokens: 231`).
- Response body returns a markdown itinerary with daily plans that parses cleanly into `dailyPlans` JSON.

## Next Steps
- Define which itinerary fields get persisted to the Upstash vector store, including embeddings metadata and any summary text.
- Document how Redis state, vector IDs, and raw AI output correlate for downstream retrieval flows.
- Add a regression test (unit or integration) that asserts `generateGrokItineraryDraft` returns valid JSON given a canned Grok response fixture.
