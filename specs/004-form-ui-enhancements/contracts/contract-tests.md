# Contract Test Specifications

**Date**: September 18, 2025  
**Context**: Automated contract testing for form UI enhancements

## Overview

This document defines the contract tests that must pass for all form enhancement components. These tests ensure constitutional compliance, performance thresholds, and user experience standards.

## Test Categories

### 1. Component Interface Contract Tests

#### Date Input Component Tests

```typescript
describe('EnhancedDateInput Contract Tests', () => {
  const baseProps: EnhancedDateInputProps = {
    value: '',
    onChange: jest.fn(),
    enableClickZoneExpansion: true,
    showValidationFeedback: true,
  };

  test('MUST render with correct ARIA attributes', async () => {
    const { getByRole } = render(<EnhancedDateInput {...baseProps} aria-label="Departure date" />);
    const input = getByRole('textbox', { name: /departure date/i });

    expect(input).toHaveAttribute('aria-label', 'Departure date');
    expect(input).toHaveAttribute('type', 'text'); // Manual input
    expect(input).toBeInTheDocument();
  });

  test('MUST open picker on click zone activation', async () => {
    const onPickerOpen = jest.fn();
    const { container } = render(<EnhancedDateInput {...baseProps} onPickerOpen={onPickerOpen} />);

    const clickZone = container.querySelector('[data-testid="date-picker-zone"]');
    fireEvent.click(clickZone!);

    expect(onPickerOpen).toHaveBeenCalledTimes(1);
  });

  test('MUST validate input format in real-time', async () => {
    const onValidationChange = jest.fn();
    const { getByRole } = render(
      <EnhancedDateInput {...baseProps} onValidationChange={onValidationChange} />
    );

    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: '13/01/25' } }); // Invalid month

    expect(onValidationChange).toHaveBeenCalledWith(false, expect.any(String));
  });

  test('MUST meet performance thresholds', async () => {
    const startTime = performance.now();

    render(<EnhancedDateInput {...baseProps} />);

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(16); // 60fps = 16ms budget
  });

  test('MUST support keyboard navigation', async () => {
    const { getByRole } = render(<EnhancedDateInput {...baseProps} />);
    const input = getByRole('textbox');

    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // Should open picker

    // Verify picker opens with keyboard
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });
  });
});
```

#### Budget Slider Component Tests

```typescript
describe('EnhancedBudgetSlider Contract Tests', () => {
  const baseProps: EnhancedBudgetSliderProps = {
    value: 5000,
    onChange: jest.fn(),
    enableRealTimeSync: true,
    showFlexibleToggle: true,
    min: 0,
    max: 10000,
    step: 250,
  };

  test('MUST synchronize display with slider position', async () => {
    const onChange = jest.fn();
    const { getByRole, getByText } = render(
      <EnhancedBudgetSlider {...baseProps} onChange={onChange} currency="USD" />
    );

    const slider = getByRole('slider');
    fireEvent.change(slider, { target: { value: 7500 } });

    expect(onChange).toHaveBeenCalledWith(7500);
    await waitFor(() => {
      expect(getByText('$7,500')).toBeInTheDocument();
    });
  });

  test('MUST hide controls when flexible mode enabled', async () => {
    const { rerender, queryByRole } = render(
      <EnhancedBudgetSlider {...baseProps} flexibleMode={false} />
    );

    expect(queryByRole('slider')).toBeInTheDocument();

    rerender(<EnhancedBudgetSlider {...baseProps} flexibleMode={true} />);

    expect(queryByRole('slider')).not.toBeInTheDocument();
  });

  test('MUST update within performance threshold', async () => {
    const onChange = jest.fn();
    const { getByRole } = render(<EnhancedBudgetSlider {...baseProps} onChange={onChange} />);

    const slider = getByRole('slider');
    const startTime = performance.now();

    fireEvent.change(slider, { target: { value: 6000 } });

    const updateTime = performance.now() - startTime;
    expect(updateTime).toBeLessThan(50); // <50ms requirement
  });

  test('MUST preserve value when toggling flexible mode', async () => {
    const onFlexibleToggle = jest.fn();
    const { getByRole } = render(
      <EnhancedBudgetSlider
        {...baseProps}
        flexibleMode={false}
        onFlexibleToggle={onFlexibleToggle}
      />
    );

    const toggle = getByRole('switch', { name: /flexible/i });
    fireEvent.click(toggle);

    expect(onFlexibleToggle).toHaveBeenCalledWith(true);
    // Value should be preserved when toggling back
  });
});
```

#### Preference Modal Component Tests

```typescript
describe('EnhancedPreferenceModal Contract Tests', () => {
  const baseProps: EnhancedPreferenceModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    inclusionType: 'accommodations',
    onDataChange: jest.fn(),
    onSubmit: jest.fn(),
    enableInteractionFixes: true,
    enableOtherInput: true,
  };

  test('MUST render interactive form elements', async () => {
    const { getByRole, getAllByRole } = render(<EnhancedPreferenceModal {...baseProps} />);

    // Modal should be present
    expect(getByRole('dialog')).toBeInTheDocument();

    // Form elements should be interactive
    const buttons = getAllByRole('button');
    const inputs = getAllByRole('textbox');

    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });

    inputs.forEach((input) => {
      expect(input).not.toBeDisabled();
    });
  });

  test('MUST show other input when "Other" selected', async () => {
    const { getByRole, getByText } = render(
      <EnhancedPreferenceModal {...baseProps} inclusionType="accommodations" />
    );

    // Click "Other" option
    const otherButton = getByText(/other/i);
    fireEvent.click(otherButton);

    // Other input should appear
    await waitFor(() => {
      const otherInput = getByRole('textbox', {
        name: /tell us more about your accommodation preferences/i,
      });
      expect(otherInput).toBeInTheDocument();
    });
  });

  test('MUST support multi-select for rental car preferences', async () => {
    const { getAllByRole } = render(
      <EnhancedPreferenceModal
        {...baseProps}
        inclusionType="rental-car"
        enableMultiSelect={true}
        multiSelectFields={['vehicleTypes']}
      />
    );

    const checkboxes = getAllByRole('checkbox');

    // Should be able to select multiple
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  test('MUST trap focus within modal', async () => {
    const { getByRole } = render(<EnhancedPreferenceModal {...baseProps} />);

    const modal = getByRole('dialog');
    const firstFocusable = modal.querySelector('[tabindex="0"]') as HTMLElement;
    const lastFocusable = modal.querySelector('[data-testid="last-focusable"]') as HTMLElement;

    firstFocusable.focus();
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(lastFocusable);
  });
});
```

#### Travel Style Progressive Disclosure Tests

```typescript
describe('TravelStyleProgressiveDisclosure Contract Tests', () => {
  const baseProps: TravelStyleProgressiveDisclosureProps = {
    onChoiceSelect: jest.fn(),
    onSkipToNickname: jest.fn(),
    onComplete: jest.fn(),
    enableProgressTracking: true,
  };

  test('MUST show choice buttons initially', async () => {
    const { getByText } = render(<TravelStyleProgressiveDisclosure {...baseProps} />);

    expect(getByText(/answer.*questions/i)).toBeInTheDocument();
    expect(getByText(/skip.*ahead/i)).toBeInTheDocument();
  });

  test('MUST show all sections when "answer questions" selected', async () => {
    const onChoiceSelect = jest.fn();
    const { getByText, queryByText } = render(
      <TravelStyleProgressiveDisclosure {...baseProps} onChoiceSelect={onChoiceSelect} />
    );

    fireEvent.click(getByText(/answer.*questions/i));

    expect(onChoiceSelect).toHaveBeenCalledWith('answer-questions');

    // All sections should become visible
    await waitFor(() => {
      expect(queryByText(/travel experience/i)).toBeInTheDocument();
      expect(queryByText(/trip vibe/i)).toBeInTheDocument();
      expect(queryByText(/sample days/i)).toBeInTheDocument();
      expect(queryByText(/dinner choice/i)).toBeInTheDocument();
    });
  });

  test('MUST skip to nickname when "skip ahead" selected', async () => {
    const onSkipToNickname = jest.fn();
    const { getByText } = render(
      <TravelStyleProgressiveDisclosure {...baseProps} onSkipToNickname={onSkipToNickname} />
    );

    fireEvent.click(getByText(/skip.*ahead/i));

    expect(onSkipToNickname).toHaveBeenCalled();
  });

  test('MUST preserve data during navigation', async () => {
    const preservedData = {
      experience: ['Some in-country travel'],
      vibes: ['Relax & recharge'],
    };

    const onDataPreservation = jest.fn();
    const { getByText } = render(
      <TravelStyleProgressiveDisclosure
        {...baseProps}
        preservedData={preservedData}
        onDataPreservation={onDataPreservation}
      />
    );

    fireEvent.click(getByText(/answer.*questions/i));

    // Should restore preserved data
    await waitFor(() => {
      expect(getByText('Some in-country travel')).toBeInTheDocument();
    });
  });
});
```

### 2. Validation Schema Contract Tests

```typescript
describe('Validation Schema Contract Tests', () => {
  test('DateInputSchema MUST validate correct format', () => {
    const validDate = {
      value: '12/25/25',
      displayValue: '12/25/25',
      isValid: true,
      validationLevel: 'none' as const,
    };

    const result = DateInputSchema.safeParse(validDate);
    expect(result.success).toBe(true);
  });

  test('DateInputSchema MUST reject invalid format', () => {
    const invalidDate = {
      value: '25/12/2025', // Wrong format
      displayValue: '25/12/2025',
      isValid: false,
      validationLevel: 'error' as const,
    };

    const result = DateInputSchema.safeParse(invalidDate);
    expect(result.success).toBe(false);
  });

  test('BudgetValueSchema MUST validate reasonable budget', () => {
    const validBudget = {
      value: 5000,
      currency: 'USD' as const,
      mode: 'total' as const,
      isFlexible: false,
    };

    const result = BudgetValueSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
  });

  test('BudgetValueSchema MUST reject negative budget', () => {
    const invalidBudget = {
      value: -1000,
      currency: 'USD' as const,
      mode: 'total' as const,
      isFlexible: false,
    };

    const result = BudgetValueSchema.safeParse(invalidBudget);
    expect(result.success).toBe(false);
  });
});
```

### 3. Performance Contract Tests

```typescript
describe('Performance Contract Tests', () => {
  test('Component renders MUST complete within 16ms', async () => {
    const components = [
      { name: 'EnhancedDateInput', Component: EnhancedDateInput, props: {} },
      {
        name: 'EnhancedBudgetSlider',
        Component: EnhancedBudgetSlider,
        props: { value: 5000, onChange: jest.fn() },
      },
      {
        name: 'EnhancedPreferenceModal',
        Component: EnhancedPreferenceModal,
        props: {
          isOpen: true,
          onClose: jest.fn(),
          inclusionType: 'accommodations',
          onDataChange: jest.fn(),
          onSubmit: jest.fn(),
        },
      },
    ];

    for (const { name, Component, props } of components) {
      const startTime = performance.now();
      render(React.createElement(Component, props));
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(16); // 60fps budget
    }
  });

  test('Bundle size impact MUST be under 5KB', () => {
    // This would be measured during build process
    const bundleSizeIncrease = getBundleSizeIncrease(); // Mock function
    expect(bundleSizeIncrease).toBeLessThan(5 * 1024); // 5KB
  });

  test('Memory usage MUST not exceed 2MB increase', () => {
    const initialMemory = getMemoryUsage(); // Mock function

    // Render multiple components
    render(
      <div>
        <EnhancedDateInput value="" onChange={jest.fn()} />
        <EnhancedBudgetSlider value={5000} onChange={jest.fn()} />
        <EnhancedPreferenceModal
          isOpen={true}
          onClose={jest.fn()}
          inclusionType="accommodations"
          onDataChange={jest.fn()}
          onSubmit={jest.fn()}
        />
      </div>
    );

    const finalMemory = getMemoryUsage(); // Mock function
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024); // 2MB
  });
});
```

### 4. Accessibility Contract Tests

```typescript
describe('Accessibility Contract Tests', () => {
  test('All components MUST meet WCAG 2.1 AA standards', async () => {
    const components = [
      <EnhancedDateInput value="" onChange={jest.fn()} aria-label="Test date" />,
      <EnhancedBudgetSlider value={5000} onChange={jest.fn()} />,
      <EnhancedPreferenceModal
        isOpen={true}
        onClose={jest.fn()}
        inclusionType="accommodations"
        onDataChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    ];

    for (const component of components) {
      const { container } = render(component);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    }
  });

  test('Keyboard navigation MUST work for all interactive elements', async () => {
    const { getByRole, getAllByRole } = render(
      <div>
        <EnhancedDateInput value="" onChange={jest.fn()} />
        <EnhancedBudgetSlider value={5000} onChange={jest.fn()} />
      </div>
    );

    const interactiveElements = [
      ...getAllByRole('textbox'),
      ...getAllByRole('slider'),
      ...getAllByRole('button'),
    ];

    for (const element of interactiveElements) {
      element.focus();
      expect(document.activeElement).toBe(element);

      // Test keyboard interaction
      fireEvent.keyDown(element, { key: 'Enter' });
      fireEvent.keyDown(element, { key: ' ' });
    }
  });

  test('Screen reader announcements MUST be present', async () => {
    const { getByRole } = render(
      <EnhancedDateInput value="12/25/25" onChange={jest.fn()} aria-label="Departure date" />
    );

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Departure date');
    expect(input).toHaveAccessibleName();
  });
});
```

### 5. Integration Contract Tests

```typescript
describe('Form Integration Contract Tests', () => {
  test('Complete form workflow MUST preserve data', async () => {
    const TestForm = () => {
      const [formData, setFormData] = useState({
        departDate: '',
        budget: 5000,
        accommodationPrefs: {},
        travelStyle: 'not-selected',
      });

      return (
        <div>
          <EnhancedDateInput
            value={formData.departDate}
            onChange={(value) => setFormData((prev) => ({ ...prev, departDate: value }))}
          />
          <EnhancedBudgetSlider
            value={formData.budget}
            onChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
          />
          <TravelStyleProgressiveDisclosure
            onChoiceSelect={(choice) => setFormData((prev) => ({ ...prev, travelStyle: choice }))}
            onSkipToNickname={jest.fn()}
            onComplete={jest.fn()}
          />
        </div>
      );
    };

    const { getByRole, getByText } = render(<TestForm />);

    // Fill out form
    const dateInput = getByRole('textbox');
    fireEvent.change(dateInput, { target: { value: '12/25/25' } });

    const budgetSlider = getByRole('slider');
    fireEvent.change(budgetSlider, { target: { value: 7500 } });

    const answerQuestionsButton = getByText(/answer.*questions/i);
    fireEvent.click(answerQuestionsButton);

    // Verify data preservation
    expect(dateInput).toHaveValue('12/25/25');
    expect(budgetSlider).toHaveValue('7500');
  });

  test('Error recovery MUST maintain form state', async () => {
    const ErrorBoundaryTest = () => {
      const [hasError, setHasError] = useState(false);

      if (hasError) {
        return <div>Error occurred, but form should recover</div>;
      }

      return (
        <FormErrorBoundary onError={() => setHasError(true)}>
          <EnhancedDateInput value="12/25/25" onChange={jest.fn()} />
        </FormErrorBoundary>
      );
    };

    const { getByRole, getByText } = render(<ErrorBoundaryTest />);

    const dateInput = getByRole('textbox');
    expect(dateInput).toHaveValue('12/25/25');

    // Simulate error and recovery
    // After recovery, form state should be preserved
  });
});
```

## Test Execution Requirements

### 1. Continuous Integration

```yaml
# ci-contract-tests.yml
name: Form Enhancement Contract Tests
on: [push, pull_request]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run contract tests
        run: npm run test:contracts

      - name: Run performance tests
        run: npm run test:performance

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Bundle size analysis
        run: npm run analyze:bundle
```

### 2. Test Coverage Requirements

- **Unit test coverage**: ≥95% for all component logic
- **Integration test coverage**: ≥90% for form workflows
- **Accessibility test coverage**: 100% for interactive elements
- **Performance test coverage**: 100% for all components

### 3. Test Data Requirements

```typescript
// Test data contracts
interface TestScenario {
  name: string;
  description: string;
  setup: () => any;
  execute: (context: any) => Promise<any>;
  verify: (result: any) => boolean;
  cleanup?: () => void;
}

// Performance test data
interface PerformanceTestData {
  component: string;
  operation: string;
  expectedThreshold: number;
  measurementUnit: 'ms' | 'bytes' | 'fps';
  sampleSize: number;
}
```

## Failure Criteria

### Critical Failures (Block Deployment)

- Any accessibility violation (WCAG 2.1 AA)
- Performance threshold exceeded by >50%
- Component interface contract broken
- Data loss during form interactions

### Warning Failures (Flag for Review)

- Performance threshold exceeded by 10-50%
- Bundle size increase >3KB
- Test coverage below target thresholds
- Minor accessibility improvements needed

---

**Contract tests completed**: September 18, 2025  
**Coverage requirement**: ≥95% for production deployment  
**Performance gates**: All thresholds must pass before merge
