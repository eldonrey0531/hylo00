// Enhanced Event Handling Utilities
// Constitutional compliance: Edge-compatible, type-safe, performant

import { FormInteractionEvent } from '../types/enhanced-form-data';

// Event handling constants
const CLICK_ZONE_EXPANSION = 10; // pixels
const DEBOUNCE_DEFAULT_MS = 100;
const THROTTLE_DEFAULT_MS = 16; // ~60fps

// Click zone expansion utilities
export const clickZoneExpansion = {
  /**
   * Check if click is within expanded zone of element
   */
  isWithinExpandedZone: (
    event: MouseEvent,
    element: HTMLElement,
    expansion: number = CLICK_ZONE_EXPANSION
  ): boolean => {
    const rect = element.getBoundingClientRect();
    const expandedRect = {
      left: rect.left - expansion,
      top: rect.top - expansion,
      right: rect.right + expansion,
      bottom: rect.bottom + expansion,
    };

    return (
      event.clientX >= expandedRect.left &&
      event.clientX <= expandedRect.right &&
      event.clientY >= expandedRect.top &&
      event.clientY <= expandedRect.bottom
    );
  },

  /**
   * Add click zone expansion to element
   */
  addExpandedClickZone: (
    element: HTMLElement,
    onClick: (event: MouseEvent) => void,
    expansion: number = CLICK_ZONE_EXPANSION
  ): (() => void) => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (clickZoneExpansion.isWithinExpandedZone(event, element, expansion)) {
        // Check if click is not on the element itself (to avoid double firing)
        if (!element.contains(event.target as Node)) {
          onClick(event);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);

    // Return cleanup function
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  },

  /**
   * Create expanded click zone wrapper
   */
  createExpandedZone: (
    element: HTMLElement,
    expansion: number = CLICK_ZONE_EXPANSION
  ): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const rect = element.getBoundingClientRect();
    wrapper.style.width = `${rect.width + expansion * 2}px`;
    wrapper.style.height = `${rect.height + expansion * 2}px`;
    wrapper.style.margin = `-${expansion}px`;

    wrapper.appendChild(element);
    return wrapper;
  },
};

// Debounce utilities
export const debounceUtils = {
  /**
   * Create debounced function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number = DEBOUNCE_DEFAULT_MS
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Create debounced function with immediate execution option
   */
  debounceAdvanced: <T extends (...args: any[]) => any>(
    func: T,
    wait: number = DEBOUNCE_DEFAULT_MS,
    immediate: boolean = false
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func(...args);
    };
  },
};

// Throttle utilities
export const throttleUtils = {
  /**
   * Create throttled function
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number = THROTTLE_DEFAULT_MS
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Create throttled function with trailing option
   */
  throttleAdvanced: <T extends (...args: any[]) => any>(
    func: T,
    limit: number = THROTTLE_DEFAULT_MS,
    trailing: boolean = false
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean = false;
    let lastFunc: NodeJS.Timeout | null = null;
    let lastRan: number = 0;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        lastRan = Date.now();
        inThrottle = true;
      } else if (trailing) {
        if (lastFunc) clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },
};

// Event delegation utilities
export const eventDelegation = {
  /**
   * Add delegated event listener
   */
  addDelegatedListener: (
    parentElement: HTMLElement | Document,
    eventType: string,
    selector: string,
    handler: (event: Event, target: HTMLElement) => void
  ): (() => void) => {
    const handleEvent = (event: Event) => {
      const target = event.target as HTMLElement;
      const matchingElement = target.closest(selector) as HTMLElement;

      if (matchingElement) {
        handler(event, matchingElement);
      }
    };

    parentElement.addEventListener(eventType, handleEvent);

    // Return cleanup function
    return () => {
      parentElement.removeEventListener(eventType, handleEvent);
    };
  },

  /**
   * Create event delegation manager
   */
  createDelegationManager: (parentElement: HTMLElement | Document = document) => {
    const listeners: Array<() => void> = [];

    return {
      add: (
        eventType: string,
        selector: string,
        handler: (event: Event, target: HTMLElement) => void
      ) => {
        const cleanup = eventDelegation.addDelegatedListener(
          parentElement,
          eventType,
          selector,
          handler
        );
        listeners.push(cleanup);
      },

      removeAll: () => {
        listeners.forEach((cleanup) => cleanup());
        listeners.length = 0;
      },
    };
  },
};

// Form interaction tracking
export const formInteractionTracking = {
  /**
   * Track form interactions for analytics
   */
  trackInteraction: (event: FormInteractionEvent): void => {
    // In a real implementation, this would send to analytics service
    console.log('Form interaction:', event);

    // Store in local storage for session tracking
    const interactions = formInteractionTracking.getStoredInteractions();
    interactions.push(event);
    localStorage.setItem('form_interactions', JSON.stringify(interactions));
  },

  /**
   * Get stored interactions
   */
  getStoredInteractions: (): FormInteractionEvent[] => {
    try {
      const stored = localStorage.getItem('form_interactions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Clear stored interactions
   */
  clearStoredInteractions: (): void => {
    localStorage.removeItem('form_interactions');
  },

  /**
   * Get interaction summary
   */
  getInteractionSummary: () => {
    const interactions = formInteractionTracking.getStoredInteractions();
    const summary = {
      totalInteractions: interactions.length,
      componentInteractions: {} as Record<string, number>,
      averageLatency: 0,
    };

    interactions.forEach((interaction) => {
      summary.componentInteractions[interaction.component] =
        (summary.componentInteractions[interaction.component] || 0) + 1;
    });

    return summary;
  },
};

// Focus management utilities
export const focusManagement = {
  /**
   * Trap focus within element
   */
  trapFocus: (element: HTMLElement): (() => void) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Move focus to element safely
   */
  moveFocusTo: (element: HTMLElement): void => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  /**
   * Check if element is focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    return element.matches(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  },
};

// Performance monitoring for event handling
export const eventPerformance = {
  /**
   * Measure event handler performance
   */
  measureHandlerTime: (handler: () => void): number => {
    const start = performance.now();
    handler();
    return performance.now() - start;
  },

  /**
   * Monitor event frequency
   */
  createEventMonitor: (eventType: string, element: HTMLElement = document.body) => {
    let eventCount = 0;
    let lastEventTime = 0;

    const handler = () => {
      eventCount++;
      lastEventTime = performance.now();
    };

    element.addEventListener(eventType, handler);

    return {
      getEventCount: () => eventCount,
      getLastEventTime: () => lastEventTime,
      reset: () => {
        eventCount = 0;
      },
      destroy: () => element.removeEventListener(eventType, handler),
    };
  },
};
