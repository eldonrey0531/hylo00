// Test utilities for form component testing
// Supporting TripDetailsForm enhancements and FormCategoryWrapper

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReactElement } from 'react';
import {
  DateSectionState,
  BudgetDisplayState,
  FormCategory,
  TripDetailsFormUIState,
} from '../../src/types/form-ui-enhancements';

// =======================
// Mock Data Factories
// =======================

export const createMockFormData = () => ({
  location: '',
  departDate: '',
  returnDate: '',
  flexibleDates: false,
  plannedDays: undefined,
  adults: 2,
  children: 0,
  childrenAges: [],
  budget: 5000,
  currency: 'USD' as const,
});

export const createMockDateSectionState = (
  mode: 'fixed' | 'flexible' = 'fixed'
): DateSectionState => ({
  mode,
  contextualLabels: {
    primary: mode === 'fixed' ? 'Depart' : 'Trip Start (Flexible)',
    secondary: mode === 'fixed' ? 'Return' : 'Duration',
  },
  displayState: {
    showDateInputs: mode === 'fixed',
    showDurationDropdown: mode === 'flexible',
    showTotalDays: mode === 'fixed',
  },
});

export const createMockBudgetDisplayState = (
  mode: 'total' | 'per-person' = 'total'
): BudgetDisplayState => ({
  mode,
  indicator: {
    visible: true,
    text: mode === 'total' ? 'Total Trip Budget' : 'Per-Person Budget',
    position: 'above',
  },
  synchronization: {
    sliderValue: 5000,
    displayValue: '$5,000',
    isUpdating: false,
  },
});

export const createMockFormCategory = (id: string, title: string): FormCategory => ({
  id,
  title,
  icon: `test-icon-${id}`, // Using string instead of JSX for test utilities
  description: `${title} category description`,
  components: [],
  order: 1,
});

export const createMockUIState = (): TripDetailsFormUIState => ({
  dateSection: createMockDateSectionState(),
  budgetSection: createMockBudgetDisplayState(),
});

// =======================
// Test Interaction Helpers
// =======================

export const formTestHelpers = {
  // Flexible dates interactions
  async toggleFlexibleDates() {
    const toggle = screen.getByLabelText(/toggle flexible dates/i);
    await userEvent.click(toggle);
    return toggle;
  },

  async setDepartDate(date: string) {
    const input = screen.getByLabelText(/departure date|depart/i);
    await userEvent.clear(input);
    await userEvent.type(input, date);
    return input;
  },

  async setReturnDate(date: string) {
    const input = screen.getByLabelText(/return date|return/i);
    await userEvent.clear(input);
    await userEvent.type(input, date);
    return input;
  },

  // Budget interactions
  async setBudgetSlider(value: number) {
    const slider = screen.getByLabelText(/budget range/i);
    fireEvent.change(slider, { target: { value: value.toString() } });
    return slider;
  },

  async toggleBudgetMode() {
    const toggle = screen.getByLabelText(/toggle budget mode/i);
    await userEvent.click(toggle);
    return toggle;
  },

  // Category interactions
  async selectCategory(categoryId: string) {
    const categoryButton = screen.getByTestId(`category-${categoryId}`);
    await userEvent.click(categoryButton);
    return categoryButton;
  },

  // Assertion helpers
  expectFlexibleDateLabels() {
    expect(screen.getByText(/trip start.*flexible/i)).toBeInTheDocument();
    expect(screen.getByText(/duration/i)).toBeInTheDocument();
    expect(screen.queryByText(/^depart$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^return$/i)).not.toBeInTheDocument();
  },

  expectFixedDateLabels() {
    expect(screen.getByText(/^depart$/i)).toBeInTheDocument();
    expect(screen.getByText(/^return$/i)).toBeInTheDocument();
    expect(screen.queryByText(/trip start.*flexible/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/duration/i)).not.toBeInTheDocument();
  },

  expectBudgetModeIndicator(mode: 'total' | 'per-person') {
    const expectedText = mode === 'total' ? 'Total Trip Budget' : 'Per-Person Budget';
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  },

  async expectBudgetDisplay(expectedAmount: string) {
    await waitFor(() => {
      expect(screen.getByText(expectedAmount)).toBeInTheDocument();
    });
  },

  expectCategoryActive(categoryId: string) {
    const category = screen.getByTestId(`category-${categoryId}`);
    expect(category).toHaveClass(/active/);
  },

  expectCategoryCompleted(categoryId: string) {
    const category = screen.getByTestId(`category-${categoryId}`);
    expect(category).toHaveClass(/completed/);
  },
};

// =======================
// Performance Test Helpers
// =======================

export const performanceTestHelpers = {
  // Test slider performance
  async testSliderPerformance(targetMs: number = 50) {
    const slider = screen.getByLabelText(/budget range/i);
    const startTime = performance.now();

    // Simulate rapid slider movement
    for (let i = 0; i < 10; i++) {
      fireEvent.change(slider, { target: { value: (i * 1000).toString() } });
    }

    const endTime = performance.now();
    const averageTime = (endTime - startTime) / 10;

    expect(averageTime).toBeLessThan(targetMs);
    return averageTime;
  },

  // Test real-time updates
  async testRealTimeUpdates() {
    const slider = screen.getByLabelText(/budget range/i);
    const startTime = performance.now();

    fireEvent.change(slider, { target: { value: '7500' } });

    await waitFor(() => {
      expect(screen.getByText(/\$7,500/)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const updateTime = endTime - startTime;

    expect(updateTime).toBeLessThan(50); // <50ms requirement
    return updateTime;
  },
};

// =======================
// Mock Event Handlers
// =======================

export const createMockHandlers = () => ({
  onFormChange: vi.fn(),
  onUIStateChange: vi.fn(),
  onCategorySelect: vi.fn(),
  onCategoryComplete: vi.fn(),
  onFlexibleDatesToggle: vi.fn(),
  onBudgetModeToggle: vi.fn(),
  onBudgetSliderChange: vi.fn(),
});

// =======================
// Test Scenarios
// =======================

export const testScenarios = {
  flexibleDatesWorkflow: async () => {
    // Scenario 1 from quickstart.md
    await formTestHelpers.setDepartDate('12/25/24');
    await formTestHelpers.setReturnDate('01/02/25');

    // Verify total days calculation
    expect(screen.getByText(/8 days/i)).toBeInTheDocument();

    // Toggle flexible dates
    await formTestHelpers.toggleFlexibleDates();
    formTestHelpers.expectFlexibleDateLabels();

    // Toggle back
    await formTestHelpers.toggleFlexibleDates();
    formTestHelpers.expectFixedDateLabels();
  },

  budgetWorkflow: async () => {
    // Scenario 2 from quickstart.md
    formTestHelpers.expectBudgetModeIndicator('total');

    await formTestHelpers.setBudgetSlider(8000);
    await formTestHelpers.expectBudgetDisplay('$8,000');

    await formTestHelpers.toggleBudgetMode();
    formTestHelpers.expectBudgetModeIndicator('per-person');

    // If group size = 2, should show $4,000
    await formTestHelpers.expectBudgetDisplay('$4,000');
  },

  categoryNavigationWorkflow: async () => {
    // Scenario 3 from quickstart.md
    formTestHelpers.expectCategoryActive('trip-details');

    await formTestHelpers.selectCategory('travel-style');
    formTestHelpers.expectCategoryActive('travel-style');
  },
};

// =======================
// Jest Setup Helpers
// =======================

export const setupJestEnvironment = () => {
  // Mock performance.now for timing tests
  global.performance = global.performance || {};
  global.performance.now = global.performance.now || (() => Date.now());

  // Mock IntersectionObserver if needed
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class IntersectionObserver {
      constructor() {}
      observe() {
        return null;
      }
      disconnect() {
        return null;
      }
      unobserve() {
        return null;
      }
    };

  // Mock ResizeObserver if needed
  global.ResizeObserver =
    global.ResizeObserver ||
    class ResizeObserver {
      constructor() {}
      observe() {
        return null;
      }
      disconnect() {
        return null;
      }
      unobserve() {
        return null;
      }
    };
};
