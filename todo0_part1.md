Collecting workspace informationBased on your successfully implemented form separation, I'll help you integrate the remaining three components (ItineraryInclusion, TravelInterests, TravelGroupSelector) into the TripDetails group. Here's the implementation plan:

## TODO: Integrate Additional Forms into TripDetails - Rapid Implementation

### Implementation Sprint

- [ ] Move existing components into TripDetails folder
- [ ] Update imports and types to match TripDetails pattern
- [ ] Maintain all existing functionality
- [ ] Update parent component to include new forms
- [ ] Ensure consistent styling with other TripDetails components

### Updated File Structure

```filetree
src/components/
├── TripDetails/
│   ├── index.tsx                    # Parent component (updated)
│   ├── LocationForm.tsx             # ✅ Already done
│   ├── DatesForm.tsx               # ✅ Already done
│   ├── TravelersForm.tsx           # ✅ Already done
│   ├── BudgetForm.tsx              # ✅ Already done
│   ├── TravelGroupSelector.tsx     # NEW: Move & update
│   ├── TravelInterests.tsx         # NEW: Move & update
│   ├── ItineraryInclusion.tsx      # NEW: Move & update
│   ├── types.ts                    # Update with new types
│   └── utils.ts                    # Existing utilities
```

## 1. Update Shared Types (`types.ts`)

```typescript
// ...existing code...

// Add these new types to the existing types.ts file
export interface TravelGroup {
  label: string;
  emoji: string;
  value: string;
}

export interface TravelInterest {
  id: string;
  label: string;
  icon?: string;
}

export interface ItineraryInclusionOptions {
  accommodation: string[];
  transportation: string[];
  activities: string[];
  meals: string[];
}

// Update the main FormData interface
export interface FormData {
  // ...existing fields...

  // Add new fields
  travelGroup?: string;
  travelInterests?: string[];
  itineraryInclusions?: {
    accommodation?: string[];
    transportation?: string[];
    activities?: string[];
    meals?: string[];
  };
  accommodationOther?: string;
  transportationOther?: string;
  activitiesOther?: string;
  mealsOther?: string;
}

// Travel group options constant
export const TRAVEL_GROUPS: TravelGroup[] = [
  { label: 'Solo', emoji: '🧍', value: 'solo' },
  { label: 'Couple', emoji: '💑', value: 'couple' },
  { label: 'Family', emoji: '👨‍👩‍👧‍👦', value: 'family' },
  { label: 'Friends', emoji: '👥', value: 'friends' },
  { label: 'Business', emoji: '💼', value: 'business' },
  { label: 'Group Tour', emoji: '🚌', value: 'group' },
];

// Travel interests options constant
export const TRAVEL_INTERESTS: TravelInterest[] = [
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'beach', label: 'Beach & Relaxation', icon: '🏖️' },
  { id: 'culture', label: 'Culture & History', icon: '🏛️' },
  { id: 'food', label: 'Food & Culinary', icon: '🍽️' },
  { id: 'nature', label: 'Nature & Wildlife', icon: '🦁' },
  { id: 'nightlife', label: 'Nightlife & Entertainment', icon: '🎭' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'wellness', label: 'Wellness & Spa', icon: '🧘' },
  { id: 'photography', label: 'Photography', icon: '📸' },
  { id: 'sports', label: 'Sports & Activities', icon: '⚽' },
];

// Itinerary inclusion options constant
export const ITINERARY_OPTIONS: ItineraryInclusionOptions = {
  accommodation: ['Hotels', 'Resorts', 'Hostels', 'Vacation Rentals', 'Camping', 'Other'],
  transportation: [
    'Flights',
    'Rental Car',
    'Public Transit',
    'Private Transfers',
    'Trains',
    'Other',
  ],
  activities: [
    'Tours & Excursions',
    'Adventure Activities',
    'Cultural Experiences',
    'Water Sports',
    'Entertainment',
    'Other',
  ],
  meals: [
    'All Inclusive',
    'Breakfast Only',
    'Half Board',
    'Self-Catering',
    'Restaurant Recommendations',
    'Other',
  ],
};
```

## 2. Move & Update TravelGroupSelector Component

```typescript
import React from 'react';
import { BaseFormProps, TRAVEL_GROUPS } from './types';

const TravelGroupSelector: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const handleGroupSelect = (value: string) => {
    onFormChange({ travelGroup: value });
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        TRAVEL GROUP
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TRAVEL_GROUPS.map((group) => (
          <button
            key={group.value}
            onClick={() => handleGroupSelect(group.value)}
            className={`p-4 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-base ${
              formData.travelGroup === group.value
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-primary border-primary hover:bg-primary/10'
            }`}
            aria-label={`Select ${group.label} travel group`}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{group.emoji}</span>
              <span>{group.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TravelGroupSelector;
```

## 3. Move & Update TravelInterests Component

```typescript
import React from 'react';
import { BaseFormProps, TRAVEL_INTERESTS } from './types';

const TravelInterests: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const selectedInterests = formData.travelInterests || [];

  const handleInterestToggle = (interestId: string) => {
    const updatedInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter((id) => id !== interestId)
      : [...selectedInterests, interestId];

    onFormChange({ travelInterests: updatedInterests });
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        TRAVEL INTERESTS
      </h3>
      <p className="text-primary mb-4 font-raleway text-sm">
        Select all that apply to help us personalize your itinerary
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {TRAVEL_INTERESTS.map((interest) => (
          <button
            key={interest.id}
            onClick={() => handleInterestToggle(interest.id)}
            className={`p-3 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-sm ${
              selectedInterests.includes(interest.id)
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-primary border-primary hover:bg-primary/10'
            }`}
            aria-label={`Toggle ${interest.label} interest`}
            aria-pressed={selectedInterests.includes(interest.id)}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xl">{interest.icon}</span>
              <span className="text-xs">{interest.label}</span>
            </div>
          </button>
        ))}
      </div>
      {selectedInterests.length > 0 && (
        <div className="mt-4 bg-[#ece8de] border-3 border-primary rounded-[10px] p-3">
          <span className="text-primary font-bold font-raleway text-sm">
            Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default TravelInterests;
```

## 4. Move & Update ItineraryInclusion Component

```typescript
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BaseFormProps, ITINERARY_OPTIONS } from './types';

const ItineraryInclusion: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleOptionToggle = (category: string, option: string) => {
    const currentSelections =
      formData.itineraryInclusions?.[category as keyof typeof formData.itineraryInclusions] || [];
    const updatedSelections = currentSelections.includes(option)
      ? currentSelections.filter((item) => item !== option)
      : [...currentSelections, option];

    onFormChange({
      itineraryInclusions: {
        ...formData.itineraryInclusions,
        [category]: updatedSelections,
      },
    });

    // Handle "Other" option text input
    if (option === 'Other' && !currentSelections.includes(option)) {
      // Clear the other text when deselecting
      const otherFieldName = `${category}Other` as keyof typeof formData;
      onFormChange({ [otherFieldName]: '' });
    }
  };

  const handleOtherTextChange = (category: string, value: string) => {
    const otherFieldName = `${category}Other` as keyof typeof formData;
    onFormChange({ [otherFieldName]: value });
  };

  const sections = [
    { key: 'accommodation', title: 'ACCOMMODATION', icon: '🏨' },
    { key: 'transportation', title: 'TRANSPORTATION', icon: '🚗' },
    { key: 'activities', title: 'ACTIVITIES', icon: '🎯' },
    { key: 'meals', title: 'MEALS', icon: '🍽️' },
  ];

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        ITINERARY INCLUSIONS
      </h3>
      <p className="text-primary mb-4 font-raleway text-sm">
        What should be included in your itinerary?
      </p>

      <div className="space-y-4">
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.key);
          const selectedOptions =
            formData.itineraryInclusions?.[
              section.key as keyof typeof formData.itineraryInclusions
            ] || [];
          const hasOtherSelected = selectedOptions.includes('Other');
          const otherFieldName = `${section.key}Other` as keyof typeof formData;

          return (
            <div
              key={section.key}
              className="border-3 border-primary rounded-[10px] overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full px-4 py-3 bg-[#ece8de] flex items-center justify-between hover:bg-primary/10 transition-colors duration-200"
                aria-expanded={isExpanded}
                aria-controls={`${section.key}-content`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-bold text-primary font-raleway text-base">
                    {section.title}
                  </span>
                  {selectedOptions.length > 0 && (
                    <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                      {selectedOptions.length}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" />
                )}
              </button>

              {isExpanded && (
                <div id={`${section.key}-content`} className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-3">
                    {ITINERARY_OPTIONS[section.key as keyof typeof ITINERARY_OPTIONS].map(
                      (option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(option)}
                            onChange={() => handleOptionToggle(section.key, option)}
                            className="w-5 h-5 text-primary border-3 border-primary rounded focus:ring-2 focus:ring-primary"
                          />
                          <span className="text-primary font-raleway text-sm">{option}</span>
                        </label>
                      )
                    )}
                  </div>

                  {hasOtherSelected && (
                    <input
                      type="text"
                      placeholder={`Please specify other ${section.key}...`}
                      value={(formData[otherFieldName] as string) || ''}
                      onChange={(e) => handleOtherTextChange(section.key, e.target.value)}
                      className="mt-3 w-full px-4 py-2 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary placeholder-gray-400 font-raleway text-sm"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItineraryInclusion;
```

## 5. Update Parent Component (index.tsx)

```typescript
import React, { useCallback } from 'react';
import LocationForm from './LocationForm';
import DatesForm from './DatesForm';
import TravelersForm from './TravelersForm';
import BudgetForm from './BudgetForm';
import TravelGroupSelector from './TravelGroupSelector';
import TravelInterests from './TravelInterests';
import ItineraryInclusion from './ItineraryInclusion';
import { FormData } from './types';

interface TripDetailsProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  showAdditionalForms?: boolean; // Optional prop to control visibility of new forms
}

const TripDetails: React.FC<TripDetailsProps> = ({
  formData,
  onFormChange,
  showAdditionalForms = true, // Default to showing all forms
}) => {
  const handleFormUpdate = useCallback(
    (updates: Partial<FormData>) => {
      onFormChange({ ...formData, ...updates });
    },
    [formData, onFormChange]
  );

  return (
    <div className="space-y-6">
      {/* Location Box */}
      <LocationForm formData={formData} onFormChange={handleFormUpdate} />

      {/* Dates and Travelers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatesForm formData={formData} onFormChange={handleFormUpdate} />
        <TravelersForm formData={formData} onFormChange={handleFormUpdate} />
      </div>

      {/* Budget Box */}
      <BudgetForm formData={formData} onFormChange={handleFormUpdate} />

      {/* Additional Forms - Can be conditionally rendered */}
      {showAdditionalForms && (
        <>
          {/* Travel Group Selector */}
          <TravelGroupSelector formData={formData} onFormChange={handleFormUpdate} />

          {/* Travel Interests */}
          <TravelInterests formData={formData} onFormChange={handleFormUpdate} />

          {/* Itinerary Inclusions */}
          <ItineraryInclusion formData={formData} onFormChange={handleFormUpdate} />
        </>
      )}
    </div>
  );
};

export default TripDetails;
```

## 6. Migration Commands & Steps

### Step 1: Create the new component files

```bash
# Navigate to TripDetails folder
cd src/components/TripDetails

# Create the new component files
touch TravelGroupSelector.tsx
touch TravelInterests.tsx
touch ItineraryInclusion.tsx
```

### Step 2: Copy content from existing files

```bash
# If the original files exist elsewhere, copy their content
# Then update imports and modify as shown above
```

### Step 3: Update imports in parent components

```bash
# Find all references to the old components
grep -r "ItineraryInclusion" src/
grep -r "TravelInterests" src/
grep -r "TravelGroupSelector" src/

# Update imports in those files to point to new location
# Change from:
# import ItineraryInclusion from '@/components/ItineraryInclusion';
# To:
# import TripDetails from '@/components/TripDetails';
```

### Step 4: Remove old component files (after confirming everything works)

```bash
# Only after testing that everything works
rm src/components/ItineraryInclusion.tsx
rm src/components/TravelInterests.tsx
rm src/components/TravelGroupSelector.tsx
```

## 7. Update Usage in Parent Components

If these components were being used individually elsewhere, update to use the unified TripDetails component:

```typescript
// Before (using individual components):
import ItineraryInclusion from '@/components/ItineraryInclusion';
import TravelInterests from '@/components/TravelInterests';
import TravelGroupSelector from '@/components/TravelGroupSelector';

// In the render:
<TravelGroupSelector formData={formData} onFormChange={handleFormChange} />
<TravelInterests formData={formData} onFormChange={handleFormChange} />
<ItineraryInclusion formData={formData} onFormChange={handleFormChange} />

// After (using unified TripDetails):
import TripDetails from '@/components/TripDetails';

// In the render:
<TripDetails
  formData={formData}
  onFormChange={handleFormChange}
  showAdditionalForms={true} // or control visibility as needed
/>
```

## 8. Quick Validation Checklist

### Rapid Validation Steps

- [ ] All components render without errors
- [ ] Form state updates correctly
- [ ] All toggles and selections work
- [ ] "Other" text inputs appear when selected
- [ ] Expandable sections work in ItineraryInclusion
- [ ] Selected counts display correctly
- [ ] Styling matches other TripDetails components

## Optional: Add Section Visibility Control

If you want granular control over which sections show:

```typescript
// In parent component, control visibility:
interface TripDetailsSections {
  location?: boolean;
  dates?: boolean;
  travelers?: boolean;
  budget?: boolean;
  travelGroup?: boolean;
  interests?: boolean;
  itinerary?: boolean;
}

// Usage:
<TripDetails
  formData={formData}
  onFormChange={handleFormChange}
  visibleSections={{
    location: true,
    dates: true,
    travelers: true,
    budget: true,
    travelGroup: step >= 2, // Show based on step
    interests: step >= 2,
    itinerary: step >= 3,
  }}
/>;
```

This implementation maintains all existing functionality while organizing the components into a cohesive TripDetails module with shared types and consistent styling.
