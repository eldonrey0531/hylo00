// Enhanced Budget Slider Hook
// Constitutional compliance: Edge-compatible, type-safe, observable

import { useState, useCallback, useRef, useEffect } from 'react';
import { BudgetSliderState, BudgetSliderActions } from '../types/budget-slider';
import { Currency } from '../types/enhanced-form-data';
import { validateCurrencyFormat } from '../utils/validation/budget-slider-schema';

interface UseBudgetSliderOptions {
  currency?: Currency;
  min?: number;
  max?: number;
  step?: number;
  enableRealTimeSync?: boolean;
  debounceMs?: number;
  onPerformanceMetric?: (metric: { type: string; value: number; timestamp: number }) => void;
}

export const useBudgetSlider = (initialValue: number, options: UseBudgetSliderOptions = {}) => {
  const {
    currency = 'USD',
    min = 1000,
    max = 20000,
    step = 250,
    enableRealTimeSync = true,
    debounceMs = 16, // 60fps
    onPerformanceMetric,
  } = options;

  // Performance refs
  const lastUpdateTimeRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Format currency
  const formatCurrency = useCallback(
    (value: number): string => {
      const formatted = validateCurrencyFormat(value, currency);
      return formatted.formatted || `$${value.toLocaleString()}`;
    },
    [currency]
  );

  // Core state
  const [state, setState] = useState<BudgetSliderState>({
    value: Math.max(min, Math.min(max, initialValue)),
    displayValue: formatCurrency(Math.max(min, Math.min(max, initialValue))),
    currency,
    min,
    max,
    step,
    isDragging: false,
    isHovered: false,
    isFlexible: false,
    flexibleLabel: 'Flexible budget',
    lastUpdateTime: Date.now(),
    updatePending: false,
  });

  // Actions
  const actions: BudgetSliderActions = {
    setValue: useCallback(
      (newValue: number) => {
        const startTime = performance.now();

        // Clamp value to bounds
        const clampedValue = Math.max(min, Math.min(max, newValue));

        // Snap to step
        const steppedValue = Math.round(clampedValue / step) * step;

        setState((prev) => ({
          ...prev,
          value: steppedValue,
          displayValue: formatCurrency(steppedValue),
          lastUpdateTime: Date.now(),
          updatePending: !enableRealTimeSync,
        }));

        if (enableRealTimeSync) {
          // Clear existing timeout
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }

          // Debounced update for performance
          debounceTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, updatePending: false }));
          }, debounceMs);
        }

        // Performance tracking
        const updateTime = performance.now() - startTime;
        lastUpdateTimeRef.current = updateTime;
        updateCountRef.current++;

        onPerformanceMetric?.({
          type: 'setValue',
          value: updateTime,
          timestamp: Date.now(),
        });
      },
      [min, max, step, formatCurrency, enableRealTimeSync, debounceMs, onPerformanceMetric]
    ),

    setDragging: useCallback((dragging: boolean) => {
      setState((prev) => ({ ...prev, isDragging: dragging }));
    }, []),

    setHovered: useCallback((hovered: boolean) => {
      setState((prev) => ({ ...prev, isHovered: hovered }));
    }, []),

    toggleFlexible: useCallback(() => {
      setState((prev) => ({
        ...prev,
        isFlexible: !prev.isFlexible,
        flexibleLabel: !prev.isFlexible ? 'Flexible budget' : 'Set budget',
      }));
    }, []),

    setCurrency: useCallback(
      (newCurrency: Currency) => {
        setState((prev) => ({
          ...prev,
          currency: newCurrency,
          displayValue: formatCurrency(prev.value),
        }));
      },
      [formatCurrency]
    ),

    formatDisplay: useCallback(
      (value: number, displayCurrency: Currency) => {
        // Use the provided currency for formatting, or fall back to current currency
        const currencyToUse = displayCurrency || currency;
        return (
          validateCurrencyFormat(value, currencyToUse).formatted || `$${value.toLocaleString()}`
        );
      },
      [currency]
    ),
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Performance metrics
  const getPerformanceMetrics = useCallback(
    () => ({
      lastUpdateTime: lastUpdateTimeRef.current,
      updateCount: updateCountRef.current,
      averageUpdateTime:
        updateCountRef.current > 0 ? lastUpdateTimeRef.current / updateCountRef.current : 0,
      isWithinPerformanceThreshold: lastUpdateTimeRef.current < 50, // < 50ms updates
    }),
    []
  );

  return {
    state,
    actions,
    getPerformanceMetrics,
  };
};
