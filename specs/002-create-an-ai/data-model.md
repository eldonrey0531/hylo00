# Data Model: AI-Generated Personalized Itinerary

**Date**: 2025-09-27  
**Feature**: AI-Generated Personalized Itinerary  
**Phase**: 1 - Design & Contracts

## Entity Definitions

### Core Entities

#### Itinerary
**Purpose**: Complete travel plan containing all sections and generated content

**Fields**:
- `id: string` - Unique identifier for the itinerary
- `tripNickname: string` - User-provided trip name
- `generatedAt: Date` - Timestamp of generation
- `status: ItineraryStatus` - Current processing status
- `tripSummary: TripSummary` - Trip overview information
- `keyDetails: KeyDetails` - Five key detail sections
- `mapImageUrl: string` - Generated map image URL
- `dailyItinerary: DailyActivity[]` - Day-by-day activities
- `travelTips: TravelTip[]` - Personalized travel advice
- `metadata: ItineraryMetadata` - Processing and logging metadata

**Relationships**:
- Contains one TripSummary
- Contains one KeyDetails
- Contains multiple DailyActivity instances
- Contains multiple TravelTip instances
- References source TripFormData

**Validation Rules**:
- tripNickname: minimum 3 characters, maximum 100 characters
- dailyItinerary: must have at least 1 day, maximum 31 days
- travelTips: must have at least 3 tips, maximum 20 tips
- mapImageUrl: valid URL format

#### TripFormData
**Purpose**: Input data collected from user forms

**Fields**:
- `location: string` - Destination location
- `departDate: string | null` - Departure date (ISO string)
- `returnDate: string | null` - Return date (ISO string)
- `flexibleDates: boolean` - Whether dates are flexible
- `plannedDays: number | null` - Number of planned days if flexible
- `adults: number` - Number of adult travelers
- `children: number` - Number of child travelers
- `childrenAges: number[]` - Ages of children
- `budget: number` - Budget amount
- `currency: Currency` - Budget currency
- `budgetMode: BudgetMode` - Total or per-person budget
- `flexibleBudget: boolean` - Whether budget is flexible
- `selectedGroups: string[]` - Selected travel groups
- `customGroupText: string | null` - Custom group description
- `selectedInterests: string[]` - Selected travel interests
- `customInterestsText: string | null` - Custom interest description
- `selectedInclusions: string[]` - Selected itinerary inclusions
- `customInclusionsText: string | null` - Custom inclusion description
- `inclusionPreferences: Record<string, any>` - Inclusion preferences
- `travelStyleAnswers: Record<string, any>` - Travel style responses
- `contactInfo: ContactInfo` - Contact information

**Relationships**:
- Source for Itinerary generation
- References multiple preference selections

**Validation Rules**:
- location: required, minimum 1 character, maximum 100 characters
- adults: minimum 1, maximum 10
- children: minimum 0, maximum 10
- childrenAges: length must match children count, ages 0-17
- budget: minimum 0, maximum 10000
- plannedDays: minimum 1, maximum 31 (if flexible dates)

#### TripSummary
**Purpose**: Key trip information displayed in summary section

**Fields**:
- `tripNickname: string` - Display name for the trip
- `destination: string` - Formatted destination name
- `dateDisplay: string` - Formatted date range or day count
- `travelerCount: string` - Formatted traveler information
- `budgetDisplay: string` - Formatted budget information
- `contactName: string` - Prepared for contact name

**Relationships**:
- Child of Itinerary
- Derived from TripFormData

**Validation Rules**:
- All fields required and non-empty
- dateDisplay: follows "Day 1, Day 2..." or "MM/DD - MM/DD" format
- travelerCount: includes adult and children counts
- budgetDisplay: shows currency, amount, mode or "Budget is flexible"

#### KeyDetails
**Purpose**: Five horizontal key detail sections

**Fields**:
- `destination: string` - Location information
- `dates: string` - Date information
- `travelers: string` - Traveler composition
- `budget: string` - Budget information
- `preparedFor: string` - Contact information

**Relationships**:
- Child of Itinerary
- Derived from TripFormData

**Validation Rules**:
- All fields required and non-empty
- Format matches specification requirements

#### DailyActivity
**Purpose**: Individual day's planned activities and recommendations

**Fields**:
- `dayNumber: number` - Day sequence (1-based)
- `dateDisplay: string` - Date or "Day X" format
- `activities: Activity[]` - List of recommended activities
- `timeSlots: TimeSlot[]` - Scheduled time slots
- `tips: string[]` - Day-specific tips
- `estimatedCost: number | null` - Daily cost estimate
- `notes: string | null` - Additional notes

**Relationships**:
- Child of Itinerary
- Contains multiple Activity instances
- Contains multiple TimeSlot instances

**Validation Rules**:
- dayNumber: positive integer, unique within itinerary
- activities: minimum 3 activities, maximum 10 per day
- dateDisplay: consistent with itinerary date format

#### Activity
**Purpose**: Specific activity or attraction recommendation

**Fields**:
- `name: string` - Activity name
- `description: string` - Activity description
- `category: ActivityCategory` - Type of activity
- `duration: string` - Estimated duration
- `cost: string` - Cost information
- `location: string` - Specific location
- `bookingRequired: boolean` - Whether advance booking needed
- `ageAppropriate: string[]` - Age groups suitable for
- `weatherDependent: boolean` - Weather considerations
- `priority: Priority` - Importance level

**Relationships**:
- Child of DailyActivity
- May reference external booking systems

**Validation Rules**:
- name: required, maximum 200 characters
- description: required, maximum 500 characters
- duration: valid time format (e.g., "2 hours", "Half day")
- priority: must be "High", "Medium", or "Low"

#### TravelTip
**Purpose**: Personalized advice based on trip characteristics

**Fields**:
- `category: TipCategory` - Type of tip
- `title: string` - Tip headline
- `content: string` - Tip description
- `applicability: string[]` - When this tip applies
- `priority: Priority` - Importance level
- `source: string` - Information source

**Relationships**:
- Child of Itinerary
- May reference specific locations or activities

**Validation Rules**:
- title: required, maximum 100 characters
- content: required, maximum 300 characters
- category: must be valid TipCategory value

#### ConsoleLogEntry
**Purpose**: Tracking record for processing steps

**Fields**:
- `stepNumber: number` - Sequential step (1-24)
- `action: string` - Description of action
- `fileName: string` - Source file name
- `functionName: string` - Function name
- `timestamp: Date` - When step occurred
- `data: Record<string, any>` - Step-specific data
- `duration: number | null` - Processing time in ms
- `status: LogStatus` - Success, Error, or Warning

**Relationships**:
- Child of ItineraryMetadata
- References processing steps

**Validation Rules**:
- stepNumber: 1-24, unique within session
- action, fileName, functionName: required strings
- status: must be "Success", "Error", or "Warning"

## Type Definitions

### Enums

```typescript
enum Currency {
  USD = 'USD',
  EUR = 'EUR', 
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD'
}

enum BudgetMode {
  TOTAL = 'total',
  PER_PERSON = 'per-person'
}

enum ItineraryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

enum ActivityCategory {
  SIGHTSEEING = 'sightseeing',
  DINING = 'dining',
  ENTERTAINMENT = 'entertainment',
  NATURE = 'nature',
  CULTURE = 'culture',
  ADVENTURE = 'adventure',
  RELAXATION = 'relaxation',
  SHOPPING = 'shopping',
  TRANSPORT = 'transport'
}

enum TipCategory {
  PACKING = 'packing',
  TRANSPORTATION = 'transportation',
  DINING = 'dining',
  SAFETY = 'safety',
  CULTURE = 'culture',
  BUDGET = 'budget',
  WEATHER = 'weather',
  HEALTH = 'health'
}

enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium', 
  LOW = 'Low'
}

enum LogStatus {
  SUCCESS = 'Success',
  ERROR = 'Error',
  WARNING = 'Warning'
}
```

### Supporting Types

```typescript
interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
}

interface ItineraryMetadata {
  processingStartTime: Date;
  processingEndTime?: Date;
  totalDuration?: number;
  aiModel: string;
  dataSourcesUsed: string[];
  logEntries: ConsoleLogEntry[];
  errors: string[];
  warnings: string[];
}
```

## State Transitions

### Itinerary Processing Flow
1. **PENDING** → Button clicked, initial validation
2. **PROCESSING** → AI generation in progress
3. **COMPLETE** → Successfully generated and displayed
4. **ERROR** → Processing failed, error displayed

### Form Data States
1. **Draft** → User filling out forms
2. **Validated** → Passes all validation rules
3. **Submitted** → Sent for AI processing
4. **Processed** → Used in itinerary generation

## Data Relationships

```
TripFormData (1) → generates → (1) Itinerary
Itinerary (1) → contains → (1) TripSummary
Itinerary (1) → contains → (1) KeyDetails  
Itinerary (1) → contains → (1-31) DailyActivity
Itinerary (1) → contains → (3-20) TravelTip
DailyActivity (1) → contains → (3-10) Activity
Itinerary (1) → contains → (1) ItineraryMetadata
ItineraryMetadata (1) → contains → (1-24) ConsoleLogEntry
```

## Data Volume Estimates

- **Forms per session**: 1
- **Itineraries per session**: 1  
- **Daily activities**: 1-31 per itinerary
- **Activities per day**: 3-10
- **Travel tips**: 3-20 per itinerary
- **Console log entries**: 24 per generation
- **Storage duration**: Session-based (temporary)

## Validation Summary

All entities include comprehensive validation rules covering:
- Field requirements and constraints
- Data type validation  
- Range and length limits
- Format specifications
- Cross-field dependencies
- Business rule enforcement

## Implementation Notes

- All timestamps use ISO 8601 format
- Currency amounts stored as numbers with specified currency
- Location strings support international place names
- Date handling accommodates flexible vs. fixed scheduling
- Error handling preserves user data during failures
- Console logging maintains complete audit trail