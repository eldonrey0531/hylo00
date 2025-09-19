# Button Duplication Prevention Contract

**Feature**: 004-fix-travel-style  
**Contract Type**: Behavioral API  
**Component**: GenerateItineraryButton

## Button Duplication Contract

### Endpoint: GenerateItineraryButton Instance Management
**Purpose**: Ensure only one GenerateItineraryButton appears per logical form flow

**Required Behavior Properties**:
```typescript
interface ButtonDuplicationContract {
  maxInstances: 1;
  placement: "after-travel-style-choice";
  visibleStates: {
    beforeChoice: false;
    afterChoice: true;
  };
  excludeStates: ["NOT_SELECTED"];
}
```

**Behavioral Assertions**:
- ✅ MUST NOT appear in NOT_SELECTED state
- ✅ MUST appear only once per page
- ✅ MUST be positioned after travel style interaction
- ✅ MUST maintain existing functionality when visible

## Button Placement Requirements

### Valid Placement Locations
```typescript
interface ValidButtonPlacements {
  appLevel: {
    location: "after-ConditionalTravelStyle-component";
    selector: "GenerateItineraryButton";
    condition: "always-visible";
  };
  
  invalidLocations: {
    withinTravelStyleChoice: false;
    beforeChoiceSelection: false;
    withinConditionalTravelStyle: false;
    multipleCopies: false;
  };
}
```

### State-Based Visibility Rules
```typescript
interface ButtonVisibilityContract {
  NOT_SELECTED: {
    travelStyleButton: false; // No button in ConditionalTravelStyle
    appLevelButton: true;     // App-level button remains
  };
  
  DETAILED: {
    travelStyleButton: false; // No additional button
    appLevelButton: true;     // App-level button remains
  };
  
  SKIP: {
    travelStyleButton: false; // No additional button  
    appLevelButton: true;     // App-level button remains
  };
}
```

## Test Contracts

### Button Instance Count Tests
```typescript
describe('GenerateItineraryButton Duplication Prevention', () => {
  it('should have exactly one GenerateItineraryButton on page', () => {
    const buttons = screen.getAllByRole('button', { 
      name: /generate my personalized itinerary/i 
    });
    
    expect(buttons).toHaveLength(1);
  });

  it('should NOT have GenerateItineraryButton in NOT_SELECTED state', () => {
    // Set travel style choice to NOT_SELECTED
    render(<ConditionalTravelStyle choice={TravelStyleChoice.NOT_SELECTED} />);
    
    const withinTravelStyle = screen.queryByTestId('conditional-travel-style')
      ?.querySelector('button[aria-label*="generate"]');
    
    expect(withinTravelStyle).not.toBeInTheDocument();
  });

  it('should NOT add extra GenerateItineraryButton in DETAILED state', () => {
    // Set travel style choice to DETAILED
    render(<ConditionalTravelStyle choice={TravelStyleChoice.DETAILED} />);
    
    const buttons = screen.getAllByRole('button', { 
      name: /generate my personalized itinerary/i 
    });
    
    expect(buttons).toHaveLength(1); // Only the app-level button
  });

  it('should NOT add extra GenerateItineraryButton in SKIP state', () => {
    // Set travel style choice to SKIP
    render(<ConditionalTravelStyle choice={TravelStyleChoice.SKIP} />);
    
    const buttons = screen.getAllByRole('button', { 
      name: /generate my personalized itinerary/i 
    });
    
    expect(buttons).toHaveLength(1); // Only the app-level button
  });
});
```

### Button Placement Tests
```typescript
describe('GenerateItineraryButton Placement', () => {
  it('should be positioned after ConditionalTravelStyle component', () => {
    const travelStyleSection = screen.getByTestId('conditional-travel-style');
    const generateButton = screen.getByRole('button', { 
      name: /generate my personalized itinerary/i 
    });
    
    // Button should come after travel style section in DOM order
    expect(travelStyleSection.compareDocumentPosition(generateButton))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should maintain button functionality regardless of travel style state', () => {
    const mockHandler = jest.fn();
    render(<GenerateItineraryButton onClick={mockHandler} />);
    
    const button = screen.getByRole('button', { 
      name: /generate my personalized itinerary/i 
    });
    
    fireEvent.click(button);
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Flow Tests
```typescript
describe('Button Integration with Travel Style Flow', () => {
  it('should maintain single button through choice transitions', () => {
    const { rerender } = render(
      <App initialTravelStyleChoice={TravelStyleChoice.NOT_SELECTED} />
    );
    
    // Check initial state
    expect(screen.getAllByRole('button', { 
      name: /generate my personalized itinerary/i 
    })).toHaveLength(1);
    
    // Change to DETAILED
    rerender(<App initialTravelStyleChoice={TravelStyleChoice.DETAILED} />);
    expect(screen.getAllByRole('button', { 
      name: /generate my personalized itinerary/i 
    })).toHaveLength(1);
    
    // Change to SKIP
    rerender(<App initialTravelStyleChoice={TravelStyleChoice.SKIP} />);
    expect(screen.getAllByRole('button', { 
      name: /generate my personalized itinerary/i 
    })).toHaveLength(1);
  });
});
```

## Button Location Validation

### Current App.tsx Structure
```typescript
interface AppStructureContract {
  order: [
    "TripDetails",
    "ConditionalTravelStyle", 
    "GenerateItineraryButton",  // Single instance here
    "ItineraryResults"
  ];
  
  buttonPlacement: {
    component: "GenerateItineraryButton";
    position: "after-ConditionalTravelStyle";
    siblings: {
      previous: "ConditionalTravelStyle";
      next: "ItineraryResults";
    };
  };
}
```

### Invalid Button Locations
```typescript
interface InvalidButtonPlacements {
  locations: [
    "within-TravelStyleChoice-component",
    "within-ConditionalTravelStyle-component", 
    "before-travel-style-section",
    "multiple-copies-anywhere"
  ];
  
  detection: {
    selector: "button[aria-label*='generate'], button:has-text('generate my personalized itinerary')";
    maxAllowed: 1;
    forbiddenParents: [
      "[data-testid='conditional-travel-style']",
      "[data-testid='travel-style-choice']"
    ];
  };
}
```

## Error Conditions

### Button Duplication Violations
- **ERROR**: Multiple GenerateItineraryButton instances detected
- **ERROR**: GenerateItineraryButton within ConditionalTravelStyle component
- **ERROR**: GenerateItineraryButton within TravelStyleChoice component
- **WARNING**: Button positioned before travel style section

### Validation Rules
```typescript
const validateButtonPlacement = () => {
  const buttons = document.querySelectorAll('button[aria-label*="generate"]');
  const travelStyleContainers = document.querySelectorAll('[data-testid="conditional-travel-style"]');
  
  assert.equal(buttons.length, 1, 'Must have exactly one generate button');
  
  buttons.forEach(button => {
    travelStyleContainers.forEach(container => {
      assert.isFalse(
        container.contains(button),
        'Generate button must not be within travel style component'
      );
    });
  });
};
```

---
**Contract Status**: Defined - Tests required before implementation