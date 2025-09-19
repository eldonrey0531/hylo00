# Travel Style Container Styling Contract

**Feature**: 004-fix-travel-style  
**Contract Type**: Visual Styling API  
**Component**: ConditionalTravelStyle

## Container Background Contract

### Endpoint: ConditionalTravelStyle Container Styling
**Purpose**: Ensure consistent yellow background across all travel style states

**Required Styling Properties**:
```typescript
interface TravelStyleContainerStyling {
  backgroundColor: "#b0c29b";    // bg-trip-details token
  borderRadius: "36px";          // rounded-[36px]
  padding: "24px";               // p-6
  excludeBackground: "#406170";   // never bg-primary
}
```

**Visual Assertions**:
- ✅ MUST have computed background-color: #b0c29b
- ✅ MUST maintain background across state transitions  
- ✅ MUST NOT have computed background-color: #406170
- ✅ MUST have border-radius: 36px
- ✅ MUST have padding: 24px

### State-Based Styling Requirements

#### NOT_SELECTED State
```typescript
interface NotSelectedStyling extends TravelStyleContainerStyling {
  content: "choice-buttons";
  generateButton: false; // No GenerateItineraryButton
}
```

#### DETAILED State  
```typescript
interface DetailedStyling extends TravelStyleContainerStyling {
  content: "all-forms";
  formsBackground: "#ece8de"; // bg-form-box preserved
}
```

#### SKIP State
```typescript
interface SkipStyling extends TravelStyleContainerStyling {
  content: "nickname-only"; 
  formBackground: "#ece8de"; // bg-form-box preserved
}
```

## Test Contracts

### Visual Test Requirements
```typescript
describe('ConditionalTravelStyle Container Styling', () => {
  it('should have bg-trip-details background in NOT_SELECTED state', () => {
    // Test implementation required
    expect(container).toHaveComputedStyle({
      backgroundColor: 'rgb(176, 194, 155)' // #b0c29b converted
    });
  });

  it('should maintain bg-trip-details background in DETAILED state', () => {
    // Test implementation required
  });

  it('should maintain bg-trip-details background in SKIP state', () => {
    // Test implementation required  
  });

  it('should NEVER have bg-primary (#406170) background', () => {
    // Test implementation required
    expect(container).not.toHaveComputedStyle({
      backgroundColor: 'rgb(64, 97, 112)' // #406170 converted
    });
  });
});
```

### Integration Test Requirements
```typescript
describe('Travel Style Section Visual Integration', () => {
  it('should match trip details section background styling', () => {
    const tripDetailsHeader = screen.getByText('TRIP DETAILS').closest('div');
    const travelStyleSection = screen.getByText('🌏 TRAVEL STYLE').closest('div');
    
    expect(tripDetailsHeader).toHaveClass('bg-trip-details');
    expect(travelStyleSection).toHaveClass('bg-trip-details');
  });
});
```

## Error Conditions

### Styling Violations
- **ERROR**: Container without bg-trip-details class
- **ERROR**: Container with bg-primary (#406170) background
- **ERROR**: Missing border-radius or padding
- **WARNING**: Inconsistent styling between states

### Validation Rules
```typescript
// Required validation in tests
const validateContainerStyling = (element: HTMLElement) => {
  const styles = getComputedStyle(element);
  
  assert.equal(styles.backgroundColor, 'rgb(176, 194, 155)', 'Must use bg-trip-details');
  assert.notEqual(styles.backgroundColor, 'rgb(64, 97, 112)', 'Must not use bg-primary');
  assert.equal(styles.borderRadius, '36px', 'Must have proper border radius');
  assert.equal(styles.padding, '24px', 'Must have proper padding');
};
```

---
**Contract Status**: Defined - Tests required before implementation