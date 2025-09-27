# Templates Contract: AI-Generated Personalized Itinerary

**Purpose:** Provide canonical content structures for itinerary outputs so UI rendering, PDF export, and email preparation stay synchronized.

---

## 1. Itinerary Response Structure

The primary itinerary object returned from back-end services must follow the schema defined in `data-model.md`. Each daily plan includes:
- `dayNumber` (1-indexed)
- `title` (e.g., "Day 1: Arrival & Sunset Cruise")
- `summary` (1-2 sentences)
- `timeBlocks[]` with `label`, `startTime`, `endTime`, `description`
- `diningRecommendation` (optional)
- `transportNotes` (optional)

Manual validation compares API responses with this template before rendering.

---

## 2. UI Rendering Template

```
YOUR PERSONALIZED ITINERARY
TRIP SUMMARY | {tripNickname}
{tripDatesFormatted} • {destination} • {groupType}

[Key Detail Cards]
1. Duration: {plannedDays} days
2. Travelers: {adults} Adults / {children} Children
3. Budget: {budgetRange}
4. Travel Style: {topStyles}
5. AI Confidence: {confidenceScore}

[MapDisplay]
Caption: "Explore {destination}"

🗓️ DAILY ITINERARY
For each day:
  DAY {dayNumber}: {dayTitle}
  Summary: {summary}
  Morning/Afternoon/Evening blocks with bullet lists
  Dining Highlight: {diningRecommendation}
  Transport Tips: {transportNotes}

💡 TIPS FOR YOUR TRIP
- Tip bullet list (3-5 items)

❓ WHAT DO YOU WANT TO DO NEXT?
[⬇️ EXPORT IT AS A PDF] [📧 EMAIL IT] [🔄 GENERATE ANOTHER]
```

Implementation must map data to this layout exactly. Any optional section omitted should collapse gracefully (no blank headers).

---

## 3. PDF Export Template

- **Header**: Full-width banner with gradient background, title centered.
- **Trip Summary Page**: Repeat key detail cards; include map image if available.
- **Daily Pages**: One page per day for trips ≤7 days; multi-day per page allowed for longer trips but maintain clear headers.
- **Footer**: Page number + company tagline (to be provided by marketing) + generation timestamp.

Use jsPDF with html2canvas capturing rendered React components to minimize divergence. Ensure page margins `20mm` and embed fonts supporting emoji.

---

## 4. Email Draft Template

Subject: `Your {plannedDays}-Day Itinerary for {destination}`

Body (HTML):
```
Hi {travelerName},

Your itinerary is ready! Here are the highlights:

• Dates: {dateRange}
• Travelers: {travelerSummary}
• Daily Preview:
  {for each day -> "Day {dayNumber}: {dayTitle} – {headlineActivity}"}

Access the full itinerary here: {shareUrl}
Download the PDF: {pdfUrl}

Happy travels!
```

Ensure email copy stays under 20 lines for easy reading and uses inline styles compatible with common clients (Gmail, Outlook).

---

## 5. Logging Template (Client Trigger)

Each of the 24 console log steps must output:
```
Step {stepNumber}: {action} in {fileName} - {functionName}
Context: {
  timestamp: ISO8601,
  status: "Success" | "Error" | "Warning",
  durationMs: number | null,
  payload: {...}
}
```

Map each step to spec’s logging flow. Example for Step 1:
```
Step 1: Button click captured in app/page.tsx - handleGenerateItinerary
Context: {
  timestamp: "2025-09-27T15:04:05.123Z",
  status: "Success",
  durationMs: null,
  payload: { sessionId: "a1b2", formSection: "overview" }
}
```

Manual validation verifies ordering and presence of required fields.

---

## 6. Checklist Before Implementation

- [ ] API responses match schema and include all required fields
- [ ] React component tree renders template structure without gaps
- [ ] PDF export reproduces UI sections with consistent styling
- [ ] Email template populated with canonical placeholders
- [ ] Console logging outputs follow step-by-step template

Completion of this contract enables Phase 2 task generation focused on implementation.
