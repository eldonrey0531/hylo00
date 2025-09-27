# Manual Validation Scenario: Error & Recovery Flow

## Objective
Ensure concierge agents encounter clear messaging and actionable recovery options when itinerary generation fails mid-flight.

## Setup
- Use same environment as happy path.
- Intentionally misconfigure Groq API key or toggle feature flag to force AI failure after request submission.
- Prepare fallback messaging copy from `specs/002-create-an-ai/contracts/support.md`.

## Steps
1. **Submit Intake Form** using valid data (reuse Kyoto scenario).
2. **Observe Progress Screen**
   - Status updates should proceed through early steps until AI call fails.
   - Failure occurs around Step 16; watch for transition from optimistic messaging to error state.
3. **Validate Error UI**
   - Headline communicates apology without technical jargon.
   - Body explains that concierge will retry manually; includes reference code (workflowId).
   - Provide CTA buttons: "Retry Now" and "Download Intake Data".
4. **Retry Flow**
   - Click "Retry Now"; verify new POST request with same payload but fresh workflowId.
   - Original workflow should be marked as `failed` in status endpoint, new one `processing`.
5. **Download Intake Data**
   - Clicking link exports JSON/CSV containing original form submission.
   - File opens correctly; no sensitive fields omitted.
6. **Support Escalation**
   - Error dialog offers "Notify Engineering"; clicking opens prefilled email or Inngest event.
   - Confirm Step 24 log created with severity `warn` and includes error code + retry status.
7. **Audit Trail**
   - Check activity timeline shows failure followed by retry with timestamps.

## Acceptance Criteria
- User-facing strings match tone defined in copy doc.
- Retry flow creates separate workflow entries without duplicating logs.
- No uncaught exceptions in console.
- Downloaded intake file passes schema validation (open in JSONLint).

## Evidence
- Screenshots of error state, retry state, and activity timeline.
- Copies of failure + retry status responses.
- Logged Step 24 entry.
