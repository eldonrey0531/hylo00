# Grok Demo API Validation

Use this guide to exercise the sample Grok reasoning endpoint built with Vercel AI SDK v5 patterns.

## Prerequisites

- `XAI_API_KEY` set in your environment (e.g., `.env.local`).
- Development server running (`npm run dev`).

## Steps

1. Send a POST request to `/api/ai/grok-demo` with an optional JSON payload matching the trip form contract. If no body is supplied, the endpoint uses an internal sample.
2. Inspect the JSON response:
   - `itinerary`: Parsed itinerary object returned by Grok.
   - `metadata`: Latency, usage, and fallback diagnostics captured during generation.
3. Review the server logs for the numbered instrumentation steps (`lib/ai/architectAI.ts`). They confirm the reasoning model executed successfully.

Example with `curl`:

```
curl -X POST http://localhost:3000/api/ai/grok-demo \
  -H "Content-Type: application/json" \
  -d '{
        "location": "Lisbon, Portugal",
        "plannedDays": 3,
        "flexibleDates": true,
        "travelStyleChoice": "answer-questions",
        "travelStyleAnswers": {
          "experience": ["urban explorer"],
          "vibes": ["vibrant", "coastal"],
          "sampleDays": ["high-energy"],
          "dinnerChoices": ["chef tasting menus"]
        },
        "selectedInterests": ["culinary", "nightlife"],
        "tripNickname": "Atlantic Nights"
      }'
```

The response should include a generated itinerary tailored to the supplied preferences. If the endpoint reports a missing API key, ensure `XAI_API_KEY` is configured and restart the dev server.
