# Context7 Notes: Tavily + Exa Integrations

## Tavily (`@tavily/core`)
- Instantiate the client with `tavily({ apiKey: process.env.TAVILY_API_KEY })`; the helper returns lightweight methods (`search`, `extract`, `crawl`, `map`).
- `await tvly.search(query)` delivers a JSON payload containing ranked results, snippets, and timestamps suitable for quick fact gathering (README snippet `_snippet_1`).
- Use `tvly.extract(urls)` to pull raw page content for up to 20 URLs in one call—returns `{ results, failedResults }` so downstream code can retry failures (README `_snippet_2`).
- `tvly.crawl(startUrl, { max_depth, limit, instructions })` performs guided crawling with natural language filters, ideal for location-specific research (README `_snippet_3`).
- `tvly.map(startUrl, options)` exposes the site graph without content payloads—handy for catching related attractions when building itinerary context (README `_snippet_4`).
- All helpers are async and return promises; wrap calls in typed functions that normalize outputs into our `ResearchFinding` shape before storing in Redis.

## Exa (`exa-js`)
- Create the SDK client via `import { Exa } from "exa-js"; const exa = new Exa({ apiKey: process.env.EXA_API_KEY });` (usage inferred from README patterns).
- `exa.search(query, { numResults, includeDomains, startPublishedDate, type })` returns structured `SearchResponse` items with URLs, titles, and highlight text (`README` `_snippet_15`).
- Combine retrieval + content in one step with `exa.searchAndContents(query, { text: true })` or set `text: { maxCharacters }` to limit payload size (README `_snippet_5` & `_snippet_6`).
- Fetch full bodies later via `exa.getContents(resultsOrUrls)` which accepts either raw URLs or the `Result` objects returned from search (README `_snippet_17`).
- Similarity lookups: `exa.findSimilar(url, { numResults })` and `exa.findSimilarAndContents(url, { text: true })` help enrich itineraries with related articles (`README` `_snippet_9`).
- Answer generation and streaming (`exa.answer`, `exa.streamAnswer`) provide summarised narratives with citation metadata—useful for crafting concise travel tips while tracking sources (`README` `_snippet_18`, `_snippet_19`).
- For batch operations, loop through queries and aggregate results (researcher example `_snippet_15`); guard concurrency to respect rate limits.

## Integration Tips
- Normalize Tavily and Exa output schemas into a shared interface before merging with Groq results to simplify itinerary assembly.
- Cache raw responses in Redis with short TTLs (e.g., 30–60 minutes) so repeated polling does not re-hit the external APIs.
- Log each external request with step IDs (per console log contract) capturing query terms, selected options, and truncated results for debugging.
- When streaming Exa answers, accumulate `chunk.content` and persist final citation array so manual validation can confirm attribution compliance.
