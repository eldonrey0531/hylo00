// src/utils/test-helpers.tsx
import { beforeAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
// Import CSS for tests
import '../index.css';

// Setup custom styling matchers for Vitest
const setupStylingMatchers = () => {
  // Custom matchers for styling assertions
  expect.extend({
    toHaveBackgroundColor: (element: Element, expectedColor: string) => {
      const styles = window.getComputedStyle(element);
      const pass = styles.backgroundColor === expectedColor;
      return {
        message: () => `expected element to have background color ${expectedColor}, but got ${styles.backgroundColor}`,
        pass,
      };
    },
    toHaveClass: (element: Element, expectedClass: string) => {
      const pass = element.className.includes(expectedClass);
      return {
        message: () => `expected element to have class ${expectedClass}`,
        pass,
      };
    },
    toHaveComputedStyle: (element: Element, property: string, expectedValue: string) => {
      const styles = window.getComputedStyle(element);
      const actualValue = styles.getPropertyValue(property);
      const pass = actualValue === expectedValue;
      return {
        message: () => `expected element to have ${property}: ${expectedValue}, but got ${actualValue}`,
        pass,
      };
    },
  });
};

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test setup
beforeAll(() => {
  setupStylingMatchers();
});