// Enhanced UX Optimization Hook
// Constitutional compliance: Edge-compatible, type-safe, observable

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseUXOptimizationOptions {
  enablePerformanceTracking?: boolean;
  enableA11yEnhancements?: boolean;
  debounceMs?: number;
}

interface UXMetrics {
  interactionTime: number;
  formCompletionRate: number;
  errorRate: number;
  lastUpdated: number;
}

interface UXState {
  isOptimizing: boolean;
  metrics: UXMetrics;
  preferences: Record<string, any>;
  accessibilityLevel: 'basic' | 'enhanced' | 'full';
}

export const useUXOptimization = (options: UseUXOptimizationOptions = {}) => {
  const {
    enablePerformanceTracking = true,
    enableA11yEnhancements = true,
    debounceMs = 100,
  } = options;

  const [state, setState] = useState<UXState>({
    isOptimizing: false,
    metrics: {
      interactionTime: 0,
      formCompletionRate: 0,
      errorRate: 0,
      lastUpdated: Date.now(),
    },
    preferences: {},
    accessibilityLevel: 'basic',
  });

  const metricsRef = useRef<UXMetrics>(state.metrics);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const trackInteraction = useCallback(
    (type: string, duration: number) => {
      if (!enablePerformanceTracking) return;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            interactionTime: prev.metrics.interactionTime + duration,
            lastUpdated: Date.now(),
          },
        }));
      }, debounceMs);
    },
    [enablePerformanceTracking, debounceMs]
  );

  const updateAccessibility = useCallback(
    (level: 'basic' | 'enhanced' | 'full') => {
      if (!enableA11yEnhancements) return;
      setState((prev) => ({ ...prev, accessibilityLevel: level }));
    },
    [enableA11yEnhancements]
  );

  const setPreference = useCallback((key: string, value: any) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    trackInteraction,
    updateAccessibility,
    setPreference,
    isEnabled: enablePerformanceTracking || enableA11yEnhancements,
  };
};
