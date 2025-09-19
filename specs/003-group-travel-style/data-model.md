# Data Model: Group Travel Style Section with Conditional Display

**Feature**: 003-group-travel-style  
**Date**: September 19, 2025  
**Status**: Complete

## Core Entities

### TravelStyleChoice
**Purpose**: Represents the user's decision path for travel style preferences

**Type Definition**:
```typescript
enum TravelStyleChoice {
  NOT_SELECTED = 'not-selected',
  DETAILED = 'detailed', 
  SKIP = 'skip'
}
```

**States**:
- `NOT_SELECTED`: Initial state, choice buttons visible
- `DETAILED`: User chose detailed forms path, all preference forms displayed
- `SKIP`: User chose skip path, only nickname form displayed

**Transitions**:
- `NOT_SELECTED` → `DETAILED`: User clicks "I want to add answer more forms to suit my travel style"
- `NOT_SELECTED` → `SKIP`: User clicks "Skip ahead"
- No backward transitions (session-persistent choice)

### ConditionalDisplayState
**Purpose**: Manages the state of the conditional travel style section

**Fields**:
```typescript
interface ConditionalDisplayState {
  choice: TravelStyleChoice;
  showDetailedForms: boolean;
  showNicknameOnly: boolean;
  preservedFormData: Partial<TravelStyleData>;
  isChoiceMade: boolean;
}
```

**Relationships**:
- `choice` determines which forms are visible
- `showDetailedForms` = true when choice === 'DETAILED'
- `showNicknameOnly` = true when choice === 'SKIP'
- `preservedFormData` maintains user input during session

### ChoiceButtonConfig
**Purpose**: Configuration for choice buttons using GenerateItineraryButton template

**Fields**:
```typescript
interface ChoiceButtonConfig {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  isRecommended?: boolean;
  disabled?: boolean;
}
```

**Validation Rules**:
- `label` must be 5-50 characters
- `description` must be 10-100 characters
- `onClick` must be a valid function
- Only one button can have `isRecommended: true`

## Form Data Entities

### TravelStyleFormData
**Purpose**: Contains all travel style preference data (existing entity, referenced for completeness)

**Fields**:
```typescript
interface TravelStyleFormData {
  experience: string[];
  vibes: string[];
  vibesOther?: string;
  sampleDays: string[];
  dinnerChoices: string[];
  customTexts: Record<string, string>;
}
```

**Validation Rules** (existing Zod schemas):
- `experience`: minimum 1 selection
- `vibes`: minimum 1 selection  
- `sampleDays`: minimum 1 selection
- `dinnerChoices`: minimum 1 selection
- `customTexts`: optional key-value pairs

### TripNicknameData
**Purpose**: Trip nickname form data (existing entity, minimal modification)

**Fields**:
```typescript
interface TripNicknameData {
  tripNickname: string;
  contactInfo: ContactInfo;
}
```

**Validation Rules**:
- `tripNickname`: 3-50 characters, required for both paths

## Component State Models

### TravelStyleChoiceProps
**Purpose**: Props interface for the choice selection component

```typescript
interface TravelStyleChoiceProps {
  onChoiceSelect: (choice: TravelStyleChoice) => void;
  disabled?: boolean;
  className?: string;
}
```

### ConditionalTravelStyleProps
**Purpose**: Props interface for the main conditional container

```typescript
interface ConditionalTravelStyleProps {
  formData: any; // Existing form data structure
  onFormChange: (data: any) => void;
  selectedExperience: string[];
  onExperienceChange: (experience: string[]) => void;
  selectedVibes: string[];
  onVibeChange: (vibes: string[]) => void;
  customVibesText: string;
  onCustomVibesChange: (text: string) => void;
  selectedSampleDays: string[];
  onSampleDaysChange: (days: string[]) => void;
  dinnerChoices: string[];
  onDinnerChoicesChange: (choices: string[]) => void;
  tripNickname: string;
  onTripNicknameChange: (nickname: string) => void;
  contactInfo: any;
  onContactChange: (contact: any) => void;
}
```

## State Transitions

### Choice Selection Flow
```
Initial State: NOT_SELECTED
├── User clicks "Detailed" → DETAILED
│   ├── Show: Travel Experience Form
│   ├── Show: Trip Vibe Form  
│   ├── Show: Sample Days Form
│   ├── Show: Dinner Choice Form
│   └── Show: Trip Nickname Form + Generate Button
└── User clicks "Skip" → SKIP
    └── Show: Trip Nickname Form + Generate Button
```

### Data Preservation Rules
- All form inputs preserved during session (no loss on choice change)
- Choice state persists until page refresh
- Generate button functionality identical regardless of path

## Integration Points

### Existing App.tsx State
**Modified State Variables**:
- Add: `travelStyleChoice: TravelStyleChoice`
- Preserve: All existing form state variables
- Preserve: All existing event handlers

**New Event Handlers**:
```typescript
const handleTravelStyleChoice = (choice: TravelStyleChoice) => {
  setTravelStyleChoice(choice);
};
```

### Form Component Integration
**No Changes Required**:
- TravelExperience component
- TripVibe component
- SampleDays component
- DinnerChoice component
- TripNickname component
- GenerateItineraryButton component

**Integration Method**: Conditional rendering wrapper around existing components

## Validation Schema Extensions

### Choice Validation
```typescript
const travelStyleChoiceSchema = z.object({
  choice: z.enum(['not-selected', 'detailed', 'skip']),
});
```

### Conditional Form Validation
```typescript
const conditionalTravelStyleSchema = z.object({
  choice: travelStyleChoiceSchema,
  formData: z.when('choice', {
    is: 'detailed',
    then: travelStyleGroupSchema, // Existing schema
    otherwise: z.object({
      tripNickname: tripNicknameSchema // Only nickname required
    })
  })
});
```

## Performance Considerations

### Rendering Optimization
- Conditional components unmount when not selected (memory efficiency)
- State preservation prevents re-initialization costs
- Single choice state change minimizes re-renders

### Bundle Size Impact
- Estimated additional size: ~2KB (well within 200KB limit)
- No new external dependencies required
- Reuses existing component patterns

## Accessibility Model

### Keyboard Navigation
- Choice buttons accessible via tab navigation
- Screen reader labels for choice selection
- Focus management through conditional rendering

### ARIA Attributes
```typescript
// Choice buttons
role="button"
aria-label="Choose detailed travel style preferences"
aria-describedby="choice-description"

// Conditional sections  
role="region"
aria-label="Travel style preferences"
aria-expanded={choice !== 'NOT_SELECTED'}
```

---

**Data Model Status**: ✅ Complete - All entities, relationships, and validation rules defined for implementation