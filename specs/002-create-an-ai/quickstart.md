# Quickstart Guide: AI-Generated Personalized Itinerary

**Date**: 2025-09-27  
**Feature**: AI-Generated Personalized Itinerary  
**Target Audience**: Developers implementing and testing the feature

## Overview

This quickstart guide provides step-by-step instructions for implementing, testing, and validating the AI-generated personalized itinerary feature using incremental development methodology with manual testing in the development environment.

## Prerequisites

### Development Environment
- Node.js 18+ installed
- Next.js 14 project setup (existing)
- TypeScript configured
- Tailwind CSS available
- Vitest for testing
- Access to development environment

### Required API Keys
- **Groq API Key**: For xAI Grok access
- **Tavily API Key**: For real-time web scraping
- **Exa API Key**: For semantic search
- **SERP API Key**: For Google Maps Static API access
- **Inngest Account**: For workflow orchestration
- **Upstash Redis**: For state management

### Environment Variables
Create `.env.local` file with:
```bash
# AI Services
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
EXA_API_KEY=your_exa_api_key

# Maps
SERP_API_KEY=your_serp_api_key

# Workflow & Storage
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
KV_REST_API_URL=your_upstash_kv_url
KV_REST_API_TOKEN=your_upstash_kv_token

# Development
NODE_ENV=development
```

## Implementation Phase 1: Foundation Setup

### Step 1: Install Dependencies
```bash
# AI and workflow dependencies
npm install ai groq-sdk @inngest/sdk @upstash/redis

# Search and data sources
npm install tavily exa-js

# PDF generation and utilities
npm install jspdf html2canvas puppeteer

# Additional utilities
npm install zod date-fns uuid
```

### Step 2: Create Type Definitions
Create `types/itinerary.ts` with complete type definitions from data-model.md:

```typescript
// Copy all interfaces and enums from data-model.md
export interface TripFormData {
  // ... (refer to data-model.md for complete definition)
}

export interface Itinerary {
  // ... (refer to data-model.md for complete definition)  
}

// ... (include all other types)
```

### Step 3: Implement Console Logger
Create `utils/console-logger.ts`:

```typescript
interface LogEntry {
  stepNumber: number;
  action: string;
  fileName: string;
  functionName: string;
  timestamp: Date;
  data: Record<string, any>;
  duration?: number;
  status: 'Success' | 'Error' | 'Warning';
}

class ConsoleLogger {
  private static instance: ConsoleLogger;
  private logs: LogEntry[] = [];

  static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  log(
    stepNumber: number,
    action: string,
    fileName: string,
    functionName: string,
    data: Record<string, any> = {},
    status: 'Success' | 'Error' | 'Warning' = 'Success'
  ): void {
    const entry: LogEntry = {
      stepNumber,
      action,
      fileName,
      functionName,
      timestamp: new Date(),
      data,
      status
    };

    this.logs.push(entry);
    
    console.log(
      `Step ${stepNumber}: ${action} in ${fileName} - ${functionName}`,
      { data, timestamp: entry.timestamp }
    );
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = ConsoleLogger.getInstance();
```

## Implementation Phase 2: Core Services

### Step 4: Implement AI Service
Create `lib/ai/groqService.ts`:

```typescript
import { Groq } from 'groq-sdk';
import { logger } from '@/utils/console-logger';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateItinerary(formData: TripFormData): Promise<any> {
  logger.log(11, 'AI service initialization', 'lib/ai/groqService.ts', 'generateItinerary', { formData });
  
  try {
    // Implementation for xAI Grok via Groq
    const response = await groq.chat.completions.create({
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content: "You are a travel itinerary expert. Generate detailed, personalized travel itineraries."
        },
        {
          role: "user", 
          content: `Create a ${formData.plannedDays || 7}-day itinerary for ${formData.location} for ${formData.adults} adults and ${formData.children} children.`
        }
      ],
      temperature: 0.7
    });
    
    logger.log(11, 'AI service response received', 'lib/ai/groqService.ts', 'generateItinerary', { status: 'success' }, 'Success');
    return response.choices[0]?.message?.content;
  } catch (error) {
    logger.log(11, 'AI service error', 'lib/ai/groqService.ts', 'generateItinerary', { error: error.message }, 'Error');
    throw error;
  }
}
```

### Step 5: Update Form Handler
Modify existing `app/page.tsx` `handleGenerateItinerary` function:

```typescript
import { logger } from '@/utils/console-logger';

const handleGenerateItinerary = async () => {
  logger.log(1, 'Button click captured', 'app/page.tsx', 'handleGenerateItinerary', { formData });
  
  logger.log(2, 'Form validation begins', 'app/page.tsx', 'handleGenerateItinerary', { validationRules: 'applied' });
  
  // Existing validation logic with logging for steps 3-9
  
  if (validationErrors.length > 0) {
    logger.log(9, 'Validation failed', 'app/page.tsx', 'handleGenerateItinerary', { errors: validationErrors }, 'Error');
    return;
  }
  
  logger.log(9, 'Validation completed successfully', 'app/page.tsx', 'handleGenerateItinerary', { status: 'passed' });
  
  try {
    // Call API endpoint (to be implemented)
    const response = await fetch('/api/itinerary/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: completeFormData,
        sessionId: generateSessionId(),
        options: { enableDetailedLogging: true }
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Poll for completion
      pollItineraryStatus(result.workflowId);
    }
  } catch (error) {
    logger.log(24, 'Generation failed', 'app/page.tsx', 'handleGenerateItinerary', { error: error.message }, 'Error');
  }
};
```

## Testing Phase 1: Manual Validation

### Step 6: Manual Test Scenarios

#### Scenario 1: Complete Form Validation
1. Navigate to development server (`npm run dev`)
2. Fill out all form sections completely
3. Click "Generate Itinerary" button
4. **Expected**: Console shows Steps 1-9 with validation success
5. **Verify**: All required fields pass validation
6. **Check**: Form data is properly structured

#### Scenario 2: Incomplete Form Handling  
1. Leave required fields empty (location, dates, etc.)
2. Click "Generate Itinerary" button
3. **Expected**: Console shows validation errors in Steps 3-9
4. **Verify**: Appropriate error messages displayed
5. **Check**: User can correct errors and retry

#### Scenario 3: Console Logging Verification
1. Open browser developer tools Console tab
2. Complete a full form and submit
3. **Expected**: 24 sequential log entries with format:
   ```
   Step 1: Button click captured in app/page.tsx - handleGenerateItinerary
   Step 2: Form validation begins in app/page.tsx - handleGenerateItinerary
   ...
   ```
4. **Verify**: Each log includes timestamp and relevant data
5. **Check**: Log sequence is complete and ordered

### Step 7: Error Testing
1. **Invalid Location**: Enter empty or invalid location
2. **Invalid Dates**: Select past dates or invalid ranges  
3. **Invalid Travelers**: Set children without ages
4. **Invalid Budget**: Enter negative or zero budget
5. **Expected**: Each error logged with specific step number and error details

## Implementation Phase 3: API Endpoints

### Step 8: Create API Routes
Create the following API route files:

1. `app/api/itinerary/generate/route.ts`
2. `app/api/itinerary/status/[workflowId]/route.ts`
3. `app/api/itinerary/export/pdf/route.ts`
4. `app/api/itinerary/email/prepare/route.ts`
5. `app/api/ai/health/route.ts`
6. `app/api/maps/static/route.ts`

Each should implement the contracts defined in `contracts/api-contracts.md`.

### Step 9: Test API Endpoints
Use browser network tab or API testing tool:

```bash
# Test generation endpoint
curl -X POST http://localhost:3000/api/itinerary/generate \
  -H "Content-Type: application/json" \
  -d '{"formData": {...}, "sessionId": "test-123"}'

# Test status endpoint  
curl http://localhost:3000/api/itinerary/status/test-workflow-id

# Test health endpoint
curl http://localhost:3000/api/ai/health
```

**Expected Results**: 
- API endpoints respond with correct status codes
- Response schemas match contract specifications
- Error handling follows standard format

## Implementation Phase 4: UI Components

### Step 10: Create Itinerary Display Components
Create components in `components/itinerary/`:

1. `ItineraryDisplay.tsx` - Main container
2. `ItineraryHeader.tsx` - "YOUR PERSONALIZED ITINERARY"
3. `TripSummary.tsx` - Trip summary section
4. `KeyDetails.tsx` - Five horizontal details
5. `MapDisplay.tsx` - Location map
6. `DailyItinerary.tsx` - Daily activities
7. `TravelTips.tsx` - Travel tips
8. `ActionButtons.tsx` - Export/email buttons

### Step 11: Test UI Components
1. **Component Rendering**: Each component displays correctly
2. **Data Binding**: Form data populates display sections
3. **Responsive Design**: Layout works on mobile and desktop
4. **Interactive Elements**: Buttons are clickable and functional

## Testing Phase 2: Integration Validation

### Step 12: End-to-End Flow Testing

#### Complete Workflow Test:
1. Fill out complete travel form
2. Submit for itinerary generation
3. **Verify**: Console shows all 24 steps
4. **Check**: Processing completes successfully  
5. **Validate**: Itinerary displays with all 10 sections:
   - Header: "YOUR PERSONALIZED ITINERARY"
   - Trip Summary: "TRIP SUMMARY | [nickname]"
   - Five Key Details (horizontal)
   - Location Map
   - "🗓️ DAILY ITINERARY" section
   - Daily activities
   - "💡 TIPS FOR YOUR TRIP" section  
   - Generated tips
   - "❓ WHAT DO YOU WANT TO DO NEXT?" section
   - Three action buttons

### Step 13: Export Feature Testing
1. Generate complete itinerary
2. Click "⬇️ EXPORT IT AS A PDF" button
3. **Expected**: PDF generates with proper formatting
4. **Verify**: All itinerary sections included
5. **Check**: Download works correctly

### Step 14: Email Feature Testing  
1. Generate complete itinerary
2. Click "📧 EMAIL IT" button
3. **Expected**: Browser email client opens
4. **Verify**: Subject and body pre-populated
5. **Check**: Attachment included if requested

## Performance & Reliability Testing

### Step 15: Load Testing
1. **Multiple Requests**: Submit several itinerary requests
2. **Concurrent Users**: Test with multiple browser tabs
3. **Large Data Sets**: Test with maximum trip duration (31 days)
4. **Verify**: System handles load gracefully
5. **Check**: No memory leaks or performance degradation

### Step 16: Error Recovery Testing
1. **Network Interruptions**: Disconnect internet during processing
2. **API Failures**: Simulate AI service unavailability
3. **Invalid Responses**: Test with malformed API responses
4. **Verify**: Graceful error handling and user feedback
5. **Check**: System recovers after errors resolved

## Validation Checklist

### Functional Requirements ✓
- [ ] FR-001: Itinerary generated when button clicked
- [ ] FR-002: Header displays "YOUR PERSONALIZED ITINERARY"
- [ ] FR-003: Trip summary format correct
- [ ] FR-004: Five key details displayed horizontally
- [ ] FR-005-009: All detail sections populated correctly
- [ ] FR-010: Map image displays for location
- [ ] FR-011: Daily itinerary header present
- [ ] FR-012-013: Daily sections formatted correctly
- [ ] FR-014: AI activities and recommendations included
- [ ] FR-015-016: Travel tips section complete
- [ ] FR-017: "What do you want to do next?" section
- [ ] FR-018: Three action buttons functional
- [ ] FR-019: AI services integrated correctly
- [ ] FR-020: Data validation and cleansing working
- [ ] FR-021: Console logging complete (24 steps)
- [ ] FR-022: Async processing with Inngest/Redis

### Technical Requirements ✓
- [ ] xAI Grok via Groq integration working
- [ ] Tavily, Exa web scraping functional
- [ ] Google Maps Static API integration
- [ ] Inngest workflow orchestration
- [ ] Upstash Redis state management
- [ ] Client-side PDF generation
- [ ] Browser email client integration
- [ ] All 24 console log steps implemented

### User Experience ✓
- [ ] Form validation prevents invalid submissions
- [ ] Clear error messages for invalid data
- [ ] Processing indicators during generation
- [ ] Responsive design on all devices
- [ ] Export functions work reliably
- [ ] Performance acceptable (under 30 seconds total)

## Troubleshooting

### Common Issues
1. **API Keys Not Working**: Verify all environment variables set
2. **Console Logs Missing**: Check logger import and initialization
3. **AI Service Errors**: Verify Groq API key and quotas
4. **Map Not Displaying**: Check SERP API key and permissions
5. **PDF Export Fails**: Ensure client-side PDF libraries installed
6. **Workflow Timeout**: Check Inngest and Redis configuration

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network tab for API response codes  
3. Check server logs for backend errors
4. Validate environment variables
5. Test individual services separately

## Next Steps

After successful quickstart validation:

1. **Performance Optimization**: Cache frequently requested data
2. **Enhanced Error Handling**: Add retry mechanisms
3. **Advanced Features**: User customization options
4. **Analytics**: Track usage patterns and errors
5. **Documentation**: User-facing help and guides

## Success Criteria

**Quickstart Complete When**:
✅ All 22 functional requirements validated  
✅ 24-step console logging working correctly  
✅ End-to-end workflow generates complete itinerary  
✅ Export and email functions operational  
✅ Error handling graceful and informative  
✅ Performance meets acceptable standards  
✅ Manual testing confirms all user scenarios  

**Ready for**: Production deployment planning and advanced feature development