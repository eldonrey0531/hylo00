// Playwright test setup for form interactions
// E2E testing configuration for form UI/UX optimization

import { test, expect, Page } from '@playwright/test';

// =======================
// Page Object Models
// =======================

export class FormPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/');
  }

  // Date section interactions
  async getFlexibleDatesToggle() {
    return this.page.getByLabel(/I'm not sure or my dates are flexible/i);
  }

  async getDepartInput() {
    return this.page.getByLabel(/depart/i).first();
  }

  async getReturnInput() {
    return this.page.getByLabel(/return/i).first();
  }

  async getDurationDropdown() {
    return this.page.getByLabel(/planned days/i);
  }

  async toggleFlexibleDates() {
    const toggle = await this.getFlexibleDatesToggle();
    await toggle.click();
  }

  async setDepartDate(date: string) {
    const input = await this.getDepartInput();
    await input.fill(date);
  }

  async setReturnDate(date: string) {
    const input = await this.getReturnInput();
    await input.fill(date);
  }

  // Budget section interactions
  async getBudgetSlider() {
    return this.page.getByLabel(/budget range/i);
  }

  async getBudgetModeToggle() {
    return this.page.getByLabel(/toggle budget mode/i);
  }

  async getBudgetDisplay() {
    return this.page.locator('.bg-primary.text-white').filter({ hasText: /\$/ }).first();
  }

  async getBudgetModeIndicator() {
    return this.page.locator('text=/Total Trip Budget|Per-Person Budget/').first();
  }

  async setBudgetSlider(value: number) {
    const slider = await this.getBudgetSlider();
    await slider.fill(value.toString());
  }

  async toggleBudgetMode() {
    const toggle = await this.getBudgetModeToggle();
    await toggle.click();
  }

  // Category interactions
  async getTripDetailsCategory() {
    return this.page.getByTestId('trip-details-category');
  }

  async getTravelStyleCategory() {
    return this.page.getByTestId('travel-style-category');
  }

  async getCategoryHeader(categoryId: string) {
    return this.page.getByTestId(`category-${categoryId}-header`);
  }

  // Assertion helpers
  async expectFlexibleDateLabels() {
    await expect(this.page.getByText(/trip start.*flexible/i)).toBeVisible();
    await expect(this.page.getByText(/duration/i)).toBeVisible();
    await expect(this.page.getByText(/^depart$/i)).not.toBeVisible();
    await expect(this.page.getByText(/^return$/i)).not.toBeVisible();
  }

  async expectFixedDateLabels() {
    await expect(this.page.getByText(/^depart$/i)).toBeVisible();
    await expect(this.page.getByText(/^return$/i)).toBeVisible();
    await expect(this.page.getByText(/trip start.*flexible/i)).not.toBeVisible();
  }

  async expectBudgetModeIndicator(mode: 'total' | 'per-person') {
    const expectedText = mode === 'total' ? 'Total Trip Budget' : 'Per-Person Budget';
    await expect(this.page.getByText(expectedText)).toBeVisible();
  }

  async expectBudgetDisplay(expectedAmount: string) {
    await expect(this.page.getByText(expectedAmount)).toBeVisible();
  }

  async expectCategoryVisible(categoryId: string) {
    const category = this.page.getByTestId(`${categoryId}-category`);
    await expect(category).toBeVisible();
  }

  // Performance testing helpers
  async measureSliderPerformance(iterations: number = 10): Promise<number> {
    const slider = await this.getBudgetSlider();
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await slider.fill((i * 1000).toString());
      // Wait for update to complete
      await this.page.waitForTimeout(10);
    }

    const endTime = Date.now();
    return (endTime - startTime) / iterations;
  }

  async measureRealTimeUpdates(): Promise<number> {
    const slider = await this.getBudgetSlider();
    const startTime = Date.now();

    await slider.fill('7500');
    await expect(this.page.getByText(/\$7,500/)).toBeVisible();

    const endTime = Date.now();
    return endTime - startTime;
  }
}

// =======================
// Test Scenarios
// =======================

export const playwrightTestScenarios = {
  // Scenario 1: Flexible Dates Workflow
  flexibleDatesWorkflow: async (page: Page) => {
    const formPage = new FormPage(page);
    await formPage.goto();

    // Initial state - fixed dates
    await formPage.expectFixedDateLabels();

    // Set initial dates
    await formPage.setDepartDate('12/25/24');
    await formPage.setReturnDate('01/02/25');

    // Verify total days calculation (if visible)
    await expect(page.getByText(/8 days/i)).toBeVisible();

    // Toggle to flexible dates
    await formPage.toggleFlexibleDates();
    await formPage.expectFlexibleDateLabels();

    // Verify date inputs are hidden
    const departInput = await formPage.getDepartInput();
    const returnInput = await formPage.getReturnInput();
    await expect(departInput).toBeHidden();
    await expect(returnInput).toBeHidden();

    // Verify duration dropdown appears
    const durationDropdown = await formPage.getDurationDropdown();
    await expect(durationDropdown).toBeVisible();

    // Toggle back to fixed dates
    await formPage.toggleFlexibleDates();
    await formPage.expectFixedDateLabels();
  },

  // Scenario 2: Budget Mode & Slider Workflow
  budgetWorkflow: async (page: Page) => {
    const formPage = new FormPage(page);
    await formPage.goto();

    // Initial state - total budget mode
    await formPage.expectBudgetModeIndicator('total');

    // Set budget slider
    await formPage.setBudgetSlider(8000);
    await formPage.expectBudgetDisplay('$8,000');

    // Toggle to per-person mode
    await formPage.toggleBudgetMode();
    await formPage.expectBudgetModeIndicator('per-person');

    // If group size = 2, should show $4,000
    await formPage.expectBudgetDisplay('$4,000');

    // Move slider to different position
    await formPage.setBudgetSlider(6000);
    await formPage.expectBudgetDisplay('$3,000'); // 6000/2

    // Toggle back to total mode
    await formPage.toggleBudgetMode();
    await formPage.expectBudgetModeIndicator('total');
    await formPage.expectBudgetDisplay('$6,000');
  },

  // Scenario 3: Form Category Navigation
  categoryNavigationWorkflow: async (page: Page) => {
    const formPage = new FormPage(page);
    await formPage.goto();

    // Verify Trip Details category is visible
    await formPage.expectCategoryVisible('trip-details');

    // Verify Travel Style category is visible
    await formPage.expectCategoryVisible('travel-style');

    // Verify visual separation between categories
    const tripDetails = await formPage.getTripDetailsCategory();
    const travelStyle = await formPage.getTravelStyleCategory();

    await expect(tripDetails).toBeVisible();
    await expect(travelStyle).toBeVisible();

    // Verify category headers
    await expect(page.getByText('Trip Details')).toBeVisible();
    await expect(page.getByText('Travel Style')).toBeVisible();
  },

  // Performance validation
  performanceValidation: async (page: Page) => {
    const formPage = new FormPage(page);
    await formPage.goto();

    // Test slider performance (<50ms target)
    const averageTime = await formPage.measureSliderPerformance(10);
    expect(averageTime).toBeLessThan(50);

    // Test real-time updates
    const updateTime = await formPage.measureRealTimeUpdates();
    expect(updateTime).toBeLessThan(100); // Allow slightly more time for E2E
  },
};

// =======================
// Test Configuration
// =======================

export const playwrightConfig = {
  // Performance testing configuration
  performance: {
    sliderUpdateTarget: 50, // ms
    realTimeUpdateTarget: 100, // ms
    navigationTarget: 200, // ms
  },

  // Accessibility testing
  accessibility: {
    checkColorContrast: true,
    checkKeyboardNavigation: true,
    checkScreenReaderContent: true,
  },

  // Mobile testing viewports
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 },
  },
};

// =======================
// Utility Functions
// =======================

export const playwrightUtils = {
  // Wait for form to be ready
  async waitForFormReady(page: Page) {
    await page.waitForSelector('[data-testid="trip-details-form"]', { state: 'visible' });
    await page.waitForLoadState('networkidle');
  },

  // Take screenshot for visual regression
  async takeFormScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `tests/screenshots/${name}.png`,
      fullPage: true,
    });
  },

  // Check accessibility
  async checkAccessibility(page: Page) {
    // This would integrate with axe-playwright or similar
    // For now, basic keyboard navigation check
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'SELECT'].includes(focused || '')).toBeTruthy();
  },

  // Measure page performance
  async measurePageLoad(page: Page): Promise<number> {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  },
};
