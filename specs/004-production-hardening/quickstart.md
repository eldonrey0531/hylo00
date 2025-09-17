# Quickstart Guide: Production Hardening & Frontend Enhancement

## Overview

This guide provides step-by-step instructions for testing and validating the production hardening enhancements to the Hylo travel planning application.

## Prerequisites

- Node.js 18+ installed
- Access to the Hylo repository
- Environment variables configured for LLM providers
- Browser developer tools familiarity

## Quick Start Steps

### 1. Environment Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/cbanluta2700/hylo.git
cd hylo

# Switch to the production hardening branch
git checkout 004-production-hardening

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys
```

### 2. Run Development Server

```bash
# Start the development server
npm run dev

# In another terminal, run the test suite
npm run test

# Run E2E tests (when implemented)
npm run test:e2e
```

### 3. Validate Core Functionality

#### 3.1 Test Travel Planning Workflow

1. Open browser to `http://localhost:5173`
2. Fill out the travel planning form:
   - Enter destination: "Paris, France"
   - Select dates: Next month, 7 days
   - Choose travelers: 2 adults
   - Select interests: Culture & History, Food & Drink
3. Submit the form and verify:
   - Loading states appear correctly
   - Multi-agent workflow executes
   - Itinerary is generated successfully
   - No console errors occur

#### 3.2 Test Error Handling

1. Disconnect internet connection
2. Try submitting the travel form
3. Verify:
   - Error boundary catches the failure
   - User-friendly error message appears
   - Retry button is available
   - No page crash occurs

#### 3.3 Test Responsive Design

1. Open browser developer tools
2. Test mobile viewport (375px width)
3. Verify:
   - All forms are usable on mobile
   - Tables/data are responsive
   - Navigation works correctly
   - Text is readable

### 4. Validate Production Features

#### 4.1 Test Health Monitoring

```bash
# Check system health
curl http://localhost:5173/api/health/system

# Check provider health
curl http://localhost:5173/api/health/providers
```

Expected responses:

- Status: 200 OK
- JSON with health metrics
- All providers showing availability

#### 4.2 Test Error Reporting

1. Open browser console
2. Trigger an error (e.g., invalid form submission)
3. Verify:
   - Error is logged to console with structured format
   - Error boundary captures and reports the error
   - User sees helpful error message

#### 4.3 Test Performance Metrics

1. Open browser developer tools
2. Go to Performance tab
3. Record page load
4. Verify:
   - First Contentful Paint < 2.5s
   - Largest Contentful Paint < 2.5s
   - Bundle size < 200KB initial load

### 5. Validate Security Features

#### 5.1 Test Input Validation

1. Try submitting forms with malicious input:
   - XSS attempts: `<script>alert('xss')</script>`
   - SQL injection patterns: `'; DROP TABLE users; --`
   - Large payloads: 10MB+ text
2. Verify:
   - Input is sanitized
   - No script execution occurs
   - Appropriate error messages shown

#### 5.2 Test Rate Limiting

```bash
# Make rapid requests (if rate limiting is implemented)
for i in {1..20}; do curl http://localhost:5173/api/llm/route & done
```

Expected behavior:

- First requests succeed
- Later requests get rate limited
- Appropriate HTTP status codes returned

### 6. Performance Validation

#### 6.1 Bundle Analysis

```bash
# Build the application
npm run build

# Analyze bundle size
npm run build:analyze
```

Verify:

- Initial bundle < 200KB
- Chunks are appropriately split
- No duplicate dependencies

#### 6.2 Edge Function Performance

```bash
# Test edge function cold start
curl -w "%{time_total}" http://localhost:5173/api/health/system
```

Expected:

- Response time < 150ms
- Consistent performance across requests

### 7. Test Scenarios

#### Scenario 1: Happy Path User Journey

1. **Given**: User wants to plan a trip to Tokyo
2. **When**: They complete the entire travel planning flow
3. **Then**:
   - Form validation works correctly
   - AI agents generate comprehensive itinerary
   - Results are displayed in mobile-friendly format
   - Performance meets targets

#### Scenario 2: LLM Provider Failure

1. **Given**: Primary LLM provider is unavailable
2. **When**: User submits travel planning request
3. **Then**:
   - System automatically fails over to secondary provider
   - User sees brief loading message
   - Itinerary is generated successfully
   - Error is logged for monitoring

#### Scenario 3: Network Connectivity Issues

1. **Given**: User has poor internet connection
2. **When**: They use the application
3. **Then**:
   - Application loads with appropriate loading states
   - Graceful degradation for failed requests
   - Retry mechanisms work correctly
   - Offline indicators appear when appropriate

#### Scenario 4: Mobile User Experience

1. **Given**: User is on mobile device
2. **When**: They navigate the application
3. **Then**:
   - All forms are thumb-friendly
   - Tables scroll horizontally when needed
   - Navigation is accessible
   - Performance remains good

### 8. Monitoring Validation

#### 8.1 Check Error Logging

```bash
# View application logs
npm run logs

# Check for error patterns
grep -i "error" logs/application.log
```

#### 8.2 Verify Health Dashboards

1. Access monitoring dashboard (if implemented)
2. Verify metrics are being collected:
   - Request count and response times
   - Error rates by component
   - LLM provider health and quota usage
   - User experience metrics

### 9. Accessibility Testing

#### 9.1 Screen Reader Testing

1. Install screen reader extension
2. Navigate the application using only keyboard
3. Verify:
   - All interactive elements are focusable
   - ARIA labels are present and helpful
   - Form errors are announced
   - Loading states are communicated

#### 9.2 Color Contrast Testing

1. Use browser accessibility tools
2. Check color contrast ratios
3. Verify WCAG 2.1 AA compliance

### 10. Production Deployment Validation

#### 10.1 Build Verification

```bash
# Create production build
npm run build

# Verify build output
ls -la dist/
```

#### 10.2 Environment Configuration

1. Check all environment variables are properly set
2. Verify no development-only code in production build
3. Confirm security headers are configured

## Success Criteria Checklist

- [ ] All existing functionality works without breaking changes
- [ ] Mobile responsiveness verified on real devices
- [ ] Error boundaries catch and handle failures gracefully
- [ ] Performance targets met (LCP < 2.5s, bundle < 200KB)
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Security validation passes (input sanitization, rate limiting)
- [ ] Monitoring and logging operational
- [ ] LLM provider fallbacks work correctly
- [ ] Production build deploys successfully

## Troubleshooting

### Common Issues

**Issue**: Application fails to start
**Solution**: Check environment variables and ensure all API keys are set

**Issue**: Tests fail with import errors
**Solution**: Run `npm install` to ensure all dependencies are installed

**Issue**: Performance targets not met
**Solution**: Check bundle analyzer output and optimize large dependencies

**Issue**: Mobile layout broken
**Solution**: Verify Tailwind responsive classes are applied correctly

### Debug Commands

```bash
# Check TypeScript compilation
npm run type-check

# Run linting
npm run lint

# View detailed test output
npm run test -- --verbose

# Check bundle size
npm run build:analyze
```

### Getting Help

1. Check the implementation documentation in `/specs/004-production-hardening/`
2. Review error logs in browser developer tools
3. Consult the project constitution at `.specify/memory/constitution.md`
4. Check existing issues in the GitHub repository

## Next Steps

After completing this quickstart:

1. **Performance Optimization**: Monitor real-world performance and optimize bottlenecks
2. **Security Hardening**: Implement additional security measures based on security audit results
3. **User Feedback**: Collect user feedback and iterate on UX improvements
4. **Monitoring Enhancement**: Set up advanced monitoring and alerting systems
5. **Documentation**: Update user documentation and API guides

This quickstart provides comprehensive validation of the production hardening enhancements while maintaining the existing travel planning functionality.
