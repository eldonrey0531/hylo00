## 📋 TODO: Form Component Separation Implementation

### Phase 1: Setup & Structure (30 mins)

- [ ] **Create folder structure**
  ```
  src/components/TripDetails/
  ├── index.tsx
  ├── LocationForm.tsx
  ├── DatesForm.tsx
  ├── TravelersForm.tsx
  ├── BudgetForm.tsx
  ├── types.ts
  └── utils.ts
  ```

### Phase 2: Extract Shared Code (45 mins)

- [ ] **Create types.ts**

  - [ ] Move Currency type definition
  - [ ] Move BudgetMode type definition
  - [ ] Create FormData interface
  - [ ] Create BaseFormProps interface
  - [ ] Export all constants (YEAR_THRESHOLD, MAX_BUDGET, etc.)
  - [ ] Add currencySymbols object

- [ ] **Create utils.ts**
  - [ ] Extract dateUtils object with all methods:
    - [ ] parseMMDDYY
    - [ ] formatToMMDDYY
    - [ ] convertToInputFormat
    - [ ] getTodayString
    - [ ] calculateDaysBetween
    - [ ] isReturnDateValid

### Phase 3: Create Individual Components (2 hours)

- [ ] **LocationForm.tsx**

  - [ ] Import BaseFormProps from types
  - [ ] Implement location input field
  - [ ] Add onChange handler
  - [ ] Apply existing styles
  - [ ] Test standalone functionality

- [ ] **DatesForm.tsx**

  - [ ] Import types and dateUtils
  - [ ] Add state for localFlexibleDates
  - [ ] Create refs for date pickers
  - [ ] Implement date input handlers
  - [ ] Add flexible dates toggle
  - [ ] Add planned days dropdown
  - [ ] Show total days display
  - [ ] Test date validation logic

- [ ] **TravelersForm.tsx**

  - [ ] Import types and icons
  - [ ] Add local state for adults/children/ages
  - [ ] Implement counter buttons
  - [ ] Add children age selectors
  - [ ] Show total travelers display
  - [ ] Add validation for unselected ages
  - [ ] Test increment/decrement logic

- [ ] **BudgetForm.tsx**
  - [ ] Import types and currency symbols
  - [ ] Add local state for budgetRange and budgetMode
  - [ ] Implement flexible budget toggle
  - [ ] Add budget slider
  - [ ] Add currency selector
  - [ ] Add budget mode toggle
  - [ ] Test slider functionality

### Phase 4: Create Parent Component (30 mins)

- [ ] **index.tsx (TripDetails)**
  - [ ] Import all child components
  - [ ] Import FormData type
  - [ ] Create handleFormUpdate callback
  - [ ] Pass formData and onFormChange to children
  - [ ] Maintain existing layout structure
  - [ ] Test data flow between components

### Phase 5: Integration (45 mins)

- [ ] **Update parent imports**

  - [ ] Find all imports of TripDetailsForm
  - [ ] Change to import TripDetails from '@/components/TripDetails'
  - [ ] Update component usage in JSX

- [ ] **Verify functionality**
  - [x] Test location input saves correctly
  - [x] Test date picker functionality
  - [x] Test flexible dates toggle
  - [x] Test traveler counters
  - [x] Test children age selection
  - [x] Test budget slider
  - [x] Test currency selection
  - [x] Test all toggle switches

### Phase 6: Polish & Optimization (1 hour)

- [ ] **Code cleanup**

  - [ ] Remove unused imports
  - [ ] Add proper TypeScript types where missing
  - [ ] Remove console.logs
  - [ ] Format with Prettier

- [ ] **Performance optimizations**

  - [ ] Add useCallback where needed
  - [ ] Optimize re-renders with React.memo if necessary
  - [ ] Check for memory leaks in useEffect

- [ ] **Accessibility**
  - [ ] Verify all aria-labels are present
  - [ ] Test keyboard navigation
  - [ ] Ensure proper focus management

### Phase 7: Testing & Validation (30 mins)

- [x] **Manual testing**

  - [x] Test form submission with all fields
  - [x] Test form validation errors
  - [x] Test edge cases (min/max values)
  - [x] Test responsive design
  - [x] Test cross-browser compatibility

- [ ] **State management**
  - [ ] Verify parent state updates correctly
  - [ ] Check two-way data binding works
  - [ ] Ensure no state inconsistencies

### Phase 8: Documentation (15 mins)

- [x] **Code documentation**

  - [x] Add JSDoc comments to complex functions
  - [x] Document prop interfaces
  - [x] Add usage examples in comments

- [x] **Update README**
  - [x] Document new component structure
  - [x] Add migration notes
  - [x] Update any existing documentation

### Bonus: Future Enhancements (Optional)

- [ ] **Consider additional improvements**
  - [ ] Add loading states
  - [ ] Implement error boundaries
  - [ ] Add animation transitions
  - [ ] Create storybook stories
  - [ ] Add unit tests (if time permits)

## 🚀 Quick Start Commands

```bash
# Create folder structure
mkdir -p src/components/TripDetails

# Create all files at once
touch src/components/TripDetails/{index.tsx,LocationForm.tsx,DatesForm.tsx,TravelersForm.tsx,BudgetForm.tsx,types.ts,utils.ts}

# Run dev server to test
npm run dev

# Format code after implementation
npm run lint:fix
```

## ⏱️ Time Estimate

- **Total estimated time**: 5-6 hours
- **Minimum viable implementation**: 3-4 hours
- **With polish and testing**: 5-6 hours

## 🎯 Success Criteria

- ✅ All form functionality preserved
- ✅ No regression in user experience
- ✅ Clean component separation
- ✅ Reusable, maintainable code
- ✅ Type-safe implementation
- ✅ Parent-child data flow working

This checklist follows the rapid implementation approach from your HYLO guidelines - focusing on getting it working first, then polishing afterward.
