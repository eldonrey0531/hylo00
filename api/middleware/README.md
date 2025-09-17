# API Middleware

This directory contains middleware functions for API endpoints, focusing on error handling, security, and observability.

## Structure

- **error.ts**: Centralized error handling middleware
- **validation.ts**: Request/response validation middleware
- **rateLimiting.ts**: Rate limiting and quota management
- **security.ts**: Security headers and input sanitization
- **cors.ts**: CORS configuration for edge functions
- **observability.ts**: Request/response logging and tracing

## Constitutional Compliance

All middleware must:

- Be compatible with Vercel Edge Runtime
- Implement proper error boundaries and fallback mechanisms
- Include comprehensive logging and observability
- Enforce security best practices
- Support multi-provider resilience patterns

## Usage

```typescript
import { withErrorHandling } from './error';
import { withValidation } from './validation';
import { withObservability } from './observability';

export default withErrorHandling(
  withValidation(
    withObservability(async (req: Request) => {
      // API handler logic
      return new Response('OK');
    })
  )
);
```
