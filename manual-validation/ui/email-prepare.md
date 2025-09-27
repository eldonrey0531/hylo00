# Manual Validation: Concierge Email Preparation UI

## Goal
Validate the concierge email workflow from the itinerary review screen through final copy-ready output.

## Preconditions
- Local Next.js dev server running at `http://localhost:3000`.
- Test itinerary available (completed workflow) with associated `emailPreviewUrl`.
- Test concierge email inbox or preview tool ready (e.g. MJML live preview or Outlook).
- Accessibility tooling installed (Axe browser extension or Lighthouse).

## Flow Checklist
1. **Open itinerary result page** for completed workflow (use status page deep link).
2. **Locate "Prepare Concierge Email" CTA** under summary card; confirm tooltip explains purpose.
3. **Trigger modal/panel** and confirm it loads within <1s.
4. **Verify prefilled fields**:
   - Recipient defaults to contact email from form.
   - CC includes concierge distribution list from configuration.
   - Subject uses contract pattern `"{TripNickname} – Concierge Prep"`.
5. **Review rich-text body**:
   - Greeting references traveler's preferred name.
   - Key highlights (top 3 itinerary beats) rendered as bullet list.
   - Pricing summary, travel dates, and call-to-action visible.
6. **Run accessibility audit**:
   - Contrast ratios for buttons ≥ 4.5:1.
   - All interactive elements keyboard reachable.
   - ARIA labels present for editor toolbar.
7. **Copy HTML and Plain Text** outputs:
   - Toggle plain-text view; ensure no HTML tags remain.
   - Copy HTML via provided button; paste into email client—layout should match design system tokens.
8. **Send test email** to self:
   - Confirm preheader text appears correctly in inbox preview.
   - Links trackable (UTM params) and open target pages.
9. **Error handling**:
   - Disconnect network and attempt to open modal; should show inline error and retry control.
   - Clear local storage (if used) and ensure template regenerates without stale data.

## Evidence to Capture
- Screenshots of modal, accessibility report summary, and received email in client.
- Notes on any copy discrepancies vs. `specs/002-create-an-ai/contracts/email-template.md`.
