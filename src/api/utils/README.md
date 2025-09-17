# API Utilities

This directory contains server-side utilities for API functions, edge runtime support, and backend observability.

## Structure

- **observability.ts**: LangSmith integration and tracing utilities
- **healthChecks.ts**: System health monitoring utilities
- **errorHandling.ts**: Centralized error handling and reporting
- **rateLimiting.ts**: Rate limiting utilities for API endpoints
- **validation.ts**: Request/response validation utilities
- **costTracking.ts**: LLM provider cost tracking and quota management

## Constitutional Compliance

All API utilities must:

- Run only in edge runtime environment
- Implement proper security measures (input validation, sanitization)
- Support multi-LLM provider resilience
- Include comprehensive error handling and fallback mechanisms
- Maintain observability with LangSmith tracing

## Usage

```typescript
import { withObservability } from './observability';
import { validateRequest } from './validation';
import { checkHealthStatus } from './healthChecks';

// Wrap API handlers with observability
export default withObservability(async (req: Request) => {
  const validatedData = await validateRequest(req, schema);
  const healthStatus = await checkHealthStatus();
  // ... handler logic
});
```
