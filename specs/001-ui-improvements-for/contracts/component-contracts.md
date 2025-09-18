# Component Contracts: UI Improvements

## TravelersForm Component Contract

### Interface Definition
```typescript
interface TravelersFormProps extends BaseFormProps {
  formData: {
    adults: number;           // >= 1
    children: number;         // >= 0  
    childrenAges?: number[];  // Optional, length should match children count
    // ... other existing form properties
  };
  onFormChange: (data: Partial<FormData>) => void;
}
```

### Visual Contract
**Total Travelers Display**:
- **Format**: "Total travelers: {adults + children}"
- **Text Alignment**: Centered within container
- **Border**: Thick, prominent border using existing design tokens
- **Update Behavior**: Real-time updates when adults/children count changes
- **Accessibility**: Maintains existing ARIA labels and screen reader support

### Styling Requirements
```css
/* Required Tailwind classes (example) */
.total-travelers-display {
  @apply text-center;           /* Centered text */
  @apply border-4;              /* Thick border */
  @apply border-primary;        /* Using design token color */
  @apply p-4;                   /* Adequate padding */
  @apply font-raleway;          /* Consistent typography */
  @apply font-bold;             /* Prominent text weight */
}
```

### Behavioral Contract
- **Input Changes**: Component must re-render when formData.adults or formData.children change
- **Performance**: No additional re-renders beyond existing React behavior
- **State Management**: Uses existing form state management patterns
- **Error Handling**: Maintains existing validation error display

---

## Preference Modal Components Contract

### AccommodationPreferences Component
```typescript
interface AccommodationPreferencesProps {
  preferences: {
    selectedTypes?: string[];
    otherType?: string;
    specialRequests?: string;
  };
  onSave: (preferences: AccommodationPreferencesProps['preferences']) => void;
}
```

### RentalCarPreferences Component  
```typescript
interface RentalCarPreferencesProps {
  preferences: {
    vehicleTypes?: string[];
    specialRequirements?: string;
  };
  onSave: (preferences: RentalCarPreferencesProps['preferences']) => void;
}
```

### Visual Contract
**Background Styling**:
- **Width**: Full-width backgrounds within modal container
- **Borders**: No border interruptions in background flow
- **Visual Cohesion**: Maintain usability without relying on borders for separation
- **Responsive**: Background adapts to all screen sizes

### Styling Requirements
```css
/* Required styling approach */
.preference-modal-content {
  @apply w-full;                /* Full width */
  @apply bg-[color-token];      /* Full background color */
  /* Remove: border classes that interrupt flow */
}

.preference-section {
  @apply w-full;                /* Each section full width */
  /* Use padding/margins for spacing instead of borders */
}
```

### Behavioral Contract
- **Functionality**: All existing modal interactions preserved
- **Data Handling**: No changes to preference saving/loading logic
- **Performance**: No performance degradation from styling changes
- **Accessibility**: Existing accessibility features maintained (focus management, keyboard navigation)

---

## File Structure Contract

### Cleanup Requirements
**Files to Remove**:
- `src/components/TripDetails/AccommodationPreferences.tsx` (duplicate)
- `src/components/TripDetails/RentalCarPreferences.tsx` (duplicate)

**Files to Preserve**:
- `src/components/TripDetails/PreferenceModals/AccommodationPreferences.tsx` (canonical)
- `src/components/TripDetails/PreferenceModals/RentalCarPreferences.tsx` (canonical)

**Import Verification**:
- All imports must reference the correct file locations in PreferenceModals/ subdirectory
- No broken imports after cleanup
- All tests must continue to pass

### Migration Contract
```typescript
// Before cleanup - potential import conflict
import AccommodationPreferences from './AccommodationPreferences'; // Ambiguous

// After cleanup - clear import path
import AccommodationPreferences from './PreferenceModals/AccommodationPreferences'; // Clear
```

---

## Testing Contracts

### Unit Test Requirements
```typescript
// TravelersForm Tests
describe('TravelersForm', () => {
  it('should display centered total travelers count', () => {
    // Test centered text styling
  });
  
  it('should have thick border around total travelers display', () => {
    // Test border styling  
  });
  
  it('should update display when traveler counts change', () => {
    // Test real-time updates
  });
});

// Preference Modal Tests  
describe('PreferenceModals', () => {
  it('should have full-width background without border interruptions', () => {
    // Test background styling
  });
  
  it('should maintain existing functionality', () => {
    // Test all interactions still work
  });
});
```

### Integration Test Requirements
- Modal opening/closing behavior unchanged
- Form submission flows unchanged  
- Component interactions preserved
- No accessibility regressions

### Visual Regression Test Requirements
- Screenshot comparison before/after changes
- Multi-screen size testing (mobile, tablet, desktop)
- Color scheme compliance verification
- Typography consistency validation

---

## Performance Contract

### Acceptable Changes
- **Re-renders**: No additional re-renders beyond current behavior
- **Bundle Size**: Minimal impact from CSS changes only
- **Runtime Performance**: No measurable performance degradation

### Monitoring Requirements
- Existing performance metrics maintained
- Component render times unchanged
- Memory usage impact negligible
- First Contentful Paint (FCP) unaffected

---

## Accessibility Contract

### Requirements Preserved
- Screen reader compatibility maintained
- Keyboard navigation unchanged
- Focus management preserved
- Color contrast ratios maintained
- ARIA labels and descriptions preserved

### Testing Requirements
- Run existing accessibility test suite
- Verify no new accessibility violations
- Test with screen readers
- Validate keyboard-only navigation

---

This contract defines the expected behavior, interface, and requirements for all components affected by the UI improvement feature.