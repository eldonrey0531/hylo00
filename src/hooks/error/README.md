# Error Handling Infrastructure

This directory contains React hooks and utilities for comprehensive error handling in the frontend application.

## Structure

- **useErrorContext.ts**: Error context provider and consumer hook
- **useErrorBoundary.ts**: Hook for interacting with error boundaries
- **useErrorRecovery.ts**: Error recovery and retry logic
- **useErrorReporting.ts**: Error reporting and tracking utilities

## Constitutional Compliance

All error handling hooks must:

- Implement progressive enhancement (graceful degradation)
- Use edge functions for external error reporting
- Maintain user experience during error states
- Support multi-LLM provider fallback mechanisms
- Include proper observability and logging

## Usage

```typescript
import { useErrorContext } from '@/hooks/error/useErrorContext';
import { useErrorRecovery } from '@/hooks/error/useErrorRecovery';

function MyComponent() {
  const { reportError, clearError } = useErrorContext();
  const { retry, canRetry, retryCount } = useErrorRecovery();

  const handleError = (error: Error) => {
    reportError(error, { component: 'MyComponent', action: 'data_fetch' });
  };

  return (
    // Component JSX with error handling
  );
}
```
