# Configuration Contract: AI-Generated Personalized Itinerary

**Document Purpose**: Define all configuration inputs required for the itinerary feature so every environment can provision consistent services without code changes.

---

## 1. Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GROQ_API_KEY` | Yes | Auth key for xAI Grok via Groq SDK. Provision via Groq console and store in Vercel encrypted env. | `gsk_live_xxx` |
| `TAVILY_API_KEY` | Yes | Tavily search API key for real-time travel research. | `tv_{uuid}` |
| `EXA_API_KEY` | Yes | Exa semantic search key for content enrichment. | `exa_live_xxx` |
| `SERP_API_KEY` | Yes | SERP API key used for Google Maps Static API image fetches. | `serp_live_xxx` |
| `INNGEST_EVENT_KEY` | Yes | Inngest event key for dispatching itinerary workflow jobs. | `ingest_ev_xxx` |
| `INNGEST_SIGNING_KEY` | Yes | Signing key to validate Inngest webhook callbacks. | `ingest_sign_xxx` |
| `KV_REST_API_URL` | Yes | REST endpoint for Upstash KV database instance. | `https://us1-upstash-url` |
| `KV_REST_API_TOKEN` | Yes | Auth token for Upstash KV requests. | `AXXX` |
| `NODE_ENV` | Yes | Runtime mode; must be `development`, `preview`, or `production`. | `development` |
| `ITINERARY_LOG_LEVEL` | No (defaults to `info`) | Controls verbosity of console logging (`silent`, `error`, `warn`, `info`, `debug`). | `debug` |
| `ITINERARY_CACHE_TTL_MINUTES` | No (defaults to 120) | Minutes to cache AI results in Redis for manual replays. | `180` |

> **Manual Validation Note:** Quickstart prerequisites require all mandatory variables before Phase 1 sign-off. During validation, cross-check `.env.local` with this table.

---

## 2. Runtime Flags

| Flag | Default | Description | Usage |
|------|---------|-------------|-------|
| `enableDetailedLogging` | `true` | Ensures 24-step console log contract emits full payloads. | Passed via request payload and stored alongside workflow state. |
| `enableDataCleansing` | `true` | Toggles advanced data normalization prior to AI call. Should only be disabled for debugging. | Controlled in form submission options. |
| `allowPdfExport` | `true` | Allows users to export itinerary as PDF (jsPDF pipeline). | If false, hide export button on UI. |
| `allowEmailDraft` | `true` | Enables email client deep link generation. | If false, disable email button. |
| `mapsFallbackMode` | `"static"` | Determines fallback behavior when SERP API quota exceeded (`static`, `placeholder`, `hidden`). | Keep `static` for production; manual validation can trial `placeholder`. |

Flags are configured via `lib/config/itinerary-config.ts` (to be implemented) and read from environment variables or defaults.

---

## 3. External Service Endpoints

| Service | Endpoint / Base URL | Notes |
|---------|--------------------|-------|
| Groq SDK | Managed by SDK (`https://api.groq.com/openai/v1`) | No custom routing; rely on SDK defaults. |
| Tavily Search | `https://api.tavily.com/search` | Use `POST` requests with JSON body. |
| Exa Semantic Search | `https://api.exa.ai/search` | Use `POST` for `search` and `GET` for `content`. |
| SERP Google Maps Static | `https://serpapi.com/search.json` with `engine=google_maps` | Compose map image URL server-side before proxying. |
| Inngest API | `https://api.inngest.com` | SDK handles request signing; ensure event key loaded. |
| Upstash KV REST | Provided by `KV_REST_API_URL` | Use `pipeline` endpoints for multi-command flows. |

All network calls must route server-side through Next.js App Router handlers to keep keys private.

---

## 4. Build & Deploy Constraints

1. **Static-Friendly:** Maintain static Next.js build by isolating server actions within API routes and Inngest functions.
2. **Vercel Secrets:** All sensitive keys stored via Vercel environment settings, not committed files.
3. **Local Development:** Use `.env.local`; never check into git. Running `npm run dev` should load all variables before Phase 1 validation.
4. **Manual Validation Hook:** Prior to manual walkthroughs, run `npm run lint` and review console logs to ensure env issues do not mask UI validation.

---

## 5. Configuration Verification Checklist

- [ ] `.env.local` matches mandatory variable table
- [ ] Feature flags align with intended manual validation scenario
- [ ] External services reachable via curl or Postman smoke checks
- [ ] Inngest dashboard shows registered itinerary workflow
- [ ] Redis namespace contains expected keys after dry run (`itinerary:session:{id}`)

Completing this checklist is a prerequisite for Phase 1 sign-off before handing off to manual validation tasks in Phase 2.
