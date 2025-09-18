# TravelStyle Component System Documentation

## Overview

The TravelStyle component system is a comprehensive form interface that collects detailed travel preferences to enhance AI-powered itinerary generation. This system integrates seamlessly with the Hylo Travel AI platform to provide personalized travel recommendations.

## Architecture

### Core Components

#### 1. Parent Orchestrator (`TravelStyle/index.tsx`)

- **Purpose**: Manages overall state and coordination between all form components
- **Features**:
  - Unified state management for all travel preferences
  - Real-time validation with visual feedback
  - Progress tracking and completion indicators
  - Loading states and error handling

```typescript
interface TravelStyleProps {
  styleData: TravelStyleData;
  onStyleChange: (data: TravelStyleData) => void;
  enableValidation?: boolean;
  isLoading?: boolean;
  visibleSections?: {
    pace?: boolean;
    activityLevel?: boolean;
    planningStyle?: boolean;
    // ... more sections
  };
  showGenerateButton?: boolean;
  onGenerate?: () => void;
}
```

#### 2. Form Components (10 Individual Components)

**Single-Select Components (Required):**

- `PacePreference` - Travel pace (fast, moderate, slow, flexible)
- `ActivityLevel` - Activity intensity (very-active, active, moderate, relaxed)
- `PlanningStyle` - Planning preference (structured, flexible, spontaneous)
- `BudgetStyle` - Budget approach (budget, moderate, comfort, luxury)
- `CulturalInterest` - Cultural engagement level (high, medium, low)

**Multi-Select Components (Optional):**

- `AccommodationType` - Accommodation preferences (hotels, hostels, etc.)
- `DiningPreferences` - Dining styles and preferences
- `TransportPreferences` - Transportation preferences
- `TravelInterestsSelector` - Activity and interest categories
- `TripPurpose` - Purpose of travel (leisure, business, etc.)

#### 3. Supporting Components

- `GenerateItineraryButton` - Advanced validation and generation trigger
- `types.ts` - Comprehensive type definitions and validation
- `travelStyleSchemas.ts` - Zod validation schemas

## Data Flow

### 1. State Management

```typescript
interface TravelStyleData {
  // Core single-select preferences (required)
  pace?: TravelPace;
  activityLevel?: ActivityLevel;
  planningPreference?: PlanningStyle;
  budgetStyle?: BudgetStyle;
  culturalInterest?: CulturalInterest;

  // Multi-select preferences (optional)
  accommodationTypes?: string[];
  diningPreferences?: string[];
  transportPreferences?: string[];
  interests?: string[];
  tripPurpose?: string[];

  // Form state tracking
  isComplete?: boolean;
  completedSections?: string[];
}
```

### 2. Validation System

```typescript
// Required sections for form completion
export const REQUIRED_SECTIONS = [
  'pace',
  'activityLevel',
  'planningPreference',
  'budgetStyle',
  'culturalInterest',
];

// Validation function
export const validateTravelStyleCompletion = (data: TravelStyleData): boolean => {
  return REQUIRED_SECTIONS.every((section) => data[section as keyof TravelStyleData]);
};
```

### 3. AI Integration

The TravelStyle data is integrated into the AI prompt system via `multiAgentService.ts`:

```typescript
TRAVEL STYLE PREFERENCES:
- Travel Pace: ${formData.travelStyle.pace || 'Not specified'}
- Activity Level: ${formData.travelStyle.activityLevel || 'Not specified'}
- Planning Style: ${formData.travelStyle.planningPreference || 'Not specified'}
- Budget Style: ${formData.travelStyle.budgetStyle || 'Not specified'}
- Cultural Interest: ${formData.travelStyle.culturalInterest || 'Not specified'}
// ... additional preferences
```

## Usage Examples

### Basic Integration

```typescript
import TravelStyle from './components/TravelStyle';
import { TravelStyleData } from './components/TravelStyle/types';

function MyTravelApp() {
  const [travelStyleData, setTravelStyleData] = useState<TravelStyleData>({});

  return (
    <TravelStyle
      styleData={travelStyleData}
      onStyleChange={setTravelStyleData}
      enableValidation={true}
      showGenerateButton={true}
      onGenerate={() => handleGenerateItinerary(travelStyleData)}
    />
  );
}
```

### Advanced Configuration

```typescript
// Custom section visibility
const customSections = {
  pace: true,
  activityLevel: true,
  planningStyle: true,
  accommodationType: false, // Hide accommodation options
  culturalInterest: true,
  budgetStyle: true,
  diningPreferences: true,
  transportPreferences: false, // Hide transport options
  interests: true,
  purpose: false, // Hide purpose selection
};

<TravelStyle
  styleData={travelStyleData}
  onStyleChange={setTravelStyleData}
  enableValidation={true}
  isLoading={isProcessing}
  visibleSections={customSections}
  showGenerateButton={true}
  onGenerate={handleGenerate}
/>;
```

### Individual Component Usage

```typescript
import PacePreference from './components/TravelStyle/PacePreference';

// Use individual components for custom layouts
<PacePreference
  styleData={styleData}
  onStyleChange={handleStyleUpdate}
  validationErrors={validationErrors}
  onValidation={handleValidation}
/>;
```

## Styling and Theming

### Design System Compliance

- **Colors**: Primary brand colors with consistent palette
- **Typography**: `font-raleway` for consistency with Hylo brand
- **Spacing**: Standardized spacing using Tailwind CSS
- **Components**: `bg-form-box` with `border-3` and `rounded-[36px]`

### Responsive Design

```css
/* Component grid patterns */
.grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4  /* For options */
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  /* For preferences */
```

### Interactive States

- **Hover**: `hover:scale-105 hover:shadow-xl hover:-translate-y-1`
- **Active**: `active:scale-95`
- **Focus**: `focus:ring-4 focus:ring-primary/30`
- **Selected**: `bg-primary text-white shadow-lg`

## Validation and Error Handling

### Real-time Validation

```typescript
// Component-level validation
useEffect(() => {
  if (onValidation) {
    const isValid = Boolean(currentSelection);
    const errors = isValid ? [] : ['Please make a selection'];
    onValidation('fieldName', isValid, errors);
  }
}, [currentSelection, onValidation]);
```

### Error Display

```typescript
{
  hasError && (
    <p className="text-sm text-red-600 font-bold font-raleway mt-2 flex items-center" role="alert">
      <span className="mr-1">⚠️</span>
      {hasError}
    </p>
  );
}
```

## Accessibility Features

### ARIA Support

- `aria-label` for all interactive elements
- `aria-pressed` for toggle buttons
- `role="alert"` for error messages
- `aria-labelledby` for form sections

### Keyboard Navigation

- Tab navigation through all form elements
- Enter/Space for button activation
- Focus indicators with visual feedback

## Performance Optimizations

### React.memo Usage

```typescript
// Memoize components to prevent unnecessary re-renders
export default memo(PacePreference);
```

### Callback Optimization

```typescript
const handleSelection = useCallback(
  (value: string) => {
    onStyleChange({ [fieldName]: value });
  },
  [onStyleChange, fieldName]
);
```

## Integration with Main Application

### App.tsx Integration

```typescript
// Add to TravelFormData interface
export interface TravelFormData {
  // ... existing fields
  travelStyle?: TravelStyleData;
}

// Usage in App component
const [travelStyleData, setTravelStyleData] = useState<TravelStyleData>({});

// Include in form submission
const completeFormData: TravelFormData = {
  // ... existing data
  travelStyle: travelStyleData,
};
```

## Testing Guidelines

### Component Testing

```typescript
// Test individual component functionality
test('PacePreference updates selection correctly', () => {
  const onStyleChange = jest.fn();
  render(<PacePreference styleData={{}} onStyleChange={onStyleChange} />);

  fireEvent.click(screen.getByLabelText('Select Fast travel pace'));
  expect(onStyleChange).toHaveBeenCalledWith({ pace: 'fast' });
});
```

### Integration Testing

```typescript
// Test complete form flow
test('TravelStyle completes validation flow', async () => {
  const onGenerate = jest.fn();
  render(<TravelStyle onGenerate={onGenerate} />);

  // Fill required fields
  fireEvent.click(screen.getByLabelText('Select Fast travel pace'));
  fireEvent.click(screen.getByLabelText('Select Active activity level'));
  // ... more selections

  // Verify generate button becomes enabled
  expect(screen.getByText('Generate My Personalized Itinerary')).toBeEnabled();
});
```

## Deployment Considerations

### Build Optimization

- Bundle size: ~203KB (acceptable for feature richness)
- Tree shaking: Only used components included
- CSS optimization: Tailwind purging unused styles

### Production Checklist

- [ ] All TypeScript errors resolved
- [ ] Validation schemas tested
- [ ] AI integration verified
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility audit passed
- [ ] Performance metrics acceptable

## Troubleshooting

### Common Issues

**1. Component Not Updating**

- Verify `onStyleChange` is properly passed down
- Check that state updates are immutable
- Ensure `useCallback` dependencies are correct

**2. Validation Not Working**

- Confirm `enableValidation` is true
- Check `REQUIRED_SECTIONS` includes the field
- Verify validation errors are displayed

**3. Styling Issues**

- Ensure Tailwind CSS is properly configured
- Check custom CSS doesn't override component styles
- Verify responsive breakpoints are working

**4. AI Integration Issues**

- Confirm `travelStyle` is included in `TravelFormData`
- Check multiAgentService includes TravelStyle data
- Verify prompt construction includes preferences

## Future Enhancements

### Planned Features

- [ ] Conditional field visibility based on selections
- [ ] Save/load preference profiles
- [ ] Advanced animation transitions
- [ ] Internationalization support
- [ ] A/B testing for form layouts

### Extension Points

- Custom validation rules
- Additional preference categories
- Integration with external APIs
- Enhanced AI prompt customization

---

## Quick Start Guide

1. **Import the component:**

   ```typescript
   import TravelStyle from './components/TravelStyle';
   ```

2. **Add state management:**

   ```typescript
   const [styleData, setStyleData] = useState({});
   ```

3. **Render the component:**

   ```typescript
   <TravelStyle
     styleData={styleData}
     onStyleChange={setStyleData}
     enableValidation={true}
     showGenerateButton={true}
   />
   ```

4. **Handle form completion:**
   ```typescript
   const handleGenerate = () => {
     if (validateTravelStyleCompletion(styleData)) {
       // Proceed with itinerary generation
     }
   };
   ```

For more detailed examples and advanced usage patterns, see the individual component documentation files.
