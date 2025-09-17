# Monitoring Utilities

This directory contains client-side monitoring utilities for health tracking, performance monitoring, and observability.

## Structure

- **healthMonitoring.ts**: Client-side health monitoring utilities
- **performanceTracking.ts**: Performance metrics collection and tracking
- **errorTracking.ts**: Error tracking and reporting utilities
- **costTracking.ts**: Cost monitoring for LLM provider usage
- **analytics.ts**: Analytics and user behavior tracking
- **logger.ts**: Structured logging utilities for frontend

## Constitutional Compliance

All monitoring utilities must:

- Never expose sensitive data or API keys
- Use edge functions for any external service communication
- Implement proper error boundaries
- Support progressive enhancement (work without full functionality)
- Respect user privacy and data protection requirements

## Usage

```typescript
import { trackPerformance } from '@/utils/monitoring/performanceTracking';
import { reportError } from '@/utils/monitoring/errorTracking';
import { logHealth } from '@/utils/monitoring/healthMonitoring';

// Track performance metrics
trackPerformance('component_render', startTime, endTime, { component: 'ItineraryForm' });

// Report errors with context
reportError(error, { component: 'ErrorBoundary', userAction: 'form_submit' });

// Log health status
logHealth('llm_provider', { provider: 'groq', status: 'available', latency: 150 });
```
