# Component Contracts: Trip Details Enhancements

**Feature**: Trip Details Enhancements  
**Date**: September 19, 2025  
**Phase**: Phase 1 Design

## Overview

This document defines the component interfaces and contracts for all enhanced trip details components. Each contract specifies the expected props, behavior, and data flow.

## Core Component Contracts

### BudgetForm Enhanced Contract

```typescript
interface BudgetFormProps extends BaseFormProps {
  // Enhanced budget configuration
  formData: FormData & {
    budget?: number;
    currency?: Currency;
    flexibleBudget?: boolean;
    budgetMode?: BudgetMode; // NEW: 'total' | 'per-person'
    adults?: number;         // Used for per-person calculations
    children?: number;       // Used for per-person calculations
  };
  onFormChange: (data: Partial<FormData>) => void;
}

// Expected behavior
interface BudgetFormBehavior {
  // Budget mode toggle
  toggleBudgetMode(mode: BudgetMode): void;
  
  // Dynamic calculation display
  calculateDisplayAmount(): string;
  
  // Mode-aware budget updates
  updateBudgetWithMode(amount: number, mode: BudgetMode): void;
  
  // Validation
  validateBudgetInput(amount: number, travelers: number): boolean;
}
```

### TravelGroupSelector Enhanced Contract

```typescript
interface TravelGroupSelectorProps extends BaseFormProps {
  formData: FormData & {
    selectedGroups?: string[];    // NEW: Array of selected group IDs
    customGroupText?: string;     // NEW: Custom text for 'other' option
  };
  onFormChange: (data: Partial<FormData>) => void;
  
  // Optional: External control of other input visibility
  showOtherInput?: boolean;
  onToggleOther?: (visible: boolean) => void;
}

// Expected behavior
interface TravelGroupSelectorBehavior {
  // Group selection management
  toggleGroup(groupId: string): void;
  
  // Other option handling
  handleOtherSelection(selected: boolean): void;
  handleOtherTextChange(text: string): void;
  
  // Validation
  validateGroupSelection(groups: string[], customText?: string): boolean;
}
```

### TravelInterests Enhanced Contract

```typescript
interface TravelInterestsProps extends BaseFormProps {
  formData: FormData & {
    selectedInterests?: string[];    // NEW: Array of selected interest IDs
    customInterestsText?: string;    // NEW: Custom text for 'other' option
  };
  onFormChange: (data: Partial<FormData>) => void;
}

// Expected behavior  
interface TravelInterestsBehavior {
  // Interest selection management
  toggleInterest(interestId: string): void;
  
  // Other option handling
  handleOtherInterest(selected: boolean): void;
  handleOtherTextChange(text: string): void;
  
  // Data capture
  captureSpecificChoiceNames(): string[];
}
```

### ItineraryInclusions Enhanced Contract

```typescript
interface ItineraryInclusionsProps extends BaseFormProps {
  formData: FormData & {
    selectedInclusions?: string[];        // NEW: Array of selected inclusion IDs
    customInclusionsText?: string;        // NEW: Custom text for 'other' option
    inclusionPreferences?: InclusionPreferencesMap; // NEW: Preferences per inclusion
  };
  onFormChange: (data: Partial<FormData>) => void;
}

// Expected behavior
interface ItineraryInclusionsBehavior {
  // Inclusion selection management
  toggleInclusion(inclusionId: string): void;
  
  // Preference management
  updateInclusionPreferences(inclusionId: string, preferences: any): void;
  
  // Other option handling
  handleOtherInclusion(selected: boolean): void;
  handleOtherTextChange(text: string): void;
  
  // Complete data gathering
  gatherAllInclusionData(): InclusionData;
}
```

## Travel Style Component Contracts

### TravelExperience Enhanced Contract

```typescript
interface TravelExperienceProps {
  selectedExperience: string[];          // Multi-select array
  onSelectionChange: (experience: string[]) => void;
}

// Expected behavior
interface TravelExperienceBehavior {
  // Multi-selection management
  toggleExperience(experienceText: string): void;
  
  // Data capture
  captureAllSelections(): string[];
  
  // Validation
  validateExperienceSelections(selections: string[]): boolean;
}
```

### TripVibe Enhanced Contract

```typescript
interface TripVibeProps {
  selectedVibes: string[];              // Multi-select array including 'other'
  onSelectionChange: (vibes: string[]) => void;
  otherText: string;                    // Custom vibe description
  onOtherTextChange: (value: string) => void;
  showOther?: boolean;                  // External visibility control
  onToggleOther?: (visible: boolean) => void;
}

// Expected behavior
interface TripVibeBehavior {
  // Vibe selection management
  toggleVibe(vibeId: string): void;
  
  // Other option handling
  handleOtherVibeSelection(): void;
  updateOtherVibeText(text: string): void;
  
  // Complete data capture
  gatherVibeData(): { selected: string[]; customText?: string };
}
```

### SampleDays Enhanced Contract

```typescript
interface SampleDaysProps {
  selectedDays: string[];               // Multi-select array
  onSelectionChange: (days: string[]) => void;
}

// Expected behavior
interface SampleDaysBehavior {
  // Day selection management
  toggleDay(dayText: string): void;
  
  // Data capture
  captureAllDayPreferences(): string[];
}
```

### DinnerChoice Enhanced Contract

```typescript
interface DinnerChoiceProps {
  selectedChoice: string[];             // Multi-select array
  onSelectionChange: (choices: string[]) => void;
}

// Expected behavior
interface DinnerChoiceBehavior {
  // Choice selection management
  toggleChoice(choiceText: string): void;
  
  // Data capture
  captureAllDinnerPreferences(): string[];
}
```

### TripNickname Simplified Contract

```typescript
interface TripNicknameProps {
  tripNickname: string;                 // Trip nickname only
  onNicknameChange: (nickname: string) => void;
  contactInfo: {                        // Simplified contact info
    name: string;                       // User name only
    email: string;                      // Email only
    // REMOVED: subscribe, phone, additional fields
  };
  onContactChange: (info: ContactInfo) => void;
}

// Expected behavior
interface TripNicknameBehavior {
  // Essential field management only
  updateTripNickname(nickname: string): void;
  updateContactName(name: string): void;
  updateContactEmail(email: string): void;
  
  // Validation
  validateRequiredFields(): boolean;
}
```

## Data Flow Contracts

### Parent-Child Communication

```typescript
// Parent component (TripDetails/index.tsx)
interface TripDetailsContract {
  // Enhanced form data management
  formData: FormData;                   // Extended with new fields
  onFormChange: (data: FormData) => void;
  
  // Budget mode integration
  handleBudgetModeChange(mode: BudgetMode): void;
  
  // Selection data integration  
  handleGroupSelection(groups: string[], customText?: string): void;
  handleInterestSelection(interests: string[], customText?: string): void;
  handleInclusionSelection(inclusions: string[], customText?: string, preferences?: any): void;
  
  // Travel style data integration
  handleTravelStyleUpdate(styleData: Partial<TravelStyleData>): void;
  
  // Contact information integration
  handleContactUpdate(contact: ContactInfo): void;
}
```

### Form Data Gathering Contract

```typescript
// Complete form data gathering interface
interface FormDataGathering {
  // Budget configuration
  gatherBudgetData(): BudgetConfiguration;
  
  // Selection data with choices
  gatherGroupData(): TravelGroupSelection;
  gatherInterestData(): TravelInterestSelection;
  gatherInclusionData(): ItineraryInclusionSelection;
  
  // Travel style comprehensive data
  gatherTravelStyleData(): TravelStyleData;
  
  // Contact information
  gatherContactData(): ContactInformation;
  
  // Complete form payload
  gatherCompleteFormData(): FormData;
}
```

## Validation Contracts

### Component-Level Validation

```typescript
interface ComponentValidation {
  // Field validation
  validateRequired(value: any): boolean;
  validateFormat(value: string, format: RegExp): boolean;
  validateLength(value: string, min: number, max: number): boolean;
  
  // Selection validation
  validateSelection(selections: string[], options: string[]): boolean;
  validateOtherText(text: string, required: boolean): boolean;
  
  // Component-specific validation
  validateComponent(): { isValid: boolean; errors: string[] };
}
```

### Form-Level Validation

```typescript
interface FormValidation {
  // Complete form validation
  validateFormData(data: FormData): ValidationResult;
  
  // Section validation
  validateBudgetSection(data: FormData): ValidationResult;
  validateSelectionSections(data: FormData): ValidationResult;
  validateTravelStyleSections(data: FormData): ValidationResult;
  validateContactSection(data: FormData): ValidationResult;
}
```

## Testing Contracts

### Component Testing Interface

```typescript
interface ComponentTestContract {
  // Rendering tests
  shouldRenderWithDefaultProps(): void;
  shouldRenderWithEnhancedProps(): void;
  
  // Interaction tests
  shouldHandleUserInteractions(): void;
  shouldUpdateFormData(): void;
  shouldValidateInput(): void;
  
  // Other option tests
  shouldShowOtherInputWhenSelected(): void;
  shouldCaptureOtherText(): void;
  shouldClearOtherTextWhenDeselected(): void;
  
  // Data flow tests
  shouldPassDataToParent(): void;
  shouldReceiveDataFromParent(): void;
}
```

### Integration Testing Interface

```typescript
interface IntegrationTestContract {
  // Form flow tests
  shouldMaintainDataAcrossComponents(): void;
  shouldPersistSelections(): void;
  shouldCalculateBudgetCorrectly(): void;
  
  // Complete data gathering tests
  shouldGatherAllFormData(): void;
  shouldIncludeOtherOptions(): void;
  shouldMaintainDataIntegrity(): void;
}
```

## Event Contracts

### Standard Events

```typescript
// Form change events
interface FormChangeEvent {
  field: string;
  value: any;
  metadata?: {
    component: string;
    timestamp: Date;
    validation?: ValidationResult;
  };
}

// Selection events
interface SelectionEvent {
  type: 'add' | 'remove' | 'other';
  item: string;
  customText?: string;
  currentSelection: string[];
}

// Validation events
interface ValidationEvent {
  component: string;
  isValid: boolean;
  errors: string[];
  field?: string;
}
```

## Error Handling Contracts

### Component Error Handling

```typescript
interface ComponentErrorHandling {
  // Input validation errors
  handleValidationError(field: string, error: string): void;
  
  // State update errors
  handleStateUpdateError(error: Error): void;
  
  // Data persistence errors
  handlePersistenceError(error: Error): void;
  
  // Recovery methods
  resetComponentState(): void;
  restoreFromBackup(): void;
}
```

## Conclusion

These contracts define the complete interface and behavior expectations for all enhanced trip details components. They ensure consistent implementation, proper data flow, and comprehensive testing coverage while maintaining backward compatibility with existing patterns.