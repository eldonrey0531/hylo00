# Component Styling Contracts

## HeaderStylingContract

### Full-Width Header Requirement
```yaml
contract: FullWidthHeader
description: Header div must occupy entire row width
requirements:
  - className MUST include 'w-full'
  - className MUST NOT include any 'rounded-*' classes
  - className MUST include top spacing (mt-2 or similar)
  - Must extend from left edge to right edge of parent container

validation:
  - Check for w-full class presence
  - Verify absence of rounded-* classes  
  - Confirm top margin spacing exists
  - Visual validation of full-width coverage

test_scenarios:
  - Verify header spans complete parent width
  - Confirm no rounded corners visible
  - Check proper spacing above header
  - Validate consistent behavior across screen sizes
```

### Header Content Contract
```yaml
contract: HeaderContent
description: Header must display icon and title with proper styling
requirements:
  - Icon (emoji or component) positioned on left
  - Title text positioned after icon with spacing
  - Background color: bg-[#406170]
  - Text color: white
  - Proper padding: px-4 py-3

validation:
  - Icon renders correctly
  - Title text displays properly
  - Background color matches specification
  - Text remains readable (contrast check)
  - Padding provides adequate spacing

test_scenarios:
  - Icon and title both visible
  - Proper spacing between icon and title
  - Background color renders correctly
  - Text remains accessible
```

## GridLayoutContract

### 2x2 Grid Arrangement
```yaml
contract: TwoByTwoGrid
description: Options must be arranged in 2-column, 2-row grid layout
requirements:
  - Use CSS Grid with grid-cols-2
  - Gap spacing: gap-4 or equivalent
  - Maximum 2 items per row
  - Auto-flowing rows for additional items
  - Responsive behavior maintained

validation:
  - Verify grid-cols-2 class applied
  - Check gap spacing is consistent
  - Count items per row (max 2)
  - Confirm proper row wrapping
  - Test responsive breakpoints

test_scenarios:
  - 4 items arranged in 2x2 grid
  - 3 items: 2 in first row, 1 in second
  - 5+ items: proper row wrapping
  - Mobile responsiveness maintained
  - Gap spacing visually consistent
```

### Grid Item Styling
```yaml
contract: GridItemStyling
description: Individual grid items must have consistent styling
requirements:
  - Padding: px-3 py-2 or equivalent
  - Border: border-3 border-primary
  - Border radius: rounded-[10px]
  - Hover states: hover:bg-primary/10
  - Selected states: bg-primary text-white
  - Font: font-bold font-raleway text-xs

validation:
  - Check padding consistency
  - Verify border styling
  - Test hover state transitions
  - Confirm selected state appearance
  - Validate typography settings

test_scenarios:
  - Default state styling
  - Hover state animation
  - Selected state appearance
  - Multiple selections possible
  - Keyboard navigation support
```

## PlaceholderBehaviorContract

### Non-Editable Placeholder
```yaml
contract: NonEditablePlaceholder
description: Other field must show non-editable placeholder when empty
requirements:
  - Placeholder text visible when field is empty
  - Placeholder text NOT editable by user
  - Placeholder disappears when user types
  - Placeholder reappears when field becomes empty
  - Proper accessibility labels

validation:
  - Placeholder shows in empty field
  - User cannot edit placeholder text
  - Placeholder behavior on focus/blur
  - Placeholder reappears after deletion
  - Screen reader announces correctly

test_scenarios:
  - Empty field shows placeholder
  - Click/focus on placeholder area
  - Type in field - placeholder disappears
  - Delete all text - placeholder returns
  - Tab navigation works correctly
```

### Placeholder Styling
```yaml
contract: PlaceholderStyling
description: Placeholder must have proper visual styling
requirements:
  - Position: absolute left-3 top-2
  - Color: text-gray-500
  - Pointer events: none
  - Z-index: proper layering
  - Font: matches input field

validation:
  - Position overlays input correctly
  - Color provides sufficient contrast
  - No interference with input interaction
  - Proper layering order
  - Typography consistency

test_scenarios:
  - Placeholder positioned correctly
  - Color contrast meets accessibility standards
  - No click interference with input
  - Text alignment with input content
```

## ContentSpacingContract

### Content Area Padding
```yaml
contract: ContentAreaSpacing
description: Content below header must have proper spacing and alignment
requirements:
  - Left padding: adjusted for alignment
  - Right padding: adjusted for alignment  
  - Top spacing: maintains gap below header
  - No border interruptions in content flow
  - Consistent spacing between sections

validation:
  - Check left/right padding values
  - Verify top spacing below header
  - Confirm no border conflicts
  - Test spacing consistency
  - Validate visual alignment

test_scenarios:
  - Content aligns properly with header
  - No visual gaps or overlaps
  - Consistent spacing throughout
  - Responsive behavior maintained
```

## TextContentContract

### Header Text Update
```yaml
contract: HeaderTextChange
description: ItineraryInclusions header text must be updated
requirements:
  - Old text: "ITINERARY INCLUSIONS"
  - New text: "What Should We Include in Your Itinerary?"
  - Maintain existing styling
  - Preserve semantic hierarchy
  - No functional changes

validation:
  - Text content matches specification
  - Styling remains unchanged
  - HTML structure preserved
  - No accessibility regression
  - Typography consistency maintained

test_scenarios:
  - New text displays correctly
  - No visual style changes
  - Screen reader reads new text
  - Page layout unaffected
  - Text fits in available space
```