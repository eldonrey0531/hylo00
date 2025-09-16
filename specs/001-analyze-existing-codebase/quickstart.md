# Quickstart Guide: Hylo Constitutional Compliance

**Date**: 2025-09-17 | **Feature**: 001-analyze-existing-codebase  
**Purpose**: Validate current system and guide constitutional migration

## Prerequisites

- Node.js 18+ and npm
- Git for version control
- Access to AI provider API keys (for future migration)
- Vercel CLI (for deployment testing)

## Current System Validation

### 1. Setup Development Environment

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd hylo

# Install dependencies
npm install

# Verify current build works
npm run build

# Start development server
npm run dev
```

**Expected Result**: Application loads at http://localhost:5173 with travel planning form

### 2. Test Current Functionality

```bash
# In browser, navigate to http://localhost:5173
# Complete the travel form:
```

**Test Data**:

- **Destination**: Tokyo, Japan
- **Dates**: June 15-25, 2025 (10 days)
- **Travelers**: 2 adults, 2 children (ages 8, 12)
- **Budget**: $8,000 USD
- **Preferences**: Family, Culture, Food, Nature
- **Inclusions**: Accommodations, Activities, Dining

**Expected Behavior**:

1. Form accepts all inputs without validation errors
2. "Generate Itinerary" button becomes clickable
3. Click generates streaming AI response with agent logs
4. Final itinerary appears with travel recommendations
5. Behind-the-scenes panel shows agent activity

**Success Criteria**:

- ✅ Form submission works
- ✅ AI agents execute in sequence
- ✅ Itinerary generation completes
- ✅ Real-time agent logging displays

### 3. Identify Constitutional Violations

Run this analysis checklist on the current system:

```bash
# Check for exposed API keys (SECURITY VIOLATION)
grep -r "VITE_GROQ_API_KEY" src/
# Result: Found in multiple files ❌

# Check for edge function architecture (EDGE-FIRST VIOLATION)
ls api/
# Result: No api/ directory ❌

# Check for multi-provider support (RESILIENCE VIOLATION)
grep -r "cerebras\|gemini" src/
# Result: Only Groq provider found ❌

# Check for observability setup (OBSERVABLE OPERATIONS VIOLATION)
grep -r "langsmith\|tracing" src/
# Result: No LangSmith integration ❌

# Check for testing infrastructure (QUALITY VIOLATION)
ls tests/ || ls __tests__/ || ls *.test.*
# Result: No test files found ❌

# Check for progressive enhancement (ENHANCEMENT VIOLATION)
grep -r "fallback\|degraded\|error.*boundary" src/
# Result: Limited error handling ❌

# Check for cost management (COST-CONSCIOUS VIOLATION)
grep -r "quota\|usage\|throttle\|cache" src/
# Result: No cost tracking ❌
```

**Constitutional Status**: 7/7 requirements need attention ❌

## Migration Validation

### 4. Test Migration Readiness

```bash
# Check TypeScript configuration
npx tsc --noEmit
# Expected: No compilation errors ✅

# Analyze bundle size (target: <200KB)
npm run build
npx bundlesize
# Current: Needs measurement

# Check for security vulnerabilities
npm audit
# Expected: No high/critical vulnerabilities

# Verify environment variable usage
grep -r "process.env" src/
# Expected: Only VITE_ prefixed variables in frontend
```

### 5. API Contract Validation (Future)

After edge function migration, validate API contracts:

```bash
# Install test dependencies
npm install --save-dev jest @types/jest zod

# Run contract tests
npm test contracts/api.test.ts
# Expected: All tests pass ✅

# Test health endpoint
curl http://localhost:3000/api/health
# Expected: Provider status information

# Test streaming endpoint
curl -X POST http://localhost:3000/api/itinerary \
  -H "Content-Type: application/json" \
  -d @test-data/valid-request.json
# Expected: Server-sent events stream
```

### 6. Performance Validation

```bash
# Measure streaming start time (<2s requirement)
time curl -X POST http://localhost:3000/api/itinerary \
  -H "Content-Type: application/json" \
  -d @test-data/valid-request.json \
  | head -1
# Expected: First response within 2 seconds

# Test rate limiting
for i in {1..10}; do
  curl -w "%{http_code}\n" -o /dev/null -s \
    -X POST http://localhost:3000/api/itinerary \
    -H "Content-Type: application/json" \
    -d @test-data/valid-request.json
done
# Expected: Some 429 responses (rate limited)
```

## Deployment Validation

### 7. Vercel Edge Function Testing

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Test edge function performance
curl -w "@curl-format.txt" \
  https://your-deployment.vercel.app/api/health
# Expected: Low latency from edge locations

# Verify environment variables
vercel env ls
# Expected: API keys not exposed, proper scoping
```

### 8. Multi-Provider Validation (After Migration)

```bash
# Test provider fallback chain
# Simulate Groq failure
curl -X POST https://your-deployment.vercel.app/api/itinerary \
  -H "X-Test-Provider-Failure: groq" \
  -H "Content-Type: application/json" \
  -d @test-data/valid-request.json
# Expected: Fallback to Gemini or Cerebras

# Test cost tracking
curl https://your-deployment.vercel.app/api/providers
# Expected: Usage statistics for all providers
```

## Success Validation Checklist

### Functional Requirements ✅

- [ ] Travel form captures all required data
- [ ] AI agents process preferences accurately
- [ ] Itinerary generation produces relevant results
- [ ] Real-time feedback shows agent progress
- [ ] Error handling provides clear guidance

### Constitutional Requirements (After Migration)

- [ ] **Edge-First**: All AI operations through Vercel Edge Functions
- [ ] **Multi-LLM Resilience**: Cerebras, Gemini, Groq with fallbacks
- [ ] **Observable Operations**: LangSmith tracing on all AI calls
- [ ] **Type-Safe Development**: Strict TypeScript, no `any` types
- [ ] **Progressive Enhancement**: Graceful degradation during failures
- [ ] **Cost-Conscious Design**: Usage tracking, quota management
- [ ] **Security by Default**: No exposed keys, proper input validation

### Performance Requirements

- [ ] Streaming response starts within 2 seconds
- [ ] Complete itinerary generation within 30 seconds
- [ ] Page load (LCP) under 2.5 seconds
- [ ] Bundle size under 200KB
- [ ] API response time under 500ms (health checks)

### Quality Requirements

- [ ] 80%+ code coverage for non-UI logic
- [ ] All TypeScript compilation passes
- [ ] Security audit shows no vulnerabilities
- [ ] Contract tests validate API behavior
- [ ] E2E tests cover critical user journeys

## Troubleshooting

### Common Issues

**API Key Exposure Error**:

```bash
# Problem: VITE_GROQ_API_KEY visible in browser
# Solution: Move to edge function environment variables
```

**Streaming Response Timeout**:

```bash
# Problem: Generation takes too long
# Solution: Implement provider routing based on complexity
```

**Rate Limiting Errors**:

```bash
# Problem: Single provider quota exceeded
# Solution: Implement multi-provider fallback chain
```

**Bundle Size Too Large**:

```bash
# Problem: Frontend bundle exceeds 200KB
# Solution: Code splitting and dependency optimization
```

**TypeScript Compilation Errors**:

```bash
# Problem: Type errors during build
# Solution: Strict type definitions for all APIs
```

## Next Steps

1. **Complete Phase 2**: Generate detailed migration tasks
2. **Implement Edge Functions**: Move AI logic to `/api` directory
3. **Add Multi-Provider Support**: Implement Cerebras, Gemini, Groq
4. **Integrate LangSmith**: Add comprehensive tracing
5. **Add Testing Infrastructure**: Contract, integration, and E2E tests
6. **Implement Security**: Input validation, rate limiting, CORS
7. **Add Performance Monitoring**: Bundle analysis, response time tracking
8. **Deploy and Validate**: Vercel deployment with edge functions

This quickstart provides validation steps for both the current system and the planned constitutional migration.
