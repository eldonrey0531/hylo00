# Manual Validation: `GET /api/ai/health`

## Goal
Confirm the AI health-check endpoint validates downstream providers (Groq, Tavily, Exa) and returns actionable diagnostics.

## Preconditions
- `.env.local` contains valid API keys for all providers.
- Network access allowed to provider APIs.
- Start local dev server (`npm run dev`).

## Checklist
1. **Baseline call**
   ```powershell
   Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/ai/health"
   ```
2. **Expect HTTP 200** with payload:
   - `healthy: true`
   - `providers` array containing `groq`, `tavily`, `exa` entries.
   - Each provider entry includes:
     - `status: "ok"`
     - `latencyMs` ≤ 2000
     - `quotaRemaining` or `usage` metadata when available.
3. **Verify caching**:
   - Response header `Cache-Control: max-age=30`.
   - Subsequent call within cache window should return identical `latencyMsCached: true` flag (if implemented).
4. **Simulate provider failure**:
   - Temporarily rename `GROQ_API_KEY` in `.env.local` and restart server.
   - Call endpoint: expect `healthy: false`, `groq.status: "error"`, `groq.error.message` describing auth issue.
   - Ensure HTTP status remains 503 and `Retry-After: 60` is present.
   - Restore key afterwards.
5. **Network timeout scenario** (optional):
   - Use firewall or proxy to block Tavily domain.
   - Endpoint should degrade gracefully with `tavily.status: "degraded"` and continue checking others.
6. **Logging**:
   - Confirm Step 6 logs include each provider status and timing.
   - Errors should emit structured log with `severity: "error"` and provider tag.

## Evidence to Capture
- JSON response for healthy call.
- JSON response for simulated failure.
- Dev console logs for Step 6.

## Simulation Overrides (for local mocks)
- With the mock implementations still in place for Groq, Tavily, and Exa (T024-T026 pending), you can force specific statuses without editing env vars by appending a `simulate` query parameter.
- Format: `?simulate=<service>=<status>[:latency][,<service>=<status>[:latency]]`
   - `<service>` should be one of `groq`, `tavily`, or `exa`.
   - `<status>` supports `healthy`, `degraded`, or `error`.
   - Optional `latency` lets you set a numeric latency in ms (defaults to the service baseline if omitted).
- Example: `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/ai/health?simulate=exa=degraded:450"`
   - Forces Exa to return `status: "degraded"` with `latency: 450` while other services remain healthy.
