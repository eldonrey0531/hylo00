# RAG Multi-Agent Travel Planning System Feature Specification

## Overview

Build a session-aware RAG multi-agent system that collects user form data, stores it temporarily, vectorizes it, augments LLMs with real-time web results, and generates personalized itineraries and follow-ups.

## User Stories

### Primary Stories

1. **As a traveler**, I want to fill out multiple forms with my travel preferences so that the system can understand my complete travel profile
2. **As a traveler**, I want my form data to be temporarily stored and vectorized so that the system can provide personalized recommendations across sessions
3. **As a traveler**, I want the system to use real-time web information so that my itinerary includes up-to-date information about destinations, events, and prices
4. **As a traveler**, I want to receive a structured itinerary with citations and actionable links so that I can easily book and plan my trip
5. **As a user**, I want to ask follow-up questions about my travel plans so that I can refine and customize my itinerary

### Supporting Stories

6. **As a system**, I want to automatically expire session data after 24 hours so that user privacy is maintained
7. **As a system**, I want to log all interactions in LangSmith so that performance can be monitored and improved
8. **As a system**, I want to use multiple LLM providers with intelligent routing so that the system remains resilient and cost-effective

## Functional Requirements

### Form Data Collection & Storage

- **FR1**: Capture structured data from all frontend forms: TripDetailsForm, TravelGroupSelector, TravelInterests, ItineraryInclusions, TravelExperience, TripVibe, SampleDays, DinnerChoice, TripNickname, ItineraryForm, PreferencesModal, ContactForm
- **FR2**: Save raw form data to session store (Supabase/Upstash) with session ID and configurable TTL (default 24 hours)
- **FR3**: Trigger background ingestion job on form change/submit to normalize and vectorize data

### Data Processing & Vectorization

- **FR4**: Normalize form fields into consistent schema (budget_currency, start_date, trip_length_days, etc.)
- **FR5**: Create compact "session summary" text from structured form data
- **FR6**: Generate embeddings from session summary using consistent embedding model
- **FR7**: Upsert vectors into Qdrant with metadata: {session_id, form_ids, created_at, user_id, ttl}

### Retrieval & Generation

- **FR8**: Query Qdrant with session context + similarity search for relevant vectors
- **FR9**: Integrate real-time web grounding using GROQ browser/web search for up-to-date information
- **FR10**: Generate structured itinerary JSON with citations and action links
- **FR11**: Support follow-up Q&A using session context and retrieval

### API Endpoints

- **FR12**: `POST /api/save_form` - Save form data to session store
- **FR13**: `POST /api/summarize_session` - Generate session summary
- **FR14**: `POST /api/generate_itinerary` - Create structured itinerary
- **FR15**: `POST /api/ask_question` - Handle follow-up questions
- **FR16**: `DELETE /api/flush_session` - Clear session data

## Non-Functional Requirements

### Performance

- **NFR1**: Form data must be queryable and vectorized within seconds
- **NFR2**: Maintain existing <50ms cold start requirements for edge functions
- **NFR3**: API responses under 200ms for simple queries, under 5s for complex itinerary generation

### Reliability

- **NFR4**: Real-time web grounding must include fallback when browser search fails
- **NFR5**: Support multiple LLMs with intelligent routing based on task complexity
- **NFR6**: Graceful degradation when vector store or session store is unavailable

### Observability

- **NFR7**: Log all traces and scoring in LangSmith for evaluation and debugging
- **NFR8**: Track token usage and costs per request across all providers
- **NFR9**: Monitor session lifecycle and TTL compliance

### Security & Privacy

- **NFR10**: Session data TTL enforced with automatic cleanup
- **NFR11**: No PII in vectorized text, use session tokens for linking
- **NFR12**: All LLM calls routed through secure backend (no client-side API keys)

## Technical Constraints

### Constitutional Compliance

- **TC1**: Must run on Vercel Edge Runtime (no Node.js APIs)
- **TC2**: Maintain multi-LLM resilience (Cerebras, Gemini, Groq)
- **TC3**: LangSmith integration mandatory for all LLM operations
- **TC4**: Strict TypeScript with Zod validation throughout
- **TC5**: Cost-conscious provider selection based on query complexity

### Integration Requirements

- **TC6**: Compatible with existing multi-agent architecture (4 specialized agents)
- **TC7**: Integrate with existing form components without breaking changes
- **TC8**: Maintain existing BehindTheScenes monitoring component
- **TC9**: Use existing LLM routing service and provider factory

## Success Criteria

### Functional Success

1. User can complete all travel forms and receive personalized itinerary
2. System retrieves relevant past session data for repeat users
3. Generated itineraries include real-time web information with citations
4. Follow-up questions produce contextually relevant responses
5. Session data automatically expires per TTL configuration

### Technical Success

1. All constitutional principles maintained (verified by automated checks)
2. 90%+ uptime across all LLM providers with automatic failover
3. Vector queries return results within 500ms
4. LangSmith captures 100% of LLM operations with complete trace data
5. Zero security incidents with PII exposure

### User Experience Success

1. Form completion to itinerary generation under 30 seconds
2. Real-time progress feedback via BehindTheScenes component
3. Structured output with actionable booking links
4. Natural language citations for all recommendations
5. Seamless follow-up conversation flow

## Dependencies

### External Services

- **Qdrant**: Vector database for embeddings storage and similarity search
- **Supabase OR Upstash**: Session storage with TTL support
- **GROQ Browser/Web Search**: Real-time web information gathering
- **LangSmith**: Observability and tracing for all LLM operations

### Internal Systems

- Existing multi-agent service architecture
- LLM routing service with provider factory
- Form validation and UI components
- BehindTheScenes monitoring component

## Implementation Notes

### Data Flow

1. Form submit → Session store (fast, transactional)
2. Background: Normalize → Summarize → Embed → Vector store
3. Generation request → Retrieve vectors → Web search → LLM generation
4. Response: Structured JSON + citations + human summary

### Provider Routing Strategy

- **Large context + grounding tasks**: Use Cerebras/Gemini for complex reasoning
- **Short follow-ups**: Use Groq for speed
- **Always include citations**: URLs + snippets + timestamps

### Privacy & Cleanup

- Redact PII before embedding
- Cache frequent web results (with expiration for time-sensitive data)
- Automatic session cleanup via background cron job
