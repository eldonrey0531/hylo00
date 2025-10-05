# Hylo AI Itinerary Generation - Complete Workflow

## System Overview

**Hylo** is an AI-powered travel itinerary generator that creates personalized trip plans using:
- **AI Models**: Grok (via xAI), GPT (via Groq)
- **Workflow Engine**: Inngest for async orchestration
- **Data Storage**: Upstash Redis for state management
- **Research APIs**: Tavily, Exa for real-time travel information
- **Maps**: Google Maps/Leaflet for visualization
- **Optional**: Viator API for tours/activities

---

## End-to-End User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. USER INTERACTION (Frontend - app/page.tsx)                      │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
    User fills out trip planning form:
    - Location (where to go)
    - Dates (start date, duration in days)
    - Travelers (adults, children)
    - Budget (amount, currency, flexibility)
    - Preferences (groups, interests, inclusions)
    - Travel style (detailed questions or skip)
    - Trip nickname (optional)
                           ↓
    User clicks "Generate Itinerary" button
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  2. API REQUEST (POST /api/itinerary/generate)                      │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
    Step 1-9: Validate form data
    Step 25: Generate workflowId
    Step 26: Calculate estimated completion time
    Step 27: Generate status endpoint URL
    Step 28-32: Enqueue Inngest workflow event
                           ↓
                 Returns immediately:
                 {
                   success: true,
                   workflowId: "workflow_xxx",
                   statusEndpoint: "/api/itinerary/status/{id}",
                   estimatedCompletion: "2025-10-03T..."
                 }
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  3. FRONTEND POLLING (GET /api/itinerary/status/{workflowId})       │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
    Frontend polls every 2 seconds for status updates
    Shows "Analyzing Banner" with loading animation
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. INNGEST WORKFLOW EXECUTION (Background Processing)               │
│     src/inngest/functions/itinerary.ts                              │
└─────────────────────────────────────────────────────────────────────┘

    Event Trigger: "itinerary.generate.requested"
                           ↓
    ┌──────────────────────────────────────────────────────┐
    │ Step 0: Initialize Workflow State                    │
    ├──────────────────────────────────────────────────────┤
    │ - Create initial state in Redis                      │
    │ - Status: "processing"                               │
    │ - Store formData and session info                    │
    │ - Log: Step 13 - WORKFLOW_STATE_INITIALIZATION       │
    └──────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────────┐
    │ Step 1: AI Itinerary Architect                       │
    │ (lib/ai/architectAI.ts)                              │
    ├──────────────────────────────────────────────────────┤
    │ - Build Grok prompt with form data                   │
    │ - Call xAI Grok model (grok-2-1212)                  │
    │ - Generate raw itinerary content                     │
    │ - Include Viator context if enabled                  │
    │ - Log: Step 15-16 - AI_ARCHITECT process             │
    │                                                       │
    │ Output: Raw itinerary JSON with:                     │
    │   - intro (trip overview)                            │
    │   - days (array of daily plans)                      │
    │   - tips (travel advice)                             │
    │   - mapPlaces (locations to map)                     │
    └──────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────────┐
    │ Step 2: Format Layout                                │
    │ (lib/ai/grokService.ts)                              │
    ├──────────────────────────────────────────────────────┤
    │ - Convert raw AI output to structured layout         │
    │ - Use Groq for layout formatting                     │
    │ - Model: openai/gpt-oss-120b                         │
    │ - Normalize day sections and tips                    │
    │ - Log: Step 30 - GROQ_LAYOUT_REQUEST                 │
    │                                                       │
    │ Output: Structured ItineraryLayout with:             │
    │   - content (formatted itinerary)                    │
    │   - metadata (model, timestamp, etc.)                │
    └──────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────────┐
    │ Step 3: Store in Redis                               │
    │ (lib/redis/stateStore.ts)                            │
    ├──────────────────────────────────────────────────────┤
    │ - Update workflow state with:                        │
    │   * status: "completed"                              │
    │   * layout (formatted itinerary)                     │
    │   * itinerary (raw AI output)                        │
    │   * updatedAt timestamp                              │
    │ - Log: Step 19-20 - STORE_ITINERARY_RESULT           │
    │                                                       │
    │ Optional: Store in vector DB for search              │
    │   (lib/redis/redis-vector.ts)                        │
    └──────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  5. FRONTEND RECEIVES RESULT                                         │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
    Status polling detects status: "completed"
    Retrieves full itinerary data
    Hides "Analyzing Banner"
                           ↓
    ┌──────────────────────────────────────────────────────┐
    │ Display Itinerary UI                                 │
    ├──────────────────────────────────────────────────────┤
    │ - Trip overview (intro section)                      │
    │ - Daily breakdown (day-by-day activities)            │
    │ - Travel tips (personalized advice)                  │
    │ - Interactive map (if mapPlaces provided)            │
    │ - Action buttons:                                    │
    │   * Modify Itinerary                                 │
    │   * Export as PDF                                    │
    │   * Email Itinerary                                  │
    └──────────────────────────────────────────────────────┘

```

---

## Detailed Workflow Steps (24-Step Process)

### Phase 1: Client-Side Validation & API Request (Steps 1-9)

| Step | Location | Function | Action |
|------|----------|----------|--------|
| 1 | `app/page.tsx` | `handleGenerateItinerary()` | User initiates generation |
| 2 | `app/page.tsx` | Request parsing | Parse and validate form data |
| 3 | `app/page.tsx` | Location validation | Verify destination is provided |
| 4 | `app/page.tsx` | Date validation | Verify start date and duration |
| 5 | `app/page.tsx` | Traveler validation | Verify adults/children counts |
| 6 | `app/page.tsx` | Budget validation | Verify budget amount and currency |
| 7 | `app/page.tsx` | Preferences validation | Verify groups, interests, inclusions |
| 8 | `app/page.tsx` | Nickname validation | Validate trip nickname if provided |
| 9 | `app/page.tsx` | Validation complete | All validations passed |

### Phase 2: API Route Processing (Steps 10-34)

| Step | Location | Function | Action |
|------|----------|----------|--------|
| 10 | `api/itinerary/generate/route.ts` | `POST` | API request received |
| 25 | `api/itinerary/generate/route.ts` | Workflow ID generation | Generate unique workflow identifier |
| 26 | `api/itinerary/generate/route.ts` | Time estimation | Calculate estimated completion |
| 27 | `api/itinerary/generate/route.ts` | Endpoint creation | Generate status polling URL |
| 28-29 | `api/itinerary/generate/route.ts` | Inngest enqueue | Send event to workflow queue |
| 30-32 | `api/itinerary/generate/route.ts` | Error handling | Handle enqueue failures |
| 33 | `api/itinerary/generate/route.ts` | State storage | Initial Redis state setup |
| 34 | `api/itinerary/generate/route.ts` | Response | Return success to client |

### Phase 3: Workflow Execution (Steps 11-24)

| Step | Location | Function | Action |
|------|----------|----------|--------|
| 11 | `inngest/functions/itinerary.ts` | `itineraryWorkflow` | Workflow triggered |
| 12 | `inngest/functions/itinerary.ts` | Event handler | Parse event data |
| 13 | `inngest/functions/itinerary.ts` | `initialize-workflow-state` | Create Redis state entry |
| 14 | `inngest/functions/itinerary.ts` | Workflow start | Log workflow initiation |
| 15 | `lib/ai/architectAI.ts` | `buildGrokItineraryPrompt()` | Build AI prompt |
| 16 | `lib/ai/architectAI.ts` | `generateGrokItineraryDraft()` | Call xAI Grok API |
| 17 | `lib/ai/architectAI.ts` | Response processing | Parse AI response |
| 18 | `lib/ai/grokService.ts` | `formatItineraryLayout()` | Format with Groq |
| 19 | `lib/redis/stateStore.ts` | `storeItineraryState()` | Save to Redis |
| 20 | `lib/redis/redis-vector.ts` | `storeItineraryForSearch()` | Optional vector storage |
| 21 | `inngest/functions/itinerary.ts` | Workflow complete | Log completion |
| 22 | `api/itinerary/status/[id]` | Status endpoint | Client polls for updates |
| 23 | `app/page.tsx` | `pollStatus()` | Frontend retrieves result |
| 24 | `app/page.tsx` | Display UI | Show itinerary to user |

---

## Data Flow Architecture

```
┌──────────────┐
│   Browser    │
│  (React UI)  │
└──────┬───────┘
       │
       │ 1. POST formData
       ↓
┌──────────────────────┐
│  Next.js API Route   │
│  /api/itinerary/     │
│     generate         │
└──────┬───────────────┘
       │
       │ 2. Enqueue event
       ↓
┌──────────────────────┐        ┌─────────────────┐
│   Inngest Server     │←───────│  Event Queue    │
│  (Workflow Engine)   │        │  (Background)   │
└──────┬───────────────┘        └─────────────────┘
       │
       │ 3. Execute workflow steps
       │
       ├─→ Call xAI Grok API ────→ ┌──────────────┐
       │                             │  Grok Model  │
       │                             │  (AI Gen)    │
       │   ←───── AI Response ───────└──────────────┘
       │
       ├─→ Call Groq API ─────────→ ┌──────────────┐
       │                             │  Groq Model  │
       │                             │  (Formatting)│
       │   ←───── Formatted ─────────└──────────────┘
       │
       │ 4. Store state
       ↓
┌──────────────────────┐
│  Upstash Redis       │
│  (State Storage)     │
│                      │
│  Key: workflow_xxx   │
│  Value: {            │
│    status,           │
│    formData,         │
│    itinerary,        │
│    layout,           │
│    updatedAt         │
│  }                   │
└──────┬───────────────┘
       │
       │ 5. Poll for status
       ↓
┌──────────────────────┐
│  Status API Route    │
│  /api/itinerary/     │
│    status/[id]       │
└──────┬───────────────┘
       │
       │ 6. Return result
       ↓
┌──────────────┐
│   Browser    │
│  Display UI  │
└──────────────┘
```

---

## Key Components & Their Roles

### Frontend (React/Next.js)

**File**: `src/app/page.tsx`

**Responsibilities**:
- Render trip planning form
- Validate user input (Steps 1-9)
- Submit generation request
- Poll for status updates
- Display generated itinerary
- Handle export/email actions

**Key State**:
```typescript
const [formData, setFormData] = useState<TripFormData>()
const [isGenerating, setIsGenerating] = useState(false)
const [workflowId, setWorkflowId] = useState<string>()
const [itineraryLayout, setItineraryLayout] = useState<ItineraryLayout>()
const [showAnalyzingBanner, setShowAnalyzingBanner] = useState(false)
```

---

### API Routes

#### 1. Generate Endpoint
**File**: `src/app/api/itinerary/generate/route.ts`

**Method**: `POST`

**Input**:
```typescript
{
  formData: TripFormData,
  sessionId?: string,
  options?: Record<string, any>
}
```

**Output**:
```typescript
{
  success: boolean,
  workflowId: string,
  estimatedCompletion: string,
  statusEndpoint: string,
  sessionId: string
}
```

**Process**:
1. Validate formData
2. Generate workflowId and sessionId
3. Send Inngest event: `"itinerary.generate.requested"`
4. Return immediately (async processing)

---

#### 2. Status Endpoint
**File**: `src/app/api/itinerary/status/[workflowId]/route.ts`

**Method**: `GET`

**Output**:
```typescript
{
  success: boolean,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  currentStep: string,
  itinerary?: ItineraryLayout,
  rawItinerary?: string,
  metadata?: LayoutMetadata,
  lastUpdated?: string
}
```

**Process**:
1. Fetch workflow state from Redis
2. Parse stored itinerary
3. Return current status and data

---

### Inngest Workflow

**File**: `src/inngest/functions/itinerary.ts`

**Function**: `itineraryWorkflow`

**Trigger Event**: `"itinerary.generate.requested"`

**Steps**:

```typescript
1. initialize-workflow-state
   └─→ Create Redis entry with status: "processing"

2. ai-itinerary-architect
   ├─→ Build prompt from formData
   ├─→ Call xAI Grok API (grok-2-1212)
   ├─→ Generate raw itinerary JSON
   └─→ Return { intro, days, tips, mapPlaces }

3. format-layout
   ├─→ Call Groq API (openai/gpt-oss-120b)
   ├─→ Format and structure content
   └─→ Return ItineraryLayout

4. store-itinerary
   ├─→ Update Redis state
   ├─→ Set status: "completed"
   ├─→ Store layout and raw itinerary
   └─→ Optional: Store in vector DB
```

**Configuration**:
```typescript
{
  id: 'itinerary.generate',
  name: 'Generate AI Itinerary',
  retries: 3
}
```

---

### AI Services

#### 1. Architect AI (Grok)
**File**: `src/lib/ai/architectAI.ts`

**Functions**:
- `buildGrokItineraryPrompt(formData)` - Creates detailed AI prompt
- `generateGrokItineraryDraft(params)` - Calls xAI API

**Model**: `grok-2-1212` or `grok-beta`

**Purpose**: Generate initial itinerary content based on user preferences

**Output Structure**:
```json
{
  "intro": "Welcome to Paris! Your 3-day adventure...",
  "days": [
    {
      "day": 1,
      "title": "Arrival & Eiffel Tower",
      "activities": [
        {
          "time": "10:00 AM",
          "activity": "Visit Eiffel Tower",
          "description": "...",
          "duration": "2 hours",
          "cost": "$25"
        }
      ]
    }
  ],
  "tips": [
    {
      "category": "Transportation",
      "tip": "Buy a Paris Visite pass..."
    }
  ],
  "mapPlaces": [
    {
      "name": "Eiffel Tower",
      "lat": 48.8584,
      "lng": 2.2945
    }
  ]
}
```

---

#### 2. Layout Formatter (Groq)
**File**: `src/lib/ai/grokService.ts`

**Function**: `formatItineraryLayout(params)`

**Model**: `openai/gpt-oss-120b`

**Purpose**: Format raw AI output into structured layout

**Process**:
1. Parse raw itinerary JSON
2. Normalize day sections
3. Format tips properly
4. Ensure consistent structure
5. Add metadata (model, timestamp)

---

### State Management (Redis)

**File**: `src/lib/redis/stateStore.ts`

**Key Functions**:

```typescript
// Store workflow state
storeItineraryState({
  workflowId: string,
  sessionId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  formData: TripFormData,
  itinerary?: any,
  layout?: ItineraryLayout,
  createdAt: string,
  updatedAt: string
})

// Retrieve workflow state
getItineraryState(workflowId: string)
```

**Redis Key Pattern**: `itinerary:state:{workflowId}`

**TTL**: Configurable (default: 24 hours)

---

## Console Logging System

Every step is logged with a consistent format:

```typescript
logger.log(
  stepNumber: number,        // 1-34
  eventCode: string,          // e.g., 'AI_ARCHITECT_STARTED'
  filename: string,           // e.g., 'itinerary.ts'
  functionName: string,       // e.g., 'aiItineraryArchitect'
  metadata?: object           // Additional context
)
```

**Example Output**:
```
Step 15: AI_ARCHITECT_STARTED in inngest/functions/itinerary.ts - aiItineraryArchitect
{
  workflowId: "workflow_1759395359131_2ewnu3r3z",
  destination: "Paris",
  adults: 2,
  children: 0
}
```

---

## Error Handling

### Workflow Retries
- **Inngest Retries**: 3 automatic retries on failure
- **Exponential Backoff**: Built into Inngest

### API Error Responses
```typescript
400: Validation errors (missing/invalid data)
404: Workflow not found
429: Rate limit exceeded
500: Internal server error
503: AI service unavailable
```

### Fallback Strategies
1. **AI Failure**: Return heuristic/template-based itinerary
2. **Layout Failure**: Use raw AI output without formatting
3. **Redis Failure**: Log error, return in-memory state

---

## Environment Configuration

**Required Secrets** (`.env.local`):

```bash
# AI Services
GROQ_API_KEY=gsk_xxx                    # Groq for layout formatting
GROQ_API_KEY_2=gsk_xxx                  # Backup Groq key
XAI_API_KEY=xai-xxx                     # xAI Grok for content generation

# Workflow Engine
INNGEST_EVENT_KEY=xxx                   # Inngest event key
INNGEST_SIGNING_KEY=signkey-prod-xxx    # Inngest signing key

# State Storage
UPSTASH_REDIS_REST_URL=https://xxx      # Redis URL
UPSTASH_REDIS_REST_TOKEN=xxx            # Redis token

# Optional Integrations
VIATOR_API_KEY=xxx                      # Viator tours/activities
EXA_API_KEY=xxx                         # Exa web search
TAVILY_API_KEY=xxx                      # Tavily research
```

---

## Performance Metrics

**Typical Generation Time**: 30-90 seconds

**Breakdown**:
- API Route Processing: 50-200ms
- AI Content Generation (Grok): 20-60 seconds
- Layout Formatting (Groq): 10-20 seconds
- Redis Storage: 10-50ms
- Total: 30-90 seconds

**Polling Strategy**:
- Interval: 2 seconds
- Max retries for 404: 15 attempts
- Timeout: ~30 seconds before showing error

---

## Data Models

### TripFormData
```typescript
{
  location: string;              // "Paris, France"
  startDate: string;             // "2025-10-15"
  duration: number;              // 3 (days)
  adults: number;                // 2
  children?: number;             // 0
  budget: number;                // 1500
  currency: string;              // "USD"
  budgetFlexible?: boolean;      // true
  groups?: string[];             // ["couple", "cultural"]
  interests?: string[];          // ["art", "food"]
  inclusions?: string[];         // ["skip-the-line"]
  tripNickname?: string;         // "Paris Honeymoon"
}
```

### ItineraryLayout
```typescript
{
  content: {
    intro: string;
    days: DaySection[];
    tips: TipSection[];
    mapPlaces?: MapPlace[];
  };
  metadata: {
    model: string;
    timestamp: string;
    workflowId: string;
  };
}
```

---

## Testing & Validation

### Manual Testing Checklist
1. ✅ Form validation works for all fields
2. ✅ Generation starts and returns workflowId
3. ✅ Status polling works correctly
4. ✅ Itinerary displays properly
5. ✅ All 24 console logs appear in order
6. ✅ Error handling works for failures
7. ✅ Export PDF functionality works
8. ✅ Email functionality works (if enabled)

### Success Criteria
- End-to-end generation completes successfully
- All console logs appear in correct order
- Itinerary is well-formatted and relevant
- No errors in browser or server console
- Performance is acceptable (<2 minutes)

---

## Future Enhancements

1. **Viator Integration**: Enrich itinerary with bookable tours
2. **Real-time Collaboration**: Multi-user itinerary editing
3. **Version History**: Save and compare itinerary versions
4. **AI Chat**: Conversational itinerary refinement
5. **Cost Estimation**: Detailed budget breakdown
6. **Weather Integration**: Real-time weather forecasts
7. **Custom Templates**: User-defined itinerary formats
8. **Social Sharing**: Share itineraries with friends

---

This workflow represents the complete journey from user input to generated itinerary, orchestrating multiple AI services, state management, and real-time updates to deliver a personalized travel planning experience.
