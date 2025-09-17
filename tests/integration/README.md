# Integration Tests

This directory contains integration tests that validate interactions between different system components while respecting the constitutional requirements.

## Test Categories

- **error-boundary-recovery.test.ts**: Error boundary integration with recovery mechanisms
- **llm-fallback.test.ts**: Multi-LLM provider fallback chain integration
- **travel-workflow.test.ts**: Core travel planning workflow integration
- **monitoring-flow.test.ts**: Real-time monitoring and observability integration
- **performance-degradation.test.ts**: Performance monitoring and degradation handling

## Running Tests

```bash
npm run test:integration
```

## Constitutional Compliance

Integration tests verify:

- Edge function communication patterns
- LLM provider routing and fallback behavior
- Observability integration with LangSmith
- Error handling across system boundaries
