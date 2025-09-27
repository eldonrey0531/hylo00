# Styling Contract: AI-Generated Personalized Itinerary

**Goal:** Pin down the visual system for the itinerary output so UI components and exports (PDF/email) share a consistent theme without guesswork.

---

## 1. Theme Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `color.background.primary` | `#0F172A` (slate-900) | Page background behind itinerary container |
| `color.background.surface` | `#FFFFFF` | Card surface for itinerary sections |
| `color.accent.primary` | `#14B8A6` (teal-500) | Section dividers, action button focus states |
| `color.accent.secondary` | `#6366F1` (indigo-500) | Icons, emphasis text |
| `color.text.primary` | `#0F172A` | Headings and body text on light surfaces |
| `color.text.secondary` | `#475569` (slate-500) | Sub-labels, metadata |
| `color.text.inverse` | `#F8FAFC` | Text on dark backgrounds and buttons |
| `color.border.muted` | `#E2E8F0` (slate-200) | Card outlines, section rules |
| `color.badge.warning` | `#F97316` | Budget alerts, validation hints |

Use Tailwind utility classes where possible; otherwise expose tokens via CSS variables in `app/globals.css`:

```css
:root {
  --itinerary-bg: #0F172A;
  --itinerary-surface: #FFFFFF;
  --itinerary-accent: #14B8A6;
  --itinerary-accent-secondary: #6366F1;
  --itinerary-text: #0F172A;
  --itinerary-muted: #475569;
}
```

---

## 2. Typography & Spacing

| Element | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| Main title (`YOUR PERSONALIZED ITINERARY`) | `"Inter", sans-serif` | 30px | 700 | `0.1em` uppercase |
| Section headings | `"Inter"` | 18px | 600 | normal |
| Body text | `"Inter"` | 16px | 400 | normal |
| Metadata labels (e.g., dates) | `"Inter"` | 14px | 500 | `0.02em` |
| Tip callouts label | `"Inter"` | 16px | 600 | uppercase |

Spacing scale aligns with Tailwind defaults (`4px` unit). Key layout rules:
- Outer container max width `960px`, centered with `mx-auto` and `px-6` padding.
- Section spacing `gap-y-6` with `border` + `rounded-xl` for cards.
- Horizontal key detail strip uses `grid-cols-5` on desktop, collapsing to `grid-cols-2` on mobile with `sm:grid-cols-3`.

---

## 3. Iconography & Imagery

| Asset | Style | Notes |
|-------|-------|-------|
| Emoji icons (`🗓️`, `💡`, `❓`, buttons) | Native emoji | Keep emoji for friendly tone per spec |
| Map image | 16:9 aspect ratio | Wrap in `rounded-xl` with border; ensure alt text `"Map of {destination}"` |
| Daily activity bullet icons | Solid dot with accent color | Use CSS `::before` with `background-color: var(--itinerary-accent)` |

PDF export must embed emoji as text; verify fonts support them. If rendering issues arise, replace with inline SVG icons that match accent colors.

---

## 4. Responsive Behavior

1. **Mobile (≤640px)**
   - Collapse key details into two-column grid with `gap-3`.
   - Stack action buttons vertically with `space-y-3`.
   - Reduce header font size to `22px` while keeping uppercase treatment.

2. **Tablet (641px–1024px)**
   - Maintain three-column layout for key details.
   - Map display should scale to `min(100%, 420px)` height.

3. **Desktop (>1024px)**
   - Use five columns for key detail strip, flex layout for action buttons aligned right.
   - Introduce subtle background gradient behind main container (`from-slate-900 to-slate-950`).

Manual validation must include viewport testing at 375px, 768px, and 1280px widths.

---

## 5. Component Contracts

| Component | Styling Rules |
|-----------|---------------|
| `ItineraryHeader` | Overlay a soft gradient bar (`linear-gradient(90deg, teal-500, indigo-500)`) behind the title; ensure text uses `text-slate-50`. |
| `TripSummary` | Card with `shadow-lg`, includes nickname badge using accent secondary color and uppercase label. |
| `KeyDetails` | Use CSS grid; each pill uses `bg-slate-50`, `rounded-lg`, `border border-slate-200`, and label/value vertical stack. |
| `MapDisplay` | Wrap image in `relative` container with caption overlay using `bg-slate-900/70`. |
| `DailyItinerary` | Each day card uses accent border on left (`border-l-4 border-teal-500`) with day heading uppercase. |
| `TravelTips` | Use `divide-y divide-slate-200`; highlight keywords using accent secondary color. |
| `ActionButtons` | Primary button (Generate PDF) uses accent primary background; secondary buttons use outline style with accent secondary border. |

---

## 6. Accessibility Requirements

- Minimum contrast ratio 4.5:1 for text over backgrounds.
- Action buttons must include accessible labels (`aria-label`) describing actions (e.g., "Download itinerary as PDF").
- Ensure focus states apply `outline-offset-2` with accent color.
- Manual validation includes keyboard tab order and screen reader announcement of section headings.

---

## 7. Validation Checklist

- [ ] Theme tokens implemented via Tailwind config or CSS variables
- [ ] Each component honors styling contract
- [ ] Responsive layouts verified at mobile/tablet/desktop breakpoints
- [ ] PDF export reflects same styling hierarchy (fonts, colors, spacing)
- [ ] Accessibility checks confirm contrast and focus rules

Completion of this checklist is required before closing Phase 1 design tasks and commencing implementation.
