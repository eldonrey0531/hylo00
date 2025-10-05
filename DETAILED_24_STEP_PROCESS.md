# Complete 24-Step Itinerary Generation Process

## Overview

Your system has **ONE Inngest function** (`itineraryWorkflow`) that orchestrates the entire AI itinerary generation process through **4 internal steps**, while the complete end-to-end flow spans **24 logged steps** across multiple components.

---

## The Single Inngest Function

```typescript
// src/inngest/functions/itinerary.ts
export const itineraryWorkflow = inngest.createFunction(
  {
    id: 'itinerary.generate',
    name: 'Generate AI Itinerary',
    retries: 3,
  },
  { event: 'itinerary.generate.requested' },
  async ({ event, step }) => {
    // 4 internal steps executed here
  }
);
```

**Trigger**: Event `"itinerary.generate.requested"`  
**Internal Steps**: 4 (using `step.run()`)  
**Retries**: 3 automatic retries on failure

---

## Complete 24-Step Flow Breakdown

### 🖥️ **PHASE 1: Frontend Validation (Steps 1-9)**
*Location: `src/app/page.tsx`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **1** | `USER_INITIATED_GENERATION` | `handleGenerateItinerary()` | User clicks "Generate Itinerary" button |
| **2** | `REQUEST_PARSING` | Form validation | Parse and validate form data structure |
| **3** | `LOCATION_VALIDATION` | Location check | Verify destination is provided and valid |
| **4** | `DATE_VALIDATION` | Date check | Verify start date and duration are set |
| **5** | `TRAVELER_VALIDATION` | Traveler check | Verify adults/children counts are valid |
| **6** | `BUDGET_VALIDATION` | Budget check | Verify budget amount and currency |
| **7** | `PREFERENCES_VALIDATION` | Preferences check | Verify groups, interests, inclusions |
| **8** | `NICKNAME_VALIDATION` | Nickname check | Validate trip nickname if provided |
| **9** | `VALIDATION_COMPLETE` | Validation summary | All client-side validations passed |

**Output**: Clean `formData` object ready for API

---

### 🌐 **PHASE 2: API Request & Queue (Steps 10-34)**
*Location: `src/app/api/itinerary/generate/route.ts`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **10** | `API_REQUEST_RECEIVED` | `POST` handler | API route receives generation request |
| **11** | `REQUEST_BODY_PARSED` | Request parsing | Parse JSON body with formData |
| **12** | `FORM_DATA_VALIDATED` | Server validation | Validate formData exists and is valid |
| **13** | `SESSION_ID_GENERATED` | ID generation | Generate or use provided sessionId |
| **14** | `FORM_DATA_LOGGED` | Data logging | Log location, adults, budget details |
| **25** | `WORKFLOW_ID_GENERATED` | ID generation | Generate unique `workflow_xxx` ID |
| **26** | `ESTIMATED_COMPLETION_CALCULATED` | Time calculation | Calculate estimated completion time (+3 min) |
| **27** | `STATUS_ENDPOINT_GENERATED` | URL creation | Create status polling endpoint URL |
| **28** | `WORKFLOW_ENQUEUE_STARTING` | Inngest trigger | Prepare to send Inngest event |
| **29** | `WORKFLOW_ENQUEUED_SUCCESSFULLY` | Event sent | Successfully sent `itinerary.generate.requested` event |
| **30-32** | `WORKFLOW_ENQUEUE_ERROR_HANDLING` | Error handling | Handle enqueue failures if any |
| **33** | `WORKFLOW_STATE_STORAGE` | State initialization | Log state storage simulation |
| **34** | `API_REQUEST_COMPLETED` | Response sent | Return success response to client |

**Output**: 
```json
{
  "success": true,
  "workflowId": "workflow_1759395359131_2ewnu3r3z",
  "statusEndpoint": "/api/itinerary/status/...",
  "estimatedCompletion": "2025-10-03T15:03:00Z",
  "sessionId": "session_xxx"
}
```

---

### ⚙️ **PHASE 3: Inngest Workflow Execution (Steps 11-21)**
*Location: `src/inngest/functions/itinerary.ts`*

This is where **your single Inngest function** executes its **4 internal steps**:

#### **Internal Step 0: Initialize Workflow State**
*Step label: `'initialize-workflow-state'`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **11** | `INNGEST_WORKFLOW_STARTED` | Workflow entry | Inngest function triggered by event |
| **12** | `WORKFLOW_EVENT_PARSED` | Event handler | Extract formData, sessionId, workflowId from event |
| **13** | `WORKFLOW_STATE_INITIALIZATION_STARTED` | State init | Create initial Redis state entry |
| **13** | `WORKFLOW_STATE_INITIALIZATION_RESULT` | State stored | Redis state created with status: "processing" |

**Code**:
```typescript
await step.run('initialize-workflow-state', async () => {
  logger.log(13, 'WORKFLOW_STATE_INITIALIZATION_STARTED', ...);
  
  const initialized = await stateStore.storeItineraryState({
    workflowId,
    sessionId,
    status: 'processing',
    formData,
    itinerary: undefined,
    rawItinerary: undefined,
    createdAt: workflowCreatedAt,
    updatedAt: workflowCreatedAt,
  });
  
  logger.log(13, 'WORKFLOW_STATE_INITIALIZATION_RESULT', ...);
});
```

**Purpose**: Create Redis entry so status polling can find the workflow immediately

---

#### **Internal Step 1: AI Itinerary Architect**
*Step label: `'ai-itinerary-architect'`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **14** | `INNGEST_WORKFLOW_STARTED` | Workflow start | Log workflow initiation details |
| **15** | `AI_ARCHITECT_STARTED` | AI processing | Start AI itinerary generation |
| **15** | `AI_PROMPT_PREVIEW` | Prompt logging | Log the AI prompt (first 1200 chars) |
| **15** | `XAI_MODEL_INITIALIZED` | Model setup | Initialize Grok model (grok-4-fast-reasoning) |
| **15** | `XAI_REQUEST_DISPATCHED` | API call | Send request to xAI Grok API |
| **15** | `VIATOR_CONTEXT_SKIPPED` | Context check | Log that Viator integration is disabled |
| **16** | `XAI_RESPONSE_METADATA` | Response received | Log AI response metadata (tokens, latency, etc.) |
| **16** | `XAI_RESPONSE_FALLBACK_USED` | Fallback check | Log if fallback was used (optional) |
| **16** | `AI_RESPONSE_OUTPUT` | AI output | Log the raw AI response |
| **16** | `AI_ARCHITECT_COMPLETED` | AI complete | Log completion with duration and stats |
| **17** | `AI_ARCHITECT_FAILED` | Error handling | Log error if AI generation fails |

**Code**:
```typescript
const aiArchitectResult = await step.run('ai-itinerary-architect', async () => {
  logger.log(15, 'AI_ARCHITECT_STARTED', ...);
  
  // Build prompt
  const prompt = buildGrokItineraryPrompt(formData);
  logger.log(15, 'AI_PROMPT_PREVIEW', ...);
  
  // Initialize model
  const modelName = 'grok-4-fast-reasoning';
  logger.log(15, 'XAI_MODEL_INITIALIZED', ...);
  
  // Call AI
  logger.log(15, 'XAI_REQUEST_DISPATCHED', ...);
  const draft = await generateGrokItineraryDraft({ prompt, formData, model: modelName });
  
  // Process response
  logger.log(16, 'XAI_RESPONSE_METADATA', ...);
  logger.log(16, 'AI_RESPONSE_OUTPUT', ...);
  
  // Normalize structure
  const normalizedItinerary = normalizeItineraryStructure(
    enhanceItineraryWithTravelTips(draft.itinerary, formData),
    formData
  );
  
  logger.log(16, 'AI_ARCHITECT_COMPLETED', ...);
  
  return {
    itinerary: normalizedItinerary,
    creationProcess: draft.creationProcess,
    rawOutput: draft.rawOutput,
    cleanedJson: JSON.stringify(normalizedPayload, null, 2)
  };
});
```

**Functions Called**:
- `buildGrokItineraryPrompt()` - Creates detailed AI prompt
- `generateGrokItineraryDraft()` - Calls xAI Grok API
- `normalizeItineraryStructure()` - Normalizes day structure
- `enhanceItineraryWithTravelTips()` - Adds/enhances travel tips

**Output**: Structured itinerary with intro, days, tips, mapPlaces

---

#### **Internal Step 2: Store Itinerary**
*Step label: `'store-itinerary'`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **18** | `GROQ_LAYOUT_REQUEST_DISPATCHED` | Layout formatting | Format itinerary layout with Groq |
| **19** | `STORE_ITINERARY_RESULT` | Redis storage | Store complete itinerary in Redis |
| **20** | `REDIS_STORAGE_STARTED` | Storage init | Begin Redis storage process |

**Code**:
```typescript
await step.run('store-itinerary', async () => {
  logger.log(20, 'REDIS_STORAGE_STARTED', ...);
  
  // Format layout using Groq
  const layoutResult = await formatItineraryLayout({
    workflowId,
    itinerary: aiArchitectResult.itinerary,
    rawContent: aiArchitectResult.rawOutput,
    formData
  });
  
  // Store in Redis
  const stored = await stateStore.storeItineraryState({
    workflowId,
    sessionId,
    status: 'completed',  // Mark as completed!
    formData,
    itinerary: aiArchitectResult.itinerary,
    creationProcess: aiArchitectResult.creationProcess,
    rawItinerary: aiArchitectResult.cleanedJson,
    layout: {
      model: layoutResult.model,
      usedGroq: layoutResult.usedGroq,
      content: layoutResult.layout,
      rawText: layoutResult.rawText
    },
    createdAt: workflowCreatedAt,
    updatedAt: new Date().toISOString()
  });
  
  logger.log(19, 'STORE_ITINERARY_RESULT', ...);
  
  return { stored };
});
```

**Functions Called**:
- `formatItineraryLayout()` - Formats with Groq AI (optional)
- `stateStore.storeItineraryState()` - Saves to Redis

**Redis Key**: `itinerary:state:{workflowId}`

**Stored Data**:
```json
{
  "workflowId": "workflow_xxx",
  "sessionId": "session_xxx",
  "status": "completed",
  "formData": { ... },
  "itinerary": { intro, days, tips, mapPlaces },
  "layout": { model, content, rawText },
  "rawItinerary": "stringified JSON",
  "createdAt": "2025-10-03T...",
  "updatedAt": "2025-10-03T..."
}
```

---

#### **Internal Step 3: Store Search Data**
*Step label: `'store-search-data'`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **20** | `SEARCH_DATA_STORAGE_RESULT` | Vector storage | Store in Redis vector DB for search |

**Code**:
```typescript
await step.run('store-search-data', async () => {
  try {
    const destinationName = pickDestinationName(formData);
    const durationDays = calculateTripDuration(formData);
    const { activities, preferences } = collectPreferenceSignals(formData);
    
    const searchStored = await storeItineraryForSearch(workflowId, {
      destination: destinationName,
      duration: durationDays,
      budget: buildBudgetLabel(formData),
      activities,
      preferences,
      itinerary: aiArchitectResult.itinerary,
      timestamp: new Date().toISOString()
    });
    
    logger.log(20, 'SEARCH_DATA_STORAGE_RESULT', ...);
    return { searchStored };
  } catch (searchError) {
    logger.error(20, 'SEARCH_DATA_STORAGE_FAILED', ...);
    return { searchStored: false };
  }
});
```

**Purpose**: Store itinerary metadata in vector database for semantic search (optional feature)

---

#### **Internal Step 4: Save File Log**
*Step label: `'save-file-log'`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **19** | `AI_OUTPUT_SAVED_TO_FILE` | File logging | Save AI output to logs folder (dev only) |
| **19** | `AI_OUTPUT_FILE_SAVE_FAILED` | Error handling | Log if file save fails |
| **19** | `AI_OUTPUT_FILE_LOGGING_SKIPPED` | Production skip | Skip file logging in production |
| **21** | `INNGEST_WORKFLOW_COMPLETED` | Workflow complete | Log workflow completion |

**Code**:
```typescript
await step.run('save-file-log', async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(process.cwd(), 'logs');
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const outputFile = path.join(logDir, `${workflowId}.json`);
      const completeOutput = {
        aiArchitectResult,
        workflowId,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync(outputFile, JSON.stringify(completeOutput, null, 2));
      logger.log(19, 'AI_OUTPUT_SAVED_TO_FILE', ...);
      
      return { fileSaved: true, outputFile };
    } catch (fileError) {
      logger.warn(19, 'AI_OUTPUT_FILE_SAVE_FAILED', ...);
      return { fileSaved: false };
    }
  } else {
    logger.log(19, 'AI_OUTPUT_FILE_LOGGING_SKIPPED', ...);
    return { fileSaved: false, reason: 'production' };
  }
});

logger.log(21, 'INNGEST_WORKFLOW_COMPLETED', ...);

return {
  success: true,
  workflowId,
  itinerary: aiArchitectResult.cleanedJson
};
```

**File Location**: `logs/workflow_{workflowId}.json` (development only)

---

### 🔄 **PHASE 4: Status Polling (Steps 22-24)**
*Location: `src/app/page.tsx` and `src/app/api/itinerary/status/[workflowId]/route.ts`*

| Step | Event Code | Function | Description |
|------|-----------|----------|-------------|
| **22** | `STATUS_POLL_REQUEST` | `pollStatus()` | Frontend polls status endpoint every 2 seconds |
| **22** | `STATUS_ENDPOINT_CALLED` | API route | GET `/api/itinerary/status/{workflowId}` |
| **22** | `REDIS_STATE_RETRIEVED` | State fetch | Fetch workflow state from Redis |
| **22** | `ITINERARY_PARSED` | JSON parsing | Parse stored itinerary JSON |
| **23** | `STATUS_RESPONSE_SENT` | Response | Return status and itinerary to client |
| **23** | `FRONTEND_RECEIVED_RESULT` | Client update | Frontend receives completed itinerary |
| **24** | `ITINERARY_DISPLAYED` | UI render | Display itinerary to user |

**Status Polling Code** (`src/app/page.tsx`):
```typescript
const pollStatus = async (wfId: string) => {
  if (!wfId || activeWorkflowIdRef.current !== wfId) return;
  
  try {
    const response = await fetch(`/api/itinerary/status/${wfId}`);
    const statusData = await response.json();
    
    console.log('Status check:', statusData);
    
    if (statusData.status === 'completed' && statusData.itinerary) {
      // Display itinerary
      setItineraryLayout(statusData.itinerary);
      setRawItinerary(statusData.rawItinerary);
      setLayoutMetadata(statusData.metadata);
      setIsGenerating(false);
      setShowAnalyzingBanner(false);
    } else if (statusData.status === 'failed') {
      // Handle error
      alert('Itinerary generation failed');
      setIsGenerating(false);
    } else {
      // Continue polling
      scheduleNextPoll(wfId);
    }
  } catch (error) {
    console.error('Status poll error:', error);
  }
};
```

**Status API Response**:
```json
{
  "success": true,
  "status": "completed",
  "currentStep": "Itinerary generation complete",
  "itinerary": { /* ItineraryLayout */ },
  "rawItinerary": "{ /* JSON string */ }",
  "metadata": {
    "model": "grok-4-fast-reasoning",
    "timestamp": "2025-10-03T..."
  },
  "lastUpdated": "2025-10-03T..."
}
```

---

## Visual Flow of the Single Function

```
┌─────────────────────────────────────────────────────────────┐
│  INNGEST FUNCTION: itineraryWorkflow                        │
│  (ONE function with 4 internal steps)                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────┐
    │ Event Trigger: "itinerary.generate.requested"    │
    │ Input: { formData, sessionId, workflowId }       │
    └──────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────┐
    │ STEP 0: initialize-workflow-state                │
    │ - Create Redis entry (status: "processing")      │
    │ - Log: Step 13                                   │
    └──────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────┐
    │ STEP 1: ai-itinerary-architect                   │
    │ - Build AI prompt                                │
    │ - Call xAI Grok API                              │
    │ - Parse and normalize response                   │
    │ - Log: Steps 14-17                               │
    │ Output: { itinerary, creationProcess, rawOutput }│
    └──────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────┐
    │ STEP 2: store-itinerary                          │
    │ - Format layout with Groq (optional)             │
    │ - Update Redis (status: "completed")             │
    │ - Store full itinerary + layout                  │
    │ - Log: Steps 18-20                               │
    └──────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────┐
    │ STEP 3: store-search-data                        │
    │ - Extract metadata (destination, duration, etc.) │
    │ - Store in vector DB for search                  │
    │ - Log: Step 20                                   │
    └──────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────┐
    │ STEP 4: save-file-log                            │
    │ - Save to logs/workflow_{id}.json (dev only)     │
    │ - Log: Step 19                                   │
    │ - Log: Step 21 (workflow complete)               │
    └──────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────┐
    │ Return: { success, workflowId, itinerary }       │
    └──────────────────────────────────────────────────┘
```

---

## Summary

### You Have:
✅ **1 Inngest Function**: `itineraryWorkflow`  
✅ **4 Internal Steps**: Using `step.run()`  
✅ **24 Total Logged Steps**: Across frontend, API, and workflow  
✅ **3 Automatic Retries**: Built-in fault tolerance  

### The 4 Internal Steps Are:
1. **`initialize-workflow-state`** - Create Redis state entry
2. **`ai-itinerary-architect`** - Generate itinerary with AI
3. **`store-itinerary`** - Save to Redis with layout
4. **`store-search-data`** - Store search metadata (optional)
5. **`save-file-log`** - Save to file (dev only)

### Step Numbering Explained:
- **Steps 1-9**: Frontend validation
- **Steps 10-34**: API route processing
- **Steps 11-21**: Inngest workflow execution
- **Steps 22-24**: Status polling and display

Some step numbers overlap because they represent parallel concerns (e.g., Step 13 appears in both API and workflow phases for different purposes).

The beauty of this design is that **one Inngest function** orchestrates the complex AI generation process while maintaining clear separation of concerns through internal steps with automatic retries and state management! 🎯
