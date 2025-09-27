# Manual Validation: `POST /api/itinerary/generate`

## Goal
Confirm the itinerary generation endpoint enqueues an Inngest workflow, validates payloads, and returns the tracking metadata defined in `contracts/api-contracts.md`.

## Preconditions
- `.env.local` populated with all required keys from `specs/002-create-an-ai/contracts/configuration.md`.
- Dev servers running:
  - `npm run dev` in one terminal.
  - `npx inngest-cli@latest dev` (or equivalent) in a second terminal pointing to the same project.
- Browser devtools console open to monitor log output when triggering from the UI.
- Optional: Redis explorer or `@upstash/redis` dashboard available to observe persisted workflow state.

## Happy-Path Checklist
1. **Prepare request body** matching the `TripFormData` schema:
   - Include fixed dates (`departDate`, `returnDate`) and `flexibleDates: false`.
   - Provide at least one traveler and budget info.
   - Supply `sessionId` (UUID string) and `options.enableDetailedLogging: true`.
2. **Issue the request** from terminal (pick one):
   - PowerShell:
     ```powershell
     $body = @{ 
       formData = @{ 
         location = "Kyoto, Japan";
         departDate = "2025-04-10";
         returnDate = "2025-04-16";
         flexibleDates = $false;
         plannedDays = $null;
         adults = 2;
         children = 1;
         childrenAges = @(7);
         budget = 6000;
         currency = "USD";
         budgetMode = "total";
         flexibleBudget = $false;
         selectedGroups = @("Family");
         customGroupText = $null;
         selectedInterests = @("Culture", "Food");
         customInterestsText = $null;
         selectedInclusions = @("Guided Tours", "Transfers");
         customInclusionsText = $null;
         inclusionPreferences = @{};
         travelStyleAnswers = @{};
         contactInfo = @{ name = "Alex Rivera"; email = "alex@example.com" };
         tripNickname = "Spring Break in Kyoto"
       };
       sessionId = "manual-validation-session-001";
       options = @{ enableDetailedLogging = $true; priority = "normal" }
     } | ConvertTo-Json -Depth 6
     Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/itinerary/generate" -Body $body -ContentType "application/json"
     ```
   - cURL:
     ```bash
     curl -X POST http://localhost:3000/api/itinerary/generate \ 
       -H "Content-Type: application/json" \ 
       -d @manual-validation/api/payloads/generate-happy.json
     ```
3. **Verify HTTP 200** (or 202 if implementation chooses) with JSON body containing:
   - `success: true`
   - `workflowId: string` (non-empty)
   - `statusEndpoint`: absolute or relative URL pointing to `/api/itinerary/status/{workflowId}`
   - `estimatedCompletion`: ISO timestamp or `null`
4. **Confirm console logging** captured Step 13 (API route invocation) with session metadata.
5. **Inspect Inngest dev console**; ensure the workflow `app/itinerary.requested` (or equivalent) was triggered with the same `workflowId`.
6. **Check Redis** (optional) for a key like `itinerary:status:{workflowId}` containing `status: "processing"`.

## Validation Rules
- Missing required fields should return HTTP 400 with structured error list; re-run with omitted `location` to confirm.
- Duplicate `sessionId` should be accepted but log idempotency decision (implementation-specific) without crashing.
- When `flexibleDates: true`, ensure `plannedDays` > 0; the endpoint must reject invalid combos.

## Failure Scenarios
- **Upstash unavailable** → Expect HTTP 503 or 500 with `message` describing storage failure; console Step 11 should report Redis error.
- **Groq key missing** → Endpoint should fail fast, logging configuration error by Step 11 and returning 500/503.
- **Rate limiting** → If implemented, confirm HTTP 429 body contains retry guidance.

## Evidence to Capture
- Screenshot or JSON response showing success payload.
- Console log snippet for Steps 1-13 proving validation flow.
- Screenshot of Inngest dev server listing the workflow run.
- Notes on any deviations from contract (add to QA report).
