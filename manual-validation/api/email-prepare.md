# Manual Validation: `POST /api/itinerary/email/prepare`

## Goal
Confirm the email preparation endpoint transforms itinerary data into branded HTML + text templates and returns metadata required for concierge tooling.

## Preconditions
- Completed itinerary stored in Redis (run happy path to completion).
- `workflowId` available for the finished itinerary.
- Email template partials registered (per `contracts/email-template.md`).
- Local dev server running.

## Checklist
1. **Issue request**
   ```powershell
   $body = @{ workflowId = "{workflowId}"; includePlainText = $true; audience = "concierge" } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/itinerary/email/prepare" -Body $body -ContentType "application/json"
   ```
2. **Validate HTTP 200** with payload containing:
   - `success: true`
   - `subject`: matches pattern `{TripNickname} – Concierge Prep`
   - `html`: string length > 2000 characters
   - `text`: string length > 500 characters when `includePlainText`
   - `metadata` object with `workflowId`, `generatedAt` (ISO), `contactEmail`
3. **HTML quality checks**
   - Parse HTML using `npm run lint:html` or online validator; no critical errors.
   - Ensure `<table>` structures include `role="presentation"` and inline styles for email clients.
   - All links include UTM parameters and open in new tab (`target="_blank"`, `rel="noopener"`).
4. **Plain-text checks**
   - Confirm text version mirrors HTML sections separated by blank lines.
   - No more than 80 characters per line.
5. **Error scenarios**
   - Missing `workflowId` → expect 400 with validation errors array.
   - Unknown `workflowId` → 404 with `code: "WORKFLOW_NOT_FOUND"`.
   - Template rendering failure (temporarily break partial) → 500 with `code: "EMAIL_TEMPLATE_ERROR"` and log Step 21 severity `error`.
6. **Logging**
   - Server logs should include Step 21 entry containing `workflowId`, `htmlSizeKb`, `textSizeKb`.
   - Ensure no PII beyond contact first name appears in logs.

## Evidence
- JSON response copies for success, 404, and template error cases.
- HTML validation report.
- Screenshot of concierge email preview using returned HTML.
