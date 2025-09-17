# Contract Tests

This directory contains API contract tests that validate the OpenAPI specifications defined in `/specs/004-production-hardening/contracts/api.yaml`.

## Test Categories

- **health-system.test.ts**: GET /api/health/system contract validation
- **health-providers.test.ts**: GET /api/health/providers contract validation
- **monitoring-errors.test.ts**: POST /api/monitoring/errors contract validation
- **monitoring-metrics.test.ts**: POST/GET /api/monitoring/metrics contract validation
- **security-events.test.ts**: POST /api/security/events contract validation

## Running Tests

```bash
npm run test:contract
```

## Contract Validation

Each test validates:

- Request/response schema compliance
- HTTP status code correctness
- Error response format consistency
- Authentication and authorization requirements
