# Manual Validation: `GET /api/maps/static`

## Goal
Ensure the static map image service composes day-level waypoints into a branded PNG and caches results.

## Preconditions
- Local dev server running.
- Valid map provider key (Mapbox or Google Static Maps) configured.
- Sample itinerary day plan with coordinates ready (use fixture below).

## Sample Query
```powershell
$body = @{ 
  center = @{ lat = 35.0116; lng = 135.7681 };
  zoom = 12;
  dayPlans = @(
    @{ day = 1; waypoints = @(@{ lat = 35.015; lng = 135.775; label = "Breakfast" }, @{ lat = 35.003; lng = 135.765; label = "Temple" }) },
    @{ day = 2; waypoints = @(@{ lat = 35.013; lng = 135.78; label = "Market" }) }
  );
  theme = "light";
  width = 1024;
  height = 512;
  sessionId = "manual-validation-session-001"
} | ConvertTo-Json -Depth 6
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/maps/static" -Body $body -ContentType "application/json" -OutFile map.png
```

## Checklist
1. **Response Validation**
   - HTTP status 200.
   - `Content-Type: image/png`.
   - `Content-Length` between 80KB and 500KB.
2. **Visual Inspection**
   - Open `map.png`; confirm branded overlay, day markers labeled sequentially (`Day 1`, `Day 2`).
   - Check stroke and fill colors align with Tailwind design tokens (consult `styles/tokens.md`).
   - Verify legend includes concierge contact info when `options.includeLegend = true`.
3. **Caching Behavior**
   - Repeat identical request; response should return `X-Cache: HIT` header and faster latency (<200ms).
   - Change waypoint coordinates; header should revert to `MISS`.
4. **Error Handling**
   - Omit required field (`center`): expect HTTP 400 with validation errors array.
   - Provide >15 waypoints; endpoint should respond with 422 and message about map clutter.
   - Simulate provider outage by invalidating API key → expect 503 with `providerStatus` payload.
5. **Logging**
   - Review logs for Step 19 (map generation). Ensure they include `sessionId`, `waypointCount`, and cache decision.

## Evidence to Capture
- Saved `map.png` screenshot.
- Response headers for cache miss/hit.
- Error payloads for validation and provider failure cases.
