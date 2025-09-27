# Manual Validation Scenario: End-to-End Happy Path

## Objective
Confirm a travel concierge agent can complete the entire workflow—from trip intake through itinerary review and email preparation—without errors.

## Actors & Setup
- Persona: Concierge agent "Taylor" logged into dashboard.
- Browser: Latest Chrome with cache cleared.
- Dev servers: Next.js app + Inngest dev server running with healthy dependencies.
- Test data: Use family trip to Kyoto (see `api/payloads/generate-happy.json`).

## Steps
1. **Launch Intake Form**
   - Navigate to `/concierge/intake`.
   - Verify hero copy and CTA match marketing specs.
2. **Complete Trip Details**
   - Fill location, travel dates, travelers, budget (use test values).
   - Select travel vibe, interests, sample days according to spec.
   - Observe inline validation firing only on blur.
3. **Submit Form**
   - On success, expect loading state with progress spinner and reassuring copy.
   - Verify network panel shows POST `/api/itinerary/generate` with 200 response.
4. **Monitor Real-Time Updates**
   - Stay on progress screen; confirm SSE/WebSocket (if implemented) updates status every ≤5s.
   - Status messages should correspond to Step numbers in `contracts/manual-validation.md`.
5. **Review Completed Itinerary**
   - Automatically redirected to `/concierge/itinerary/{workflowId}` when status `completed`.
   - Inspect summary, day-by-day cards, embedded map, and AI narrative.
   - Toggle between "Concise" and "Expanded" views; ensure content adjusts.
6. **Download Assets**
   - Click "Download PDF"; confirm file downloads and contains latest data.
   - Open map modal; verify same image saved earlier.
7. **Prepare Concierge Email**
   - Follow `ui/email-prepare.md` checklist.
8. **Finish Session**
   - Click "Mark as Ready" button; expect toast confirmation and log Step 23.
   - Confirm Redis status transitions to `ready_for_send` (optional via CLI).

## Acceptance Criteria
- No errors in console (browser and server).
- All logs Steps 1–23 emitted in chronological order.
- Generated artifacts (map, email preview, PDF) reflect form inputs.
- Agent can complete flow in <5 minutes without needing manual refresh.

## Evidence
- Screen recording of workflow.
- Export of server logs covering the run.
- Copies of generated assets.
