# Context7 Notes: Email Deep Links & Accessible Templates

## Mailto Deep Link Patterns
- Compose email links with the `mailto:` scheme and encode query parameters for subject/body (`mailto:team@example.com?subject=Trip%20Summary`). (MDN `a` element reference `_snippet_15` & `_snippet_16`).
- Support additional recipients through `cc` and `bcc` query keys (`mailto:nowhere@mozilla.org?cc=...&bcc=...&body=...`). (MDN creating links `_snippet_16`).
- Provide human-friendly link text that clearly states the action, e.g., "Email your itinerary" to improve accessibility. (MDN creating links `_snippet_15`).

## Accessible HTML Email Guidance
- Use semantic, table-based layout since `<table>` elements are universally supported across desktop, webmail, and mobile clients (Can I Email `html-table.md`).
- Supply text alternatives for any non-text visuals (logos, map thumbnails) to satisfy WCAG 2.2 non-text content requirements; mark decorative imagery so assistive tech can ignore it. (WCAG Understanding 1.1.1 Non-Text Content).
- Maintain sufficient contrast (≥ 3:1) for buttons, badges, and graphic elements such as status pills in the itinerary email. (WCAG 2.2 Success Criterion 1.4.11 Non-text Contrast).
- Define preview text and document title to help screen reader users identify the message quickly (`<mj-preview>`, `<mj-title>` in MJML docs).
- Standardize typography and spacing via `mj-attributes` so headings and paragraphs are consistent, improving readability for assistive technology users. (MJML `mj-attributes` snippet).
- Use `mj-breakpoint` and responsive columns to ensure the layout collapses gracefully on narrow clients; MJML auto-stacks columns but explicit breakpoints provide deterministic behavior. (MJML `mj-breakpoint` snippet).
- Embed actionable elements with `mj-button` (or bulletproof VML buttons) to maintain accessible call-to-action links across Outlook and other clients. (MJML button snippets).
- Inline critical CSS or leverage `mj-style inline="inline"` to avoid styles being stripped; reserve more complex styles for progressive enhancement. (MJML `mj-style` snippet).
- Provide logical heading hierarchy with `mj-text` wrapped `<h1>`/`<h2>` tags, keeping itinerary sections scannable for screen readers. (MJML `mj-text` snippet).
