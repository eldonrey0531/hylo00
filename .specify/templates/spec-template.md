# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints, validation needs
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Validation section
   → Focus on behavior validation rather than test creation
5. Generate Functional Requirements
   → Each requirement must be implementable and validatable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ✅ Include validation criteria for implementation
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders and developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Focus on validation**: Describe how to verify the feature works, not how to test it
3. **Think like a developer**: Requirements should be specific enough to implement without guessing
4. **Common underspecified areas**:
   - User types and permissions
   - Data validation rules
   - Performance expectations
   - Error handling behaviors
   - Success criteria for implementation

---

## User Scenarios & Validation _(mandatory)_

### Primary User Story

[Describe the main user journey in plain language]

### Implementation Validation Scenarios

1. **When** [action is performed], **Verify** [expected outcome is achieved]
2. **When** [condition exists], **Verify** [system behaves as expected]

### Edge Cases

- How should system behave when [unusual input] is provided?
- What should happen when [resource limitation] occurs?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST [specific capability] with validation: [how to verify]
- **FR-002**: System MUST [specific capability] with validation: [how to verify]
- **FR-003**: Users MUST be able to [key interaction] with validation: [how to verify]

_Example of marking unclear requirements:_

- **FR-004**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-005**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Implementation Constraints _(include if specific constraints exist)_

- Must integrate with [existing system] without breaking changes
- Must comply with [specific regulation or standard]
- Must maintain backward compatibility with [existing feature]

### Performance Expectations _(include if relevant)_

- Should handle [number] concurrent users with [response time]
- Should process [amount] of data within [time constraint]

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Includes validation criteria for implementation
- [ ] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are implementable and validatable
- [ ] Validation criteria are clear and measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---

## Implementation Notes

_This section is added during the planning phase, not in the initial spec_

**Technical Approach**: [Added during /plan phase based on research]
**Key Decisions**: [Added during /plan phase based on technical constraints]
**Validation Strategy**: [Added during /plan phase describing how to verify implementation]

---
