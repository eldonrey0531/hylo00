# GitHub Copilot Instructions - Hylo Travel AI Platform

##```
src/
├── components/
│   ├── ConditionalTravelStyle.tsx    # Primary target for container styling
│   ├── TravelStyleChoice.tsx         # May need button styling review
│   └── GenerateItineraryButton.tsx   # For duplicate removal
├── types/
│   └── travel-style-choice.ts        # Type definitions (no changes)
└── App.tsx                           # Container styling integration

api/                                   # Edge functions
tests/                                 # Test files
specs/004-fix-travel-style/           # Current feature docs
```t
Hylo is a travel planning platform using React + TypeScript frontend with Vercel Edge Functions backend. Multi-agent AI system for personalized itinerary generation.

## Current Stack
- **Frontend**: React 18.3.1, TypeScript 5.5.3, Vite, Tailwind CSS 3.4.1
- **Forms**: React Hook Form 7.62.0 + Zod 3.25.76 validation
- **Icons**: Lucide React 0.344.0
- **Testing**: Vitest 3.2.4 + React Testing Library 16.3.0
- **AI**: Cerebras, Google Gemini, Groq SDK integrations
- **Backend**: Vercel Edge Functions, LangSmith tracing

## Architecture Patterns
- **TDD**: Tests before implementation (required)
- **Type Safety**: TypeScript strict mode, Zod runtime validation
- **Edge-First**: All APIs run on Vercel Edge Runtime  
- **Component-Based**: Functional React components with hooks
- **Multi-Agent**: LLM orchestration for travel planning

## Code Style
- **Components**: PascalCase, functional with TypeScript interfaces
- **Files**: Use existing file structure in src/components/TripDetails/
- **Styling**: Tailwind utilities, design tokens (primary, border-primary)
- **Forms**: React Hook Form patterns with Zod schemas
- **Tests**: .test.tsx files, React Testing Library patterns

## Current Feature: Travel Style Styling Fix (Branch: 004-fix-travel-style)
**Context**: Fixing visual inconsistencies in travel style section background colors and button duplication.

**Key Components**:
- `ConditionalTravelStyle.tsx`: Needs yellow background container like trip details
- Travel style forms: Must preserve #ece8de background colors
- `GenerateItineraryButton`: Remove duplication before choice selection

**Requirements**:
- Travel style section MUST have `bg-trip-details` (#b0c29b) background
- All forms MUST maintain `bg-form-box` (#ece8de) backgrounds  
- NO #406170 backgrounds anywhere in travel style content
- Exactly one GenerateItineraryButton per page
- Background consistency across all travel style states

**Styling Approach**:
- Use `bg-trip-details` for travel style container
- Preserve existing `bg-form-box` on all form components
- NEVER use `bg-primary` (#406170) in travel style content
- Maintain design token hierarchy: section bg → form bg → input bg

## Constitutional Requirements
- **TDD Mandatory**: Write failing tests first
- **TypeScript Strict**: No any types, proper interfaces
- **Performance**: No additional re-renders, maintain <2s API response
- **Accessibility**: Preserve ARIA labels, keyboard navigation
- **Cost Conscious**: No impact on LLM costs for UI changes

## Recent Changes (Keep Updated)
1. **2025-09-19**: Travel style section styling fix specification created
2. **2025-09-19**: Implementation planning completed for styling consistency
3. **Feature Focus**: ConditionalTravelStyle container background + form preservation + button cleanup

## Key File Locations
```
src/
â”œâ”€â”€ components/TripDetails/
â”‚   â”œâ”€â”€ TravelersForm.tsx              # Main target for centering
â”‚   â””â”€â”€ PreferenceModals/              # Modal styling targets
â”‚       â”œâ”€â”€ AccommodationPreferences.tsx
â”‚       â””â”€â”€ RentalCarPreferences.tsx
â”œâ”€â”€ types/                             # TypeScript interfaces
â”œâ”€â”€ hooks/                             # Custom React hooks  
â””â”€â”€ utils/validation/                  # Zod schemas

api/                                   # Edge functions
tests/                                 # Test files
specs/001-ui-improvements-for/         # Current feature docs
```

## Avoid
- Adding new dependencies for UI-only changes
- Breaking existing TypeScript interfaces
- Changing component prop structures
- Impacting AI/LLM functionality
- Modifying API contracts for frontend changes
- Using inline styles instead of Tailwind
- Removing accessibility features

## When Suggesting Code
1. **Show TypeScript interfaces** for component props
2. **Include Tailwind classes** in examples  
3. **Provide test examples** using React Testing Library
4. **Maintain existing patterns** from codebase
5. **Consider responsive design** (mobile, tablet, desktop)
6. **Preserve functionality** while improving visuals

## Example Pattern
```typescript
// Preferred component pattern
interface TravelersFormProps extends BaseFormProps {
  formData: { adults: number; children: number };
  onFormChange: (data: Partial<FormData>) => void;
}

const TravelersForm: React.FC<TravelersFormProps> = ({ formData, onFormChange }) => {
  const totalTravelers = formData.adults + formData.children;
  
  return (
    <div className="text-center border-4 border-primary p-4 font-raleway font-bold">
      Total travelers: {totalTravelers}
    </div>
  );
};
```

*Last Updated: 2025-09-19 | Current Feature: Travel Style Styling Fix | Constitution v2.0.0*

