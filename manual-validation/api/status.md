# Manual Validation: `GET /api/itinerary/status/{workflowId}`

## Goal
Ensure the status endpoint exposes workflow progress, error details, and generated asset links while honoring caching semantics.

## Preconditions
- A `workflowId` issued from the generate endpoint within the past hour.
- Inngest dev server running with the workflow either `processing` or `completed`.
- Redis (Upstash) initialized and accessible with relevant status keys.

## Checklist for `processing` Workflow
1. Fetch the status:
   ```powershell
   Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/itinerary/status/$workflowId"
   ```
2. Confirm HTTP 200 and JSON body fields:
   - `workflowId` matches request.
   - `status` equals `"processing"`.
   - `percentageComplete` between 0 and 90.
   - `etaSeconds` present (integer) or `null`.
   - `messages` array includes at least one item referencing current queue stage.
   - `result` should be `null` when processing.
3. Inspect response headers:
   - `Cache-Control: no-store` for in-flight workflows.
   - `Retry-After` present if `etaSeconds` was returned.
4. Confirm Redis entry `itinerary:status:{workflowId}` mirrors the payload.
5. Validate that log Step 18 (status refresh) fired with `status: processing`.

## Checklist for `completed` Workflow
1. Start run by allowing workflow to finish (watch Inngest dev console until success).
2. Repeat GET call; expect JSON body containing:
   - `status: "completed"`.
   - `percentageComplete: 100`.
   - `result.summary` string with > 20 words.
   - `result.dayPlans` array length equals `plannedDays` or derived from travel style logic.
   - `result.emailPreviewUrl` present and reachable (200 OK).
   - `result.mapImageUrl` present and returns image bytes (<200KB) when fetched.
3. Check `Cache-Control` header now allows caching, e.g. `max-age=30`.
4. Confirm Redis entry moved to a finalized hash (e.g. persists both status + result).
5. Verify logging Step 20 captured completion message with asset URLs masked when necessary.

## Checklist for `failed` Workflow
1. Simulate error by cancelling workflow from Inngest or forcing Groq failure (invalid key).
2. GET status again; response must include:
   - `status: "failed"`.
   - `error.code` (string) and `error.message` (user-safe summary).
   - `error.details` array (optional) with diagnostic entries.
3. Ensure HTTP status remains 200 (to avoid client retry loops) but `Cache-Control: no-store` persists.
4. Confirm log Step 22 recorded failure with correlation ID.

## Evidence to Capture
- JSON responses for each state (`processing`, `completed`, `failed`).
- Response headers screenshot.
- Inngest timeline screenshot verifying state transitions.
- Redis inspection snippet.
