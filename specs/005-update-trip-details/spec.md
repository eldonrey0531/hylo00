# Feature Specification: Trip Details Enhancements

**Feature Branch**: `005-update-trip-details`  
**Created**: September 19, 2025  
**Status**: Draft  
**Input**: User description: "Update trip details index.tsx for budget fields (total trip budget, per-person budget with switch), update travel group with specific names in UI, include 'other' choice option, ensure travel interest data picks specific choice names including 'other', update itinerary inclusions data to include all choices and preferences including 'other' options, gather all travel style form options (travel experience level, trip vibe, sample travel days, dinner preferences), update travel nickname form to only include trip nickname, your name, and email fields"

## User Scenarios & Testing

### Primary User Story
As a user planning a trip, I want to provide detailed budget information with per-person vs total trip options, specify my travel group with custom options, select travel interests including custom choices, configure itinerary inclusions with preferences, complete travel style forms with all available options, and provide only essential contact information (trip nickname, name, email) so that the system can generate a more personalized and accurate travel itinerary.

### Acceptance Scenarios
1. **Given** I'm setting my budget, **When** I toggle between "Total trip budget" and "Per-person budget", **Then** the budget display should update to reflect the correct calculation mode and show appropriate labeling
2. **Given** I'm selecting my travel group, **When** I choose "Other" option, **Then** I should see a text input field to specify my custom travel group name
3. **Given** I'm selecting travel interests, **When** I choose from available options including "Other", **Then** my selections should capture both predefined options and custom text for "Other"
4. **Given** I'm configuring itinerary inclusions, **When** I select options including "Other", **Then** the system should capture my selections and any associated preferences
5. **Given** I'm completing travel style forms, **When** I interact with experience level, trip vibe, sample days, and dinner preference questions, **Then** all my selections should be captured including any "Other" options with custom text
6. **Given** I'm providing contact information, **When** I fill out the trip nickname form, **Then** I should only see fields for trip nickname, my name, and email address

### Edge Cases
- What happens when user selects multiple travel groups including "Other"?
- How does the budget calculation display when switching between total and per-person with different traveler counts?
- What happens when user provides custom text for multiple "Other" options across different forms?
- How does the system handle empty custom text fields when "Other" is selected?

## Requirements

### Functional Requirements

#### Budget Form Enhancements
- **FR-001**: System MUST display both "Total trip budget" and "Per-person budget" options with a toggle switch
- **FR-002**: System MUST calculate and display budget amounts correctly based on selected mode (total vs per-person)
- **FR-003**: Budget display MUST update dynamically when switching between total and per-person modes
- **FR-004**: Per-person calculations MUST account for the number of travelers specified in the travelers form

#### Travel Group Selection
- **FR-005**: System MUST display all predefined travel group options with their specific names (Family, Couple, Solo, Friends, Large Group, Extended Family, Business Associates)
- **FR-006**: System MUST include an "Other" option in travel group selection
- **FR-007**: When "Other" is selected, system MUST provide a text input field for custom travel group specification
- **FR-008**: System MUST capture and store both predefined group selections and custom text for "Other" option

#### Travel Interest Data Collection
- **FR-009**: System MUST capture specific choice names for all selected travel interests
- **FR-010**: System MUST include "Other" as a selectable option in travel interests
- **FR-011**: When "Other" travel interest is selected, system MUST provide text input for custom interest specification
- **FR-012**: System MUST store both predefined interest selections and custom text

#### Itinerary Inclusions Enhancement
- **FR-013**: System MUST include all available itinerary inclusion options (Flights, Accommodations, Rental Car, Activities & Tours, Dining, Entertainment, Nature, Train Tickets, Cruise)
- **FR-014**: System MUST include "Other" as an option in itinerary inclusions
- **FR-015**: System MUST collect preferences for selected inclusions where applicable
- **FR-016**: System MUST capture custom text when "Other" inclusion option is selected

#### Travel Style Form Data Collection
- **FR-017**: System MUST capture selections from "What is your group's level of travel experience?" form with all available options
- **FR-018**: System MUST capture selections from "What do you want the 'vibe' of this trip to be?" form including "Other" option with custom text
- **FR-019**: System MUST capture selections from "Which of these sample travel days are you drawn to?" form
- **FR-020**: System MUST capture selections from "You just landed and are starving. Where are you having dinner?" form
- **FR-021**: For travel style forms with "Other" options, system MUST provide text input fields and capture custom responses

#### Trip Nickname Form Simplification
- **FR-022**: Trip nickname form MUST contain only three fields: trip nickname, user name, and email address
- **FR-023**: System MUST remove any additional fields from the trip nickname form not specified in FR-022
- **FR-024**: All three fields MUST be clearly labeled and properly validated

### Key Entities

- **Budget Configuration**: Represents budget settings including amount, currency, mode (total/per-person), and flexibility options
- **Travel Group Selection**: Represents selected travel groups with both predefined options and custom text for "Other"
- **Travel Interest Data**: Represents selected interests with specific choice names and custom text for additional interests
- **Itinerary Inclusion Preferences**: Represents selected inclusions with associated preference settings and custom options
- **Travel Style Responses**: Represents responses to all travel style questionnaires including experience level, trip vibe, sample days, and dinner preferences
- **Contact Information**: Simplified contact data containing only trip nickname, user name, and email address

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
