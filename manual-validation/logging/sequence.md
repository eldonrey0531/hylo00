# Manual Validation: Logging Sequence Checklist

## Goal
Verify every step in the concierge itinerary pipeline emits structured logs with expected metadata, enabling auditability and incident triage.

## Tools
- Application server console (Next.js dev terminal).
- Inngest dev CLI output.
- Log aggregation sink (if configured) such as Logtail or Datadog.

## Step-by-Step Log Expectations
| Step | Description | Source | Required Fields | Severity |
| --- | --- | --- | --- | --- |
| 1 | Intake form component mounts | Browser console (debug) | `sessionId`, `component="IntakeForm"` | debug |
| 2 | Form validation schema loaded | Server | `schemaVersion`, `durationMs` | info |
| 3 | User edits field (debounced) | Browser | `field`, `valid` | debug |
| 4 | Form submission initiated | Server API | `sessionId`, `payloadSizeBytes`, `userAgent` | info |
| 5 | Request body validated | Server API | `schemaVersion`, `issues` | info/error |
| 6 | AI health snapshot read | Server API | `groq.status`, `tavily.status`, `exa.status` | info |
| 7 | Rate limiting check | Server API | `limitRemaining`, `bucket` | info/warn |
| 8 | Request payload sanitized | Server API | `redactedFields`, `hash` | info |
| 9 | Idempotency cache lookup | Server API | `cacheKey`, `hit` | info |
| 10 | Workflow ID generated | Server API | `workflowId`, `sessionId` | info |
| 11 | Redis write (status=processing) | Server API | `workflowId`, `status` | info/error |
| 12 | Inngest event dispatched | Server API | `eventName`, `workflowId`, `payloadSize` | info/error |
| 13 | API response sent | Server API | `workflowId`, `statusCode`, `durationMs` | info |
| 14 | Inngest handler start | Inngest worker | `workflowId`, `eventId` | info |
| 15 | Research providers queried | Inngest worker | `provider`, `latencyMs`, `query` | info/warn |
| 16 | Groq itinerary draft generated | Inngest worker | `promptId`, `tokens`, `latencyMs` | info/error |
| 17 | Draft enriched with research | Inngest worker | `attachments`, `mergeStrategy` | info |
| 18 | Status poll handled | Server API | `workflowId`, `status`, `percentage` | info |
| 19 | Static map rendered | Inngest worker/API | `workflowId`, `waypointCount`, `cache` | info/error |
| 20 | Workflow completion persisted | Inngest worker | `workflowId`, `durationMs`, `resultSizeKb` | info |
| 21 | Email preview generated | Inngest worker | `workflowId`, `htmlSizeKb` | info/error |
| 22 | Workflow failure captured | Inngest worker | `workflowId`, `errorCode`, `correlationId` | error |
| 23 | Concierge marks ready | Server API | `workflowId`, `actor`, `timestamp` | info |
| 24 | Support notified / retry flagged | Server API | `workflowId`, `emailSent`, `retryWorkflowId` | warn |

## Validation Procedure
1. Execute happy-path scenario (`ui/scenario-happy-path.md`) while tailing server and Inngest logs.
2. Mark off each Step in the table as the corresponding log appears.
3. Confirm structured JSON format (no plain strings). Fields should be camelCase and include `sessionId` wherever applicable.
4. Repeat with error scenario (`ui/scenario-error-handling.md`) to ensure Steps 22 and 24 appear with correct severity.
5. If logs forward to external sink, verify they arrive with correct indexes/tags (`env:dev`, `service:itinerary`).

## Evidence to Capture
- Annotated log excerpt covering Steps 4–21 for happy path.
- Separate excerpt showing Steps 22 & 24 from error run.
- Screenshot of log dashboard filters confirming unique workflowId correlations.
