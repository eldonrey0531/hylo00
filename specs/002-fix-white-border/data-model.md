# Data Model: Preference Component Styling

## Component Interfaces

### PreferenceComponent
```typescript
interface PreferenceComponentProps {
  preferences: PreferenceData;
  onSave: (preferences: PreferenceData) => void;
}

interface PreferenceComponentStructure {
  parentDiv: ParentContainer;
  headerDiv: HeaderSection;
  contentDiv: ContentSection;
}
```

### ParentContainer
```typescript
interface ParentContainer {
  className: string; // "rounded-[36px] p-6 mt-4"
  backgroundColor: string; // Component-specific background color
  padding: PaddingConfig;
}

interface PaddingConfig {
  horizontal: string; // "px-6" 
  vertical: string; // "py-6"
  top: string; // "mt-4"
}
```

### HeaderSection
```typescript
interface HeaderSection {
  className: string; // Full-width header styling
  layout: HeaderLayout;
  content: HeaderContent;
  styling: HeaderStyling;
}

interface HeaderLayout {
  width: 'w-full'; // Must occupy full row width
  display: 'flex';
  alignment: 'items-center';
  spacing: 'space-x-3';
  margin: HeaderMargin;
}

interface HeaderMargin {
  bottom: 'mb-6';
  top: 'mt-2'; // Added spacing on top
  horizontal: 'px-4'; // Internal padding
  vertical: 'py-3'; // Internal padding
}

interface HeaderContent {
  icon: string; // Emoji or icon component
  title: string; // Component title
  backgroundColor: '#406170'; // Dark blue background
}

interface HeaderStyling {
  roundedCorners: false; // Remove rounded corners
  borderRadius: 'rounded-none'; // Explicit no rounding
}
```

### ContentSection
```typescript
interface ContentSection {
  layout: ContentLayout;
  optionGrid: OptionGrid;
  specialFields: SpecialField[];
}

interface ContentLayout {
  spacing: 'space-y-6';
  padding: ContentPadding;
}

interface ContentPadding {
  left: string; // Adjusted for content alignment
  right: string; // Adjusted for content alignment
  top: string; // Maintained spacing below header
}
```

### OptionGrid
```typescript
interface OptionGrid {
  layout: GridLayout;
  items: GridItem[];
  responsive: GridResponsive;
}

interface GridLayout {
  display: 'grid';
  columns: 'grid-cols-2'; // 2 columns
  rows: 'auto'; // Auto rows for 2x2 pattern
  gap: 'gap-4'; // Consistent spacing
}

interface GridItem {
  content: string;
  selected: boolean;
  className: string;
  onClick: () => void;
}

interface GridResponsive {
  mobile: 'grid-cols-1'; // Single column on mobile
  tablet: 'grid-cols-2'; // 2 columns on tablet+
  desktop: 'grid-cols-2'; // Maintain 2 columns
}
```

### SpecialField (Other Field)
```typescript
interface SpecialField {
  type: 'other-input';
  behavior: PlaceholderBehavior;
  styling: FieldStyling;
  state: FieldState;
}

interface PlaceholderBehavior {
  nonEditable: true; // Placeholder text cannot be edited
  persistent: true; // Placeholder remains when field is empty
  customizable: false; // Placeholder text is fixed
}

interface FieldStyling {
  className: string;
  placeholder: PlaceholderStyling;
}

interface PlaceholderStyling {
  position: 'absolute';
  location: 'left-3 top-2';
  color: 'text-gray-500';
  interaction: 'pointer-events-none';
}

interface FieldState {
  value: string;
  hasContent: boolean;
  showPlaceholder: boolean; // Computed: !hasContent
}
```

## Header Text Changes

### ItineraryInclusionsHeader
```typescript
interface ItineraryInclusionsHeader {
  currentText: "ITINERARY INCLUSIONS";
  newText: "What Should We Include in Your Itinerary?";
  styling: HeaderTextStyling;
}

interface HeaderTextStyling {
  fontSize: string; // Maintain existing size
  fontWeight: string; // Maintain existing weight
  color: string; // Maintain existing color
  textTransform: 'none'; // Remove uppercase if applied
}
```

## Component State Models

### AccommodationPreferences
```typescript
interface AccommodationPreferencesState {
  selectedTypes: string[];
  otherType: string;
  specialRequests: string;
  gridLayout: OptionGridState;
}

interface OptionGridState {
  layout: '2x2';
  items: AccommodationOption[];
  maxItemsPerRow: 2;
  totalRows: number; // Calculated based on items
}

interface AccommodationOption {
  id: string;
  label: string;
  selected: boolean;
  gridPosition: GridPosition;
}

interface GridPosition {
  row: number; // 1-based
  column: number; // 1-based
}
```

### RentalCarPreferences
```typescript
interface RentalCarPreferencesState {
  selectedTypes: string[];
  additionalRequests: string;
  gridLayout: OptionGridState;
}
```

## Validation Rules

### Header Structure Validation
```typescript
interface HeaderValidation {
  hasFullWidth: boolean; // Must have w-full class
  hasNoRoundedCorners: boolean; // Must not have rounded-* classes
  hasProperSpacing: boolean; // Must have mt-2 for top spacing
  hasCorrectBackground: boolean; // Must have bg-[#406170]
}
```

### Grid Layout Validation
```typescript
interface GridValidation {
  hasTwoColumns: boolean; // Must use grid-cols-2
  hasProperGap: boolean; // Must have gap-4 or similar
  itemsPerRow: number; // Must be 2
  maxRows: number; // Should be 2 for 2x2 pattern
}
```

### Placeholder Validation
```typescript
interface PlaceholderValidation {
  isNonEditable: boolean; // Placeholder text cannot be modified
  isPersistent: boolean; // Shows when field is empty
  hasProperStyling: boolean; // Correct positioning and colors
  maintainsAccessibility: boolean; // Proper ARIA labels
}
```

## State Transitions

### Other Field State Machine
```
Empty Field:
  showPlaceholder: true
  value: ""
  userCanEdit: false (for placeholder)

User Types:
  showPlaceholder: false
  value: userInput
  userCanEdit: true (for value)

User Deletes All:
  showPlaceholder: true
  value: ""
  userCanEdit: false (for placeholder)
```

### Grid Selection State
```
Initial State:
  selectedOptions: []
  gridDisplay: all options visible

User Selects Option:
  selectedOptions: [...prev, newOption]
  optionState: toggleSelected(option)

Maximum Selections:
  No limit defined in requirements
  All options can be selected simultaneously
```

## Error States

### Invalid Configurations
- Header without w-full class
- Grid with incorrect column count
- Placeholder that allows editing
- Missing top spacing on header

### Recovery Actions
- Apply w-full class to headers
- Reset grid to grid-cols-2
- Restore non-editable placeholder behavior
- Add mt-2 spacing to headers