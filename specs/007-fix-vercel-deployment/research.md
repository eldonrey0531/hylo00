# Research: Fix Vercel Deployment Errors

**Date**: September 17, 2025
**Feature**: 007-fix-vercel-deployment
**Researcher**: GitHub Copilot

## Research Questions

### 1. TypeScript Compilation Errors Analysis

**Question**: What specific TypeScript errors exist in provider files and how should they be resolved?

**Findings**:

- **factory.ts line 319**: ProviderStatus type comparison error - string literal being compared to ProviderStatus enum
- **cerebras.ts**: ProviderStatus assignment error - string "available" not assignable to ProviderStatus type
- **gemini.ts**: ProviderStatus assignment error - string "available" not assignable to ProviderStatus type
- **groq.ts**: ProviderStatus assignment error - string "available" not assignable to ProviderStatus type
- **cerebras.ts/gemini.ts**: Missing 'apiKeyName' property in config objects

**Decision**: Use proper ProviderStatus enum values instead of string literals, add missing apiKeyName properties
**Rationale**: Maintains type safety and consistency with existing codebase patterns
**Alternatives Considered**: Type assertions (rejected due to strict mode), changing enum values (rejected due to breaking changes)

### 2. Vercel Function Limit Analysis

**Question**: How many serverless functions currently exist and which can be consolidated?

**Findings**:

- Current vercel.json defines 6+ functions: route, providers, cerebras, gemini, groq, health
- Vercel Hobby plan limit: 12 functions maximum
- Current count appears to be within limits, but deployment errors suggest otherwise

**Decision**: Audit actual function count and consolidate where possible without violating separation of concerns
**Rationale**: Maintains architectural clarity while meeting deployment constraints
**Alternatives Considered**: Single monolithic function (rejected due to complexity), client-side processing (rejected due to security)

### 3. Provider Configuration Patterns

**Question**: What are the correct patterns for ProviderStatus and config objects?

**Findings**:

- ProviderStatus enum: 'available', 'unavailable', 'error', 'rate_limited'
- Config objects need apiKeyName property for environment variable mapping
- Factory pattern used for provider instantiation and status checking

**Decision**: Standardize on enum values and required config properties
**Rationale**: Ensures consistency and type safety across all providers
**Alternatives Considered**: Optional properties (rejected due to runtime safety), dynamic typing (rejected due to constitution)

### 4. Build Process Validation

**Question**: How to ensure TypeScript compilation succeeds on Vercel?

**Findings**:

- Vercel uses `npm run build` which runs TypeScript compilation
- Strict mode enabled in tsconfig.json
- Edge functions require proper export patterns

**Decision**: Fix type errors and validate with local build before deployment
**Rationale**: Ensures deployment reliability and catches issues early
**Alternatives Considered**: Disable strict mode (rejected due to constitution), custom build scripts (unnecessary complexity)

## Technical Approach

### Type Error Resolution Strategy

1. Replace string literals with ProviderStatus enum values
2. Add missing apiKeyName properties to config objects
3. Ensure all type assignments are valid in strict mode

### Function Consolidation Strategy

1. Audit current vercel.json function definitions
2. Identify consolidation opportunities (health + providers → single status endpoint)
3. Maintain API contract compatibility

### Validation Strategy

1. Local TypeScript compilation testing
2. Vercel build simulation
3. Function count verification

## Dependencies & Integrations

- **LangChain.js**: Provider abstractions remain unchanged
- **Vercel Edge Runtime**: Function definitions must maintain edge compatibility
- **TypeScript 5.x**: Strict mode compliance required
- **Environment Variables**: apiKeyName properties must map to existing env vars

## Risk Assessment

- **Low Risk**: Type fixes are localized to provider files
- **Low Risk**: Function consolidation maintains existing contracts
- **Medium Risk**: Build process changes could affect deployment pipeline

## Success Criteria

- TypeScript compilation succeeds without errors
- Vercel deployment completes within function limits
- All existing functionality preserved
- Constitutional compliance maintained
