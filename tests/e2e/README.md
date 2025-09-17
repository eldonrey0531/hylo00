# End-to-End Tests

This directory contains comprehensive E2E tests using Playwright that validate the complete user journey through the Hylo travel planning application.

## Test Categories

- **travel-planning.spec.ts**: Complete travel planning workflow from form submission to itinerary generation
- **error-recovery.spec.ts**: Error boundary and recovery scenarios
- **multi-device.spec.ts**: Cross-browser and device compatibility tests
- **performance.spec.ts**: E2E performance validation tests

## Running Tests

```bash
npm run test:e2e
```

## Constitutional Requirements

All E2E tests must validate:

- Edge-first architecture (no direct LLM calls from frontend)
- Multi-LLM resilience (fallback chain functionality)
- Observable operations (proper logging and tracing)
- Progressive enhancement (graceful degradation)
