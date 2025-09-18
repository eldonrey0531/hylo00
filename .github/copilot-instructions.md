# GitHub Copilot Instructions - Hylo Travel AI Platform

## Project Context
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

## Current Feature: UI Improvements (Branch: 001-ui-improvements-for)
**Context**: Updating travel form components for better visual presentation and file cleanup.

**Key Components**:
- `TravelersForm.tsx`: Needs centered "Total travelers: X" display with thick border
- `PreferenceModals/AccommodationPreferences.tsx`: Remove border interruptions
- `PreferenceModals/RentalCarPreferences.tsx`: Remove border interruptions

**Requirements**:
- Center text alignment for traveler count
- Thick prominent borders using existing design tokens  
- Full-width modal backgrounds without border interruptions
- Remove duplicate files in wrong locations
- Preserve all existing functionality and accessibility

**Styling Approach**:
- Use Tailwind classes: `text-center`, `border-4`, `border-primary`
- Maintain `font-raleway` and `font-bold` for consistency
- Remove conflicting border classes from modals
- Ensure `w-full` for full-width backgrounds

## Constitutional Requirements
- **TDD Mandatory**: Write failing tests first
- **TypeScript Strict**: No any types, proper interfaces
- **Performance**: No additional re-renders, maintain <2s API response
- **Accessibility**: Preserve ARIA labels, keyboard navigation
- **Cost Conscious**: No impact on LLM costs for UI changes

## Recent Changes (Keep Updated)
1. **2025-09-19**: UI improvements specification created
2. **2025-09-19**: Implementation planning completed  
3. **Feature Focus**: TravelersForm styling + preference modal backgrounds

## Key File Locations
```
src/
├── components/TripDetails/
│   ├── TravelersForm.tsx              # Main target for centering
│   └── PreferenceModals/              # Modal styling targets
│       ├── AccommodationPreferences.tsx
│       └── RentalCarPreferences.tsx
├── types/                             # TypeScript interfaces
├── hooks/                             # Custom React hooks  
└── utils/validation/                  # Zod schemas

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

*Last Updated: 2025-09-19 | Current Feature: UI Improvements | Constitution v2.0.0*