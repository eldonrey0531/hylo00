# Data Model: Travel Style Styling Components

**Feature**: 004-fix-travel-style  
**Phase**: 1 - Design & Contracts  
**Date**: September 19, 2025

## UI Component Styling States

### TravelStyleSection Entity
**Purpose**: Container component managing visual styling for travel style section

**Styling Attributes**:
- `containerBackground`: "#b0c29b" (bg-trip-details token)
- `textColor`: "#406170" (text-primary token) 
- `borderRadius`: "36px" (rounded-[36px])
- `padding`: "24px" (p-6)
- `isVisible`: boolean (always true when rendered)

**State Transitions**:
- `NOT_SELECTED` → Container with choice buttons
- `DETAILED` → Container with all travel style forms
- `SKIP` → Container with nickname form only

**Validation Rules**:
- MUST use bg-trip-details background (#b0c29b)
- MUST NOT use bg-primary background (#406170) 
- MUST maintain background across all choice states
- MUST preserve text readability with proper contrast

### TravelStyleForm Entity
**Purpose**: Individual form components within travel style section

**Styling Attributes**:
- `formBackground`: "#ece8de" (bg-form-box token)
- `borderColor`: "#406170" (border-primary token)
- `textColor`: "#406170" (text-primary token)
- `borderRadius`: "36px" (rounded-[36px])
- `isPreserved`: boolean (must remain true)

**Relationships**:
- **Contained by**: TravelStyleSection (parent container)
- **Includes**: TravelExperience, TripVibe, SampleDays, DinnerChoice, TripNickname forms

**Validation Rules**:
- MUST preserve existing bg-form-box styling (#ece8de)
- MUST maintain individual form component integrity
- MUST NOT inherit container background color
- MUST remain visually distinct from container

### GenerateButton Entity  
**Purpose**: Action button for itinerary generation with duplication prevention

**Styling Attributes**:
- `isVisible`: boolean (context-dependent)
- `isDuplicate`: boolean (must be false)
- `placement`: "after-choice" | "before-choice"

**State Rules**:
- MUST NOT appear before travel style choice selection
- MUST appear only once per logical section
- MUST maintain existing button styling when visible

**Validation Rules**:
- ONLY one GenerateItineraryButton instance per form flow
- MUST be positioned after travel style choice interaction
- MUST preserve existing accessibility and interaction patterns

## Background Color Mappings

### Design Token Hierarchy
```
Level 1: Page Background
├── color: white/default
├── usage: overall page background

Level 2: Section Backgrounds  
├── color: #b0c29b (bg-trip-details)
├── usage: travel style section container
├── relationship: same as trip details header

Level 3: Form Backgrounds
├── color: #ece8de (bg-form-box) 
├── usage: individual form components
├── relationship: contained within section

Level 4: Input Backgrounds
├── color: white
├── usage: form input fields
├── relationship: contained within forms
```

### Color Exclusion Rules
```
Prohibited in Travel Style:
├── #406170 as background (bg-primary)
│   ├── reason: user requirement
│   ├── allowed: text-primary, border-primary
│   └── forbidden: bg-primary, hover:bg-primary

Permitted Usages:
├── #406170 as text color (text-primary) ✅
├── #406170 as border color (border-primary) ✅  
└── #406170 as focus color (focus:ring-primary) ✅
```

## Container Hierarchy Relationships

### ConditionalTravelStyle Component Structure
```
ConditionalTravelStyle (ROOT)
├── styling: bg-trip-details container
├── states: NOT_SELECTED | DETAILED | SKIP
│
├── NOT_SELECTED State
│   ├── TravelStyleChoice buttons
│   └── NO GenerateItineraryButton
│
├── DETAILED State  
│   ├── TravelExperience (bg-form-box)
│   ├── TripVibe (bg-form-box)
│   ├── SampleDays (bg-form-box)
│   ├── DinnerChoice (bg-form-box)
│   └── TripNickname (bg-form-box)
│
└── SKIP State
    └── TripNickname (bg-form-box)
```

### App.tsx Integration Structure
```
App Component
├── Trip Details Section (bg-trip-details)
├── TripDetails Forms (bg-form-box)
├── ConditionalTravelStyle (bg-trip-details) ← Target
│   └── Travel Style Forms (bg-form-box) ← Preserve
└── GenerateItineraryButton (single instance) ← After travel style
```

## State Transition Validation

### Valid Styling Transitions
1. **Initial Load**: Container shows bg-trip-details, no forms visible
2. **Choice Selection**: Container maintains bg-trip-details, forms appear with bg-form-box
3. **Choice Change**: Container maintains bg-trip-details, form visibility changes
4. **Form Interaction**: Container and forms maintain respective backgrounds

### Invalid Styling States
- Container without bg-trip-details background
- Forms with bg-primary (#406170) background  
- Multiple GenerateItineraryButton instances before choice
- Travel style content with no background differentiation

## Component Interface Contracts

### ConditionalTravelStyle Props Interface
```typescript
interface ConditionalTravelStyleProps {
  // Existing props (unchanged)
  choice: TravelStyleChoice;
  onChoiceChange: (choice: TravelStyleChoice) => void;
  formData: FormData;
  onFormChange: (data: FormData) => void;
  disabled?: boolean;
  
  // Styling validation (implicit)
  containerStyling: {
    background: "#b0c29b"; // bg-trip-details
    excludeBackground: "#406170"; // never bg-primary
  };
}
```

### Form Component Styling Contract
```typescript
interface FormStylingContract {
  background: "#ece8de"; // bg-form-box (preserved)
  textColor: "#406170"; // text-primary  
  borderColor: "#406170"; // border-primary
  containerBackground: "inherit"; // never override parent
  excludeBackground: "#406170"; // never bg-primary
}
```

---
**Data Model Complete**: All UI entities, relationships, and styling contracts defined for Phase 2 task generation