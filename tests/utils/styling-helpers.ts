/**
 * Styling Test Utilities
 * Feature: 004-fix-travel-style
 * 
 * Utilities for testing CSS styling and computed styles in React components
 */

// Design token color values (from tailwind.config.js)
export const DESIGN_TOKENS = {
  'bg-trip-details': '#b0c29b',    // Yellow-green background
  'bg-form-box': '#ece8de',        // Light beige background  
  'text-primary': '#406170',       // Dark teal text
  'border-primary': '#406170',     // Dark teal border
  'forbidden-bg': '#406170',       // Never use as background
} as const;

// Convert hex colors to RGB format for computed style comparison
export const RGB_COLORS = {
  'bg-trip-details': 'rgb(176, 194, 155)',  // #b0c29b
  'bg-form-box': 'rgb(236, 232, 222)',      // #ece8de
  'text-primary': 'rgb(64, 97, 112)',       // #406170
  'forbidden-bg': 'rgb(64, 97, 112)',       // #406170
} as const;

/**
 * Check if element has expected background color
 */
export const hasBackgroundColor = (element: HTMLElement, expectedColor: string): boolean => {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.backgroundColor === expectedColor;
};

/**
 * Check if element does NOT have forbidden background color
 */
export const hasNoForbiddenBackground = (element: HTMLElement): boolean => {
  return !hasBackgroundColor(element, RGB_COLORS['forbidden-bg']);
};

/**
 * Get all elements with a specific data-testid pattern
 */
export const getElementsWithTestId = (pattern: string): HTMLElement[] => {
  return Array.from(document.querySelectorAll(`[data-testid*="${pattern}"]`));
};

/**
 * Custom Jest matcher for background color assertions
 */
export const toHaveBackgroundColor = (received: HTMLElement, expected: string) => {
  const computedStyle = window.getComputedStyle(received);
  const actualColor = computedStyle.backgroundColor;
  
  const pass = actualColor === expected;
  
  return {
    message: () => 
      pass 
        ? `Expected element NOT to have background color ${expected}, but it did`
        : `Expected element to have background color ${expected}, but got ${actualColor}`,
    pass,
  };
};

/**
 * Custom Jest matcher for Tailwind class presence
 */
export const toHaveTailwindClass = (received: HTMLElement, className: string) => {
  const pass = received.classList.contains(className);
  
  return {
    message: () =>
      pass
        ? `Expected element NOT to have class "${className}", but it did`
        : `Expected element to have class "${className}", but it didn't`,
    pass,
  };
};

/**
 * Validate travel style section styling contract
 */
export const validateTravelStyleSection = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  
  return {
    hasCorrectBackground: styles.backgroundColor === RGB_COLORS['bg-trip-details'],
    hasNoBadBackground: styles.backgroundColor !== RGB_COLORS['forbidden-bg'],
    hasRoundedCorners: styles.borderRadius === '36px',
    hasPadding: styles.padding === '24px',
  };
};

/**
 * Validate form component styling contract
 */
export const validateFormStyling = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  
  return {
    hasCorrectBackground: styles.backgroundColor === RGB_COLORS['bg-form-box'],
    hasNoBadBackground: styles.backgroundColor !== RGB_COLORS['forbidden-bg'],
    doesNotInheritContainer: styles.backgroundColor !== RGB_COLORS['bg-trip-details'],
  };
};

/**
 * Count elements matching a selector
 */
export const countElements = (selector: string): number => {
  return document.querySelectorAll(selector).length;
};

/**
 * Find closest element with specific class
 */
export const findClosestWithClass = (element: HTMLElement, className: string): HTMLElement | null => {
  return element.closest(`.${className}`) as HTMLElement | null;
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBackgroundColor(expected: string): R;
      toHaveTailwindClass(className: string): R;
    }
  }
}