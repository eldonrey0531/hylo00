# 📋 Form UI Enhancement Todo List

## 🗓️ Date Fields Enhancement

- [ ] Replace text inputs with date pickers in `TripDetailsForm.tsx`
  - [ ] Add click handler to entire date input container
  - [ ] Use HTML5 `<input type="date">` for native calendar
  - [ ] Format date display to MM/DD/YY after selection
  - [ ] Ensure validation still works with `dateUtils`

## 💰 Budget Slider Fix

- [ ] Fix budget slider display tracking in `TripDetailsForm.tsx`
  - [ ] Add `onChange` event to update display in real-time
  - [ ] Ensure `budgetDisplay` updates when slider moves
  - [ ] Add visual indicator that follows the slider thumb

## 🎯 Preference Modal Fixes

- [ ] Debug and fix button/field interaction issues
  - [ ] Locate preference modal component
  - [ ] Check for event.preventDefault() or stopPropagation issues
  - [ ] Verify z-index and overlay positioning
  - [ ] Ensure form fields are not disabled

## 🏨 Accommodations "Other" Field

- [ ] Add conditional text field in accommodation preferences
  - [ ] Update accommodation preferences component
  - [ ] Show text area when "Other" is selected
  - [ ] Add prompt: "Tell us more about your preferred preferences"
  - [ ] Update validation schema to include other text
  - [ ] Save other text in `inclusionPreferences`

## 🚗 Rental Car Multi-Select

- [ ] Convert vehicle type to multi-select in rental car preferences
  - [ ] Update `RentalCarPreferencesSchema` in `preference-modal-schema.ts`
  - [ ] Change from radio buttons to checkboxes
  - [ ] Store selections as array instead of single value
  - [ ] Add "Select multiple" helper text
  - [ ] Update form validation for array values

## 🎨 Travel Interests Text Update

- [ ] Change label in `TravelInterests.tsx`
  - [ ] Update "Select all that apply" to "Select all that apply to this trip"
  - [ ] Verify text alignment and styling remains consistent

## 💵 Budget Flexibility Toggle

- [ ] Add flexibility toggle to Budget section in `TripDetailsForm.tsx`
  - [ ] Add toggle switch UI component
  - [ ] Label: "I'm not sure or my budget is flexible"
  - [ ] When toggled ON: Hide slider and amount display
  - [ ] When toggled OFF: Show normal budget controls
  - [ ] Update `flexibleBudget` field in form data
  - [ ] Similar pattern to `flexibleDates` implementation

## 🧳 Travel Style Progressive Disclosure

- [ ] Implement travel style show/hide logic in `TripDetailsForm.tsx`
  - [ ] Update button click handlers (lines 827-856)
  - [ ] Button 1: "Answer style questions" - shows travel style components
  - [ ] Button 2: "Skip ahead" - jumps to trip nickname
  - [ ] Use `travelStyleChoice` field to track selection
  - [ ] Conditionally render travel style components based on choice
  - [ ] Import and integrate: `TravelExperience`, `TripVibe`, `SampleDays`, `DinnerChoice`
  - [ ] Ensure smooth transitions between sections

## 📝 Notes

- Use existing Tailwind classes for consistency
- Follow current color scheme: `bg-form-box`, `bg-[#b0c29b]`, etc.
- Maintain rounded corners style: `rounded-[36px]`
- Use `useCallback` for event handlers
- Preserve existing form data structure
