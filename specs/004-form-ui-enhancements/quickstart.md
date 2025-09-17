# Quickstart Guide: Form UI Enhancements

**Date**: September 18, 2025  
**Context**: Production-grade development setup and testing procedures

## Overview

This quickstart guide provides step-by-step instructions for setting up the development environment, implementing form UI enhancements, and validating production-ready code that meets constitutional requirements.

## Prerequisites

### System Requirements

- **Node.js**: 18.17.0 or higher
- **npm**: 9.0.0 or higher
- **Git**: 2.34.0 or higher
- **VS Code**: Latest version (recommended)
- **Modern browser**: Chrome 100+, Safari 15+, or Firefox 100+

### Project Setup Verification

```bash
# Verify Node.js version
node --version  # Should be ≥18.17.0

# Verify npm version
npm --version   # Should be ≥9.0.0

# Clone repository (if not already done)
git clone <repository-url>
cd hylo

# Verify current branch
git branch      # Should show 004-form-ui-enhancements

# Install dependencies
npm install

# Verify TypeScript configuration
npx tsc --noEmit  # Should have no errors
```

## Development Environment Setup

### 1. IDE Configuration

```json
// .vscode/settings.json (recommended)
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

### 2. Environment Variables

```bash
# .env.local (create if not exists)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

### 3. Development Scripts

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run contract tests
npm run test:contracts

# Run performance tests
npm run test:performance

# Run accessibility tests
npm run test:a11y

# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

## Implementation Workflow

### Phase 1: Setup and Planning

1. **Create feature branch** (if not already done):

   ```bash
   git checkout -b 004-form-ui-enhancements
   ```

2. **Review specifications**:

   ```bash
   # Read feature requirements
   cat specs/004-form-ui-enhancements/spec.md

   # Review data model
   cat specs/004-form-ui-enhancements/data-model.md

   # Check contracts
   ls specs/004-form-ui-enhancements/contracts/
   ```

3. **Verify constitutional compliance**:

   ```bash
   # Check constitution requirements
   cat .specify/memory/constitution.md

   # Verify edge-compatibility
   npm run test:edge-compat
   ```

### Phase 2: Component Development

#### 1. Enhanced Date Input Component

```bash
# Create component file
touch src/components/enhanced/EnhancedDateInput.tsx

# Create hook file
touch src/hooks/useDateInput.ts

# Create types file
touch src/types/date-input.ts

# Create test files
touch src/components/enhanced/__tests__/EnhancedDateInput.test.tsx
touch src/hooks/__tests__/useDateInput.test.ts
```

**Implementation checklist**:

- [ ] Component implements `EnhancedDateInputProps` interface
- [ ] Hook implements `useDateInput` state management
- [ ] Click zone expansion functionality
- [ ] Manual typing preservation
- [ ] Validation feedback implementation
- [ ] Accessibility attributes (ARIA)
- [ ] Performance optimization (useCallback, useMemo)
- [ ] Edge-runtime compatibility

#### 2. Enhanced Budget Slider Component

```bash
# Create component file
touch src/components/enhanced/EnhancedBudgetSlider.tsx

# Create hook file
touch src/hooks/useBudgetSlider.ts

# Create types file
touch src/types/budget-slider.ts

# Create test files
touch src/components/enhanced/__tests__/EnhancedBudgetSlider.test.tsx
touch src/hooks/__tests__/useBudgetSlider.test.ts
```

**Implementation checklist**:

- [ ] Real-time synchronization between slider and display
- [ ] Flexible budget toggle implementation
- [ ] Currency support (USD, EUR, GBP, CAD, AUD)
- [ ] Budget mode toggle (total vs per-person)
- [ ] Performance optimization for smooth dragging
- [ ] Value preservation during mode changes
- [ ] Accessibility compliance

#### 3. Enhanced Preference Modal Component

```bash
# Create modal component
touch src/components/enhanced/EnhancedPreferenceModal.tsx

# Create modal hook
touch src/hooks/usePreferenceModal.ts

# Create modal types
touch src/types/preference-modal.ts

# Create specific preference components
touch src/components/preferences/AccommodationPreferences.tsx
touch src/components/preferences/RentalCarPreferences.tsx

# Create test files
touch src/components/enhanced/__tests__/EnhancedPreferenceModal.test.tsx
touch src/components/preferences/__tests__/AccommodationPreferences.test.tsx
```

**Implementation checklist**:

- [ ] Interactive form elements (buttons, inputs)
- [ ] "Other" text input for accommodations
- [ ] Multi-select for rental car vehicle types
- [ ] Focus management and trap
- [ ] Event handling fixes
- [ ] Form validation
- [ ] Accessibility compliance

#### 4. Travel Style Progressive Disclosure Component

```bash
# Create component
touch src/components/enhanced/TravelStyleProgressiveDisclosure.tsx

# Create hook
touch src/hooks/useTravelStyle.ts

# Create types
touch src/types/travel-style.ts

# Create test files
touch src/components/enhanced/__tests__/TravelStyleProgressiveDisclosure.test.tsx
```

**Implementation checklist**:

- [ ] Initial choice buttons display
- [ ] Conditional section rendering
- [ ] Data preservation during navigation
- [ ] Skip to nickname functionality
- [ ] Form state management
- [ ] Progress tracking

### Phase 3: Integration and Testing

#### 1. Component Integration

```bash
# Update main form component
# File: src/components/TripDetailsForm.tsx

# Update main app component
# File: src/App.tsx

# Update form types
# File: src/types/form-ui-enhancements.ts
```

**Integration checklist**:

- [ ] Enhanced components replace existing ones
- [ ] Form data flow maintained
- [ ] Existing functionality preserved
- [ ] Constitutional compliance verified
- [ ] Performance metrics within thresholds

#### 2. Test Implementation

```bash
# Run contract tests
npm run test:contracts

# Run unit tests
npm run test src/components/enhanced/

# Run integration tests
npm run test src/components/TripDetailsForm.test.tsx

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance
```

**Testing checklist**:

- [ ] All contract tests passing
- [ ] Unit test coverage ≥95%
- [ ] Integration tests passing
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Performance thresholds met
- [ ] Bundle size increase <5KB

#### 3. End-to-End Validation

```bash
# Start development server
npm run dev

# Run E2E tests
npm run test:e2e

# Manual testing scenarios
npm run test:manual
```

**E2E testing scenarios**:

1. **Date Input Enhancement**:

   - Click anywhere in date input field → calendar opens
   - Type manually → validation provides feedback
   - Switch between manual and picker → functionality preserved

2. **Budget Slider Synchronization**:

   - Drag slider → display updates in real-time
   - Toggle flexible budget → controls hide/show
   - Change currency → values convert correctly

3. **Preference Modal Interactions**:

   - Open any modal → all controls are interactive
   - Select "Other" in accommodations → text box appears
   - Multi-select in rental car → multiple selections work

4. **Travel Style Progressive Disclosure**:
   - View travel style section → choice buttons appear
   - Select "answer questions" → all sections show
   - Select "skip ahead" → advance to nickname form

## Performance Validation

### 1. Bundle Size Analysis

```bash
# Analyze bundle size impact
npm run analyze

# Check specific component sizes
npm run analyze:components

# Verify edge-compatibility
npm run build && npm run test:edge
```

**Performance targets**:

- Total bundle size increase: <5KB
- Component render time: <16ms (60fps)
- Form interaction latency: <100ms
- Memory usage increase: <2MB

### 2. Performance Monitoring

```typescript
// Add to component for monitoring
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const MyComponent = () => {
  const { trackInteraction, trackRender } = usePerformanceMonitor('MyComponent');

  useEffect(() => {
    trackRender();
  }, [trackRender]);

  const handleInteraction = useCallback(
    (action: string) => {
      trackInteraction(action);
      // Component logic
    },
    [trackInteraction]
  );

  // Component JSX
};
```

### 3. Accessibility Validation

```bash
# Run automated accessibility tests
npm run test:a11y

# Test with screen reader
# Use NVDA, JAWS, or VoiceOver to verify announcements

# Test keyboard navigation
# Tab through all interactive elements

# Test color contrast
npm run test:contrast
```

## Deployment Checklist

### Pre-deployment Validation

- [ ] All tests passing (unit, integration, contract, E2E)
- [ ] Performance thresholds met
- [ ] Accessibility compliance verified
- [ ] Bundle size within limits
- [ ] Constitutional compliance confirmed
- [ ] Code review completed
- [ ] Documentation updated

### Deployment Steps

```bash
# Final test run
npm run test:all

# Build for production
npm run build

# Verify build output
ls -la .next/

# Deploy to staging
npm run deploy:staging

# Run staging validation
npm run test:staging

# Deploy to production
npm run deploy:production
```

### Post-deployment Monitoring

```typescript
// Performance monitoring in production
const performanceConfig = {
  enableRUM: true,
  sampleRate: 0.1,
  thresholds: {
    renderTime: 16,
    interactionLatency: 100,
    bundleSize: 5000,
  },
};
```

## Troubleshooting

### Common Issues

#### 1. Date Picker Not Opening

```typescript
// Check click zone implementation
const clickZone = useRef<HTMLDivElement>(null);

useEffect(() => {
  const zone = clickZone.current;
  if (zone) {
    zone.addEventListener('click', handlePickerOpen);
    return () => zone.removeEventListener('click', handlePickerOpen);
  }
}, []);
```

#### 2. Budget Slider Sync Issues

```typescript
// Implement proper state synchronization
const [sliderValue, setSliderValue] = useState(value);
const [displayValue, setDisplayValue] = useState(formatCurrency(value));

useEffect(() => {
  setDisplayValue(formatCurrency(sliderValue));
}, [sliderValue]);
```

#### 3. Modal Interaction Problems

```typescript
// Fix event propagation
const handleModalClick = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  // Handle interaction
}, []);
```

#### 4. Performance Issues

```bash
# Profile component performance
npm run profile

# Check bundle size
npm run analyze

# Monitor memory usage
npm run monitor:memory
```

### Debug Tools

```bash
# Enable debug mode
export NEXT_PUBLIC_ENABLE_DEBUG=true

# Use React DevTools
# Install browser extension and inspect components

# Use performance profiler
# Chrome DevTools → Performance tab
```

## Testing Scenarios

### Manual Testing Checklist

#### Date Input Testing

- [ ] Click in date field white space → picker opens
- [ ] Type "12/25/25" → formats correctly
- [ ] Type "13/25/25" → shows validation error
- [ ] Use keyboard navigation → picker accessible
- [ ] Test mobile touch → picker works on touch devices

#### Budget Slider Testing

- [ ] Drag slider → display updates immediately
- [ ] Toggle flexible budget → slider hides
- [ ] Change currency → values convert
- [ ] Test different budget ranges → all values work
- [ ] Test budget mode toggle → per-person calculation

#### Preference Modal Testing

- [ ] Open accommodations modal → all buttons clickable
- [ ] Select "Other" → text box appears with correct prompt
- [ ] Open rental car modal → vehicle types multi-select
- [ ] Test focus trap → tab navigation stays in modal
- [ ] Test all inclusion types → all modals functional

#### Travel Style Testing

- [ ] View travel style section → two choice buttons visible
- [ ] Click "answer questions" → all four sections appear
- [ ] Click "skip ahead" → advance to nickname form
- [ ] Partially fill sections then navigate → data preserved

### Automated Testing

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:contracts
npm run test:performance
npm run test:accessibility

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Support and Resources

### Documentation

- [Feature Specification](./spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)
- [Constitutional Requirements](../../.specify/memory/constitution.md)

### Development Tools

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Language Server](https://github.com/typescript-language-server/typescript-language-server)
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Performance Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Accessibility Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

---

**Quickstart guide completed**: September 18, 2025  
**Development ready**: All prerequisites and workflows defined  
**Constitutional compliance**: Verified for production deployment
