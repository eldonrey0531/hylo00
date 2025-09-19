# Data Model: Trip Details Enhancements

**Feature**: Trip Details Enhancements  
**Date**: September 19, 2025  
**Phase**: Phase 1 Design

## Overview

This document defines the data structures and entities required for the trip details enhancements feature. All changes extend existing patterns while maintaining backward compatibility.

## Core Entities

### Enhanced FormData Interface

```typescript
// Extension of existing TripDetailsFormData
export type FormData = TripDetailsFormData & {
  // Budget Configuration
  budgetMode?: BudgetMode; // 'total' | 'per-person'
  
  // Travel Group Selection
  selectedGroups?: string[]; // Array of group IDs including 'other'
  customGroupText?: string;  // Custom text when 'other' selected
  
  // Travel Interest Selection  
  selectedInterests?: string[]; // Array of interest IDs including 'other'
  customInterestsText?: string; // Custom text when 'other' selected
  
  // Itinerary Inclusion Selection
  selectedInclusions?: string[]; // Array of inclusion IDs including 'other'
  customInclusionsText?: string; // Custom text when 'other' selected
  inclusionPreferences?: InclusionPreferencesMap; // Preferences per inclusion
  
  // Travel Style Comprehensive Data
  travelExperience?: string[]; // Multi-select experience levels
  tripVibes?: string[];        // Multi-select trip vibes including 'other'
  customVibeText?: string;     // Custom text when 'other' vibe selected
  sampleDays?: string[];       // Multi-select sample day preferences
  dinnerPreferences?: string[]; // Multi-select dinner preferences
  
  // Simplified Contact Information (TripNickname form)
  tripNickname?: string;       // Trip nickname only
  contactName?: string;        // User name only  
  contactEmail?: string;       // Email only
  // Note: Remove subscribe and other fields from original
};
```

### Budget Configuration Entity

```typescript
export type BudgetMode = 'total' | 'per-person';

export interface BudgetConfiguration {
  amount: number;              // Budget amount in selected currency
  currency: Currency;          // USD, EUR, GBP, CAD, AUD
  mode: BudgetMode;           // Total trip vs per-person
  isFlexible: boolean;        // Flexibility toggle
  calculatedPerPerson?: number; // Calculated value when mode is 'total'
  calculatedTotal?: number;    // Calculated value when mode is 'per-person'
}
```

### Travel Selection Entities

```typescript
// Generic selection pattern used across components
export interface SelectionWithOther {
  predefinedSelections: string[];  // Array of predefined option IDs
  hasOtherSelected: boolean;       // Whether 'other' is selected
  customText?: string;             // Custom text when 'other' selected
}

// Travel Group Selection
export interface TravelGroupSelection extends SelectionWithOther {
  selectedGroups: string[];       // IDs: family, couple, solo, friends, etc.
}

// Travel Interest Selection  
export interface TravelInterestSelection extends SelectionWithOther {
  selectedInterests: string[];    // IDs: beach, culture, history, food, etc.
}

// Itinerary Inclusion Selection
export interface ItineraryInclusionSelection extends SelectionWithOther {
  selectedInclusions: string[];   // IDs: flights, accommodations, rental-car, etc.
  preferences: InclusionPreferencesMap; // Per-inclusion preference data
}
```

### Travel Style Data Entity

```typescript
export interface TravelStyleData {
  // Experience level (single or multi-select based on component analysis)
  experienceLevel: string[];     // Multiple selections allowed
  
  // Trip vibe preferences with Other option
  vibes: {
    selected: string[];          // Predefined vibe IDs
    customText?: string;         // Custom vibe description when 'other' selected
  };
  
  // Sample day preferences
  sampleDays: string[];          // Multiple day scenario selections
  
  // Dinner preferences
  dinnerPreferences: string[];   // Multiple dinner option selections
}
```

### Contact Information Entity

```typescript
// Simplified contact information (TripNickname form)
export interface ContactInformation {
  tripNickname: string;          // Required: Trip nickname
  name: string;                  // Required: User's name
  email: string;                 // Required: User's email
  // Removed: subscribe, phone, additional fields
}
```

## Data Relationships

### Primary Data Flow
```
FormData (root)
├── Budget Configuration
├── Travel Group Selection
├── Travel Interest Selection  
├── Itinerary Inclusion Selection
├── Travel Style Data
└── Contact Information
```

### Component Data Mapping
```
TripDetails/index.tsx
├── BudgetForm → budgetMode, budget calculations
├── TravelGroupSelector → selectedGroups, customGroupText
├── TravelInterests → selectedInterests, customInterestsText
└── ItineraryInclusions → selectedInclusions, customInclusionsText, inclusionPreferences

travel-style/ components
├── TravelExperience → travelExperience[]
├── TripVibe → tripVibes[], customVibeText
├── SampleDays → sampleDays[]
├── DinnerChoice → dinnerPreferences[]
└── TripNickname → tripNickname, contactName, contactEmail
```

## Validation Rules

### Budget Validation
- Amount must be positive number
- Mode must be 'total' or 'per-person'
- Currency must be valid enum value
- Per-person calculation must account for traveler count > 0

### Selection Validation
- Each selection array can be empty (optional selections)
- When 'other' is included in selections, customText should be provided
- Custom text must be non-empty string when 'other' selected
- Selection IDs must match predefined option constants

### Contact Information Validation  
- Trip nickname: required, non-empty string, max 100 characters
- Name: required, non-empty string, max 50 characters
- Email: required, valid email format, max 100 characters

### Travel Style Validation
- All selections are optional but should be captured when provided
- Multiple selections allowed for all categories
- Custom text validation same as other components

## State Management

### Local Component State
```typescript
// Budget Form
const [budgetMode, setBudgetMode] = useState<BudgetMode>('total');

// Components with Other option
const [showOtherInput, setShowOtherInput] = useState(false);
const [localOtherText, setLocalOtherText] = useState('');

// Selection components
const [localSelections, setLocalSelections] = useState<string[]>([]);
```

### Form Data Integration
```typescript
// Parent component updates
const handleFormUpdate = useCallback((updates: Partial<FormData>) => {
  onFormChange({ ...formData, ...updates });
}, [formData, onFormChange]);

// Component-specific updates
const updateBudgetMode = (mode: BudgetMode) => {
  handleFormUpdate({ budgetMode: mode });
};

const updateSelections = (field: string, selections: string[], customText?: string) => {
  const updates: Partial<FormData> = {
    [field]: selections,
  };
  if (customText !== undefined) {
    updates[`custom${field.charAt(0).toUpperCase()}${field.slice(1)}Text`] = customText;
  }
  handleFormUpdate(updates);
};
```

## Data Persistence

### Local Storage Pattern
- Maintain existing form data persistence strategy
- Extend serialization to include new fields
- Ensure backward compatibility with existing saved data

### API Integration Preparation
- Structure data for future AI/LLM processing
- Maintain consistent naming conventions
- Enable easy transformation to API payload format

## Migration Strategy

### Backward Compatibility
- All new fields are optional
- Existing components continue to work unchanged
- Graceful handling of undefined new fields

### Default Values
```typescript
// Default values for new fields
const defaultFormDataExtensions: Partial<FormData> = {
  budgetMode: 'total',
  selectedGroups: [],
  selectedInterests: [],
  selectedInclusions: [],
  travelExperience: [],
  tripVibes: [],
  sampleDays: [],
  dinnerPreferences: [],
};
```

### Data Transformation
```typescript
// Helper function to ensure form data includes new fields
export const migrateFormData = (existing: FormData): FormData => {
  return {
    ...defaultFormDataExtensions,
    ...existing,
  };
};
```

## Performance Considerations

### Memory Usage
- Arrays for multi-select data (minimal overhead)
- String storage for custom text (bounded by UI limits)
- No nested object complexity

### Update Frequency
- Form updates trigger parent re-render (existing pattern)
- Local state for UI responsiveness
- Debounced updates for text inputs where appropriate

### Data Size
- Estimated additional data per form: <2KB
- Total enhanced form data: <10KB
- Well within browser storage limits

## Conclusion

The data model extends existing patterns consistently while supporting all new functionality requirements. The design maintains backward compatibility, supports future AI integration, and follows established TypeScript and React patterns in the codebase.