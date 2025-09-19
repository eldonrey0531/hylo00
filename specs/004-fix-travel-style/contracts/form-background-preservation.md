# Form Background Preservation Contract

**Feature**: 004-fix-travel-style  
**Contract Type**: Visual Styling API  
**Component**: Travel Style Forms

## Form Background Contract

### Endpoint: Travel Style Form Component Styling
**Purpose**: Ensure all forms maintain proper #ece8de background when displayed

**Required Styling Properties**:
```typescript
interface TravelStyleFormStyling {
  backgroundColor: "#ece8de";    // bg-form-box token
  borderColor: "#406170";        // border-primary token  
  textColor: "#406170";          // text-primary token
  borderRadius: "36px";          // rounded-[36px]
  excludeBackground: "#406170";   // never bg-primary
}
```

**Visual Assertions**:
- ✅ MUST have computed background-color: #ece8de  
- ✅ MUST preserve existing form component styling
- ✅ MUST NOT inherit container background color
- ✅ MUST NOT have computed background-color: #406170
- ✅ MUST maintain border and text colors

## Form Component Requirements

### TravelExperience Form
```typescript
interface TravelExperienceStyling extends TravelStyleFormStyling {
  selector: '[data-testid="travel-experience-form"]';
  preserveExisting: true;
}
```

### TripVibe Form
```typescript
interface TripVibeStyling extends TravelStyleFormStyling {
  selector: '[data-testid="trip-vibe-form"]';
  preserveExisting: true;
}
```

### SampleDays Form
```typescript
interface SampleDaysStyling extends TravelStyleFormStyling {
  selector: '[data-testid="sample-days-form"]';
  preserveExisting: true;
}
```

### DinnerChoice Form
```typescript
interface DinnerChoiceStyling extends TravelStyleFormStyling {
  selector: '[data-testid="dinner-choice-form"]';
  preserveExisting: true;
}
```

### TripNickname Form
```typescript
interface TripNicknameStyling extends TravelStyleFormStyling {
  selector: '[data-testid="trip-nickname-form"]';
  preserveExisting: true;
  visibleIn: ["DETAILED", "SKIP"]; // Both states
}
```

## Test Contracts

### Form Background Preservation Tests
```typescript
describe('Travel Style Form Background Preservation', () => {
  it('should preserve bg-form-box background in DETAILED state', () => {
    const forms = [
      '[data-testid="travel-experience-form"]',
      '[data-testid="trip-vibe-form"]', 
      '[data-testid="sample-days-form"]',
      '[data-testid="dinner-choice-form"]',
      '[data-testid="trip-nickname-form"]'
    ];

    forms.forEach(selector => {
      const form = screen.getByTestId(selector.replace('[data-testid="', '').replace('"]', ''));
      expect(form.closest('.bg-form-box')).toBeInTheDocument();
      expect(form.closest('.bg-primary')).not.toBeInTheDocument();
    });
  });

  it('should preserve bg-form-box background in SKIP state', () => {
    const nicknameForm = screen.getByTestId('trip-nickname-form');
    expect(nicknameForm.closest('.bg-form-box')).toBeInTheDocument();
    expect(nicknameForm.closest('.bg-primary')).not.toBeInTheDocument();
  });

  it('should NOT inherit container background color', () => {
    // Test that forms maintain distinct background from yellow container
    const container = screen.getByText('🌏 TRAVEL STYLE').closest('div');
    const form = screen.getByTestId('travel-experience-form');
    
    expect(container).toHaveComputedStyle({
      backgroundColor: 'rgb(176, 194, 155)' // #b0c29b
    });
    expect(form.closest('.bg-form-box')).toHaveComputedStyle({
      backgroundColor: 'rgb(236, 232, 222)' // #ece8de
    });
  });
});
```

### Form Styling Validation Tests
```typescript
describe('Form Styling Validation', () => {
  it('should NEVER have bg-primary background on any form', () => {
    const allForms = screen.getAllByTestId(/.*-form$/);
    
    allForms.forEach(form => {
      expect(form.closest('.bg-primary')).not.toBeInTheDocument();
      expect(form).not.toHaveComputedStyle({
        backgroundColor: 'rgb(64, 97, 112)' // #406170
      });
    });
  });

  it('should maintain text-primary color for form text', () => {
    const formHeaders = screen.getAllByRole('heading', { level: 3 });
    
    formHeaders.forEach(header => {
      if (header.textContent?.includes('TRAVEL STYLE')) return; // Skip main header
      expect(header).toHaveClass('text-primary');
    });
  });
});
```

## Background Hierarchy Validation

### Container vs Form Background Contract
```typescript
interface BackgroundHierarchyContract {
  container: {
    level: 2;
    background: "#b0c29b"; // bg-trip-details
    role: "section-background";
  };
  forms: {
    level: 3; 
    background: "#ece8de"; // bg-form-box
    role: "content-background";
    relationship: "contained-within-section";
  };
}
```

### Visual Hierarchy Tests
```typescript
describe('Background Hierarchy Validation', () => {
  it('should maintain proper visual hierarchy between container and forms', () => {
    const container = screen.getByText('🌏 TRAVEL STYLE').closest('.bg-trip-details');
    const forms = screen.getAllByTestId(/.*-form$/).map(f => f.closest('.bg-form-box'));
    
    expect(container).toBeInTheDocument();
    forms.forEach(form => {
      expect(form).toBeInTheDocument();
      expect(container).toContainElement(form);
    });
  });
});
```

## Error Conditions

### Form Styling Violations
- **ERROR**: Form with bg-primary (#406170) background
- **ERROR**: Form inheriting container background (#b0c29b)
- **ERROR**: Form without bg-form-box styling
- **WARNING**: Inconsistent form styling between states

### Validation Rules
```typescript
const validateFormStyling = (formElement: HTMLElement) => {
  const formContainer = formElement.closest('.bg-form-box');
  const styles = getComputedStyle(formContainer!);
  
  assert.isNotNull(formContainer, 'Form must have bg-form-box container');
  assert.equal(styles.backgroundColor, 'rgb(236, 232, 222)', 'Must use bg-form-box');
  assert.notEqual(styles.backgroundColor, 'rgb(64, 97, 112)', 'Must not use bg-primary');
  assert.notEqual(styles.backgroundColor, 'rgb(176, 194, 155)', 'Must not inherit container bg');
};
```

---
**Contract Status**: Defined - Tests required before implementation