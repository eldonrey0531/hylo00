# Quickstart: DNS & Deployment Fixes

**Feature**: 005-dns-deployment-fixes  
**Date**: 2025-01-17  
**Prerequisites**: Node.js 18+, Git, Vercel CLI

## Overview

This quickstart guide helps you test and validate the DNS verification and TypeScript compliance fixes for the Hylo Travel AI application.

## Quick Setup

### 1. Environment Setup

```bash
# Clone and setup the repository
git clone https://github.com/cbanluta2700/hylo.git
cd hylo
git checkout 005-dns-deployment-fixes

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Required environment variables for testing
echo "CEREBRAS_API_KEY=your_cerebras_key" >> .env.local
echo "GEMINI_API_KEY=your_gemini_key" >> .env.local
echo "GROQ_API_KEY=your_groq_key" >> .env.local
```

### 2. TypeScript Compliance Verification

```bash
# Check TypeScript compilation (should pass with zero errors)
npm run type-check

# Expected output:
# > hylo@1.0.0 type-check
# > tsc --noEmit
# (no output = success)

# Run linting to verify strict mode compliance
npm run lint

# Build the application to ensure all types are correct
npm run build
```

### 3. Provider Status Testing

```bash
# Start the development server
npm run dev

# In a new terminal, test provider status endpoints
curl http://localhost:3000/api/providers/status

# Expected response:
# {
#   "providers": [
#     {
#       "name": "cerebras",
#       "status": "available" | "degraded" | "unavailable" | "maintenance",
#       "isHealthy": boolean
#     },
#     // ... other providers
#   ],
#   "timestamp": "2025-01-17T...",
#   "healthy": boolean
# }

# Test detailed provider status
curl http://localhost:3000/api/providers/cerebras/status
curl http://localhost:3000/api/providers/gemini/status
curl http://localhost:3000/api/providers/groq/status
```

### 4. DNS Verification Testing (Local)

```bash
# Test DNS verification endpoint (will return 404 until implemented)
curl -X POST http://localhost:3000/api/dns/verify \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "recordType": "A",
    "timeout": 300000,
    "retryInterval": 30000,
    "maxRetries": 10
  }'

# Expected: 404 Not Found (endpoint not implemented yet)
# After implementation: 202 Accepted with verification ID
```

## Deployment Testing

### 1. Vercel Deployment

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview environment
vercel --prod=false

# Expected output should include:
# - Successful build
# - Function deployment (3 Edge Functions)
# - Preview URL

# Test the deployed endpoints
curl https://your-preview-url.vercel.app/api/providers/status
```

### 2. DNS Propagation Verification

```bash
# Check DNS resolution for the deployed domain
nslookup your-preview-url.vercel.app

# Verify HTTPS certificate
curl -I https://your-preview-url.vercel.app

# Expected: 200 OK with proper SSL certificate
```

### 3. Production Deployment

```bash
# Deploy to production (only after preview testing passes)
vercel --prod

# Monitor deployment logs
vercel logs your-domain.vercel.app

# Verify production endpoints
curl https://your-domain.vercel.app/api/providers/status
```

## Testing Scenarios

### Scenario 1: TypeScript Strict Mode Compliance

**Goal**: Verify all TypeScript errors are resolved

**Steps**:

1. Run `npm run type-check`
2. Verify no compilation errors
3. Run `npm run build`
4. Verify successful build

**Success Criteria**:

- Zero TypeScript compilation errors
- Successful build output
- All provider status methods properly typed

### Scenario 2: Provider Status Consistency

**Goal**: Verify provider status handling is type-safe and consistent

**Steps**:

1. Start development server
2. Call `/api/providers/status`
3. For each provider, call `/api/providers/{id}/status`
4. Verify status consistency between endpoints

**Success Criteria**:

- Summary status matches detailed status
- All required fields present
- Proper enum values for status
- Non-negative metrics

### Scenario 3: Multi-Agent Service Property Access

**Goal**: Verify index signature property access works correctly

**Steps**:

1. Create test travel form data
2. Submit to multi-agent service
3. Verify processing completes without TypeScript errors
4. Check agent logs for proper property access

**Success Criteria**:

- No runtime TypeScript errors
- Proper bracket notation access
- Successful travel planning generation

### Scenario 4: DNS Verification Workflow (After Implementation)

**Goal**: Verify complete DNS verification process

**Steps**:

1. Deploy to Vercel preview environment
2. Initiate DNS verification for the deployed domain
3. Poll verification status until completion
4. Verify DNS propagation completed successfully

**Success Criteria**:

- Verification completes within 10 minutes
- Proper status reporting throughout process
- Successful DNS resolution
- No timeout errors

## Troubleshooting

### TypeScript Errors

```bash
# If TypeScript errors persist, check specific files
npx tsc --noEmit --listFiles | grep error

# Common issues and fixes:
# 1. Provider status type conflicts - ensure proper enum usage
# 2. Index signature access - use bracket notation
# 3. Strict null checks - add proper null checking
```

### Provider Status Issues

```bash
# Debug provider configuration
curl http://localhost:3000/api/providers/status | jq '.'

# Check provider health individually
curl http://localhost:3000/api/providers/cerebras/status | jq '.isHealthy'

# Verify API keys are configured
echo $CEREBRAS_API_KEY | head -c 20
```

### DNS Verification Issues

```bash
# Test DNS resolution manually
dig your-domain.vercel.app
nslookup your-domain.vercel.app

# Check Vercel DNS configuration
vercel dns ls

# Verify domain settings in Vercel dashboard
vercel domains ls
```

### Deployment Issues

```bash
# Check deployment logs
vercel logs

# Verify Edge Function configuration
vercel env ls

# Test Edge Function limits (should be under 12)
vercel functions ls
```

## Validation Checklist

- [ ] TypeScript compilation passes with zero errors
- [ ] All provider status endpoints return valid data
- [ ] Provider status types are consistent between summary and detailed views
- [ ] Multi-agent service processes travel requests without type errors
- [ ] Vercel deployment succeeds with all Edge Functions
- [ ] DNS resolution works correctly for deployed domains
- [ ] DNS verification endpoints accept valid requests (when implemented)
- [ ] Error handling returns proper error format
- [ ] Rate limiting works correctly
- [ ] CORS headers are properly configured

## Success Metrics

- **TypeScript Compliance**: 0 compilation errors
- **Deployment Success**: 100% deployment success rate
- **DNS Propagation**: < 5 minutes average
- **Provider Availability**: All 3 providers reporting status
- **API Response Time**: < 2 seconds for status endpoints
- **Edge Function Count**: 3/12 functions used

## Next Steps

After completing this quickstart:

1. **Monitor Production**: Set up monitoring for DNS propagation times
2. **Document Procedures**: Create runbooks for DNS troubleshooting
3. **Automate Testing**: Add DNS verification to CI/CD pipeline
4. **Performance Optimization**: Monitor Edge Function cold start times
5. **Error Analysis**: Track and analyze deployment failure patterns

## Support

For issues during testing:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review Vercel deployment logs
3. Verify environment variable configuration
4. Test provider API keys independently
5. Check DNS propagation status with external tools

This quickstart ensures all DNS and TypeScript fixes are working correctly before production deployment.
