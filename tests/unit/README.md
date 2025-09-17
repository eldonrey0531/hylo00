# Unit Tests

This directory contains isolated unit tests for individual components, hooks, services, and utilities.

## Test Categories

- **error-boundary.test.ts**: React Error Boundary component unit tests
- **monitoring-hooks.test.ts**: Monitoring hooks (useHealthMonitoring, usePerformanceTracking)
- **form-validation.test.ts**: Enhanced form validation logic
- **component-error-states.test.ts**: UI component error state handling
- **services/**: Service layer unit tests
- **utils/**: Utility function unit tests

## Running Tests

```bash
npm run test:unit
```

## Test Standards

Unit tests follow:

- Isolated testing (mocked dependencies)
- High code coverage (>90% target)
- Fast execution (<100ms per test)
- Clear test descriptions and assertions
