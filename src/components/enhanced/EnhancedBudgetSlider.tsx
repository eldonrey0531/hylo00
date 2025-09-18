// Enhanced Budget Slider Component
// Constitutional compliance: Edge-compatible, type-safe, observable

import React, { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { EnhancedBudgetSliderProps, EnhancedBudgetSliderRef } from '../../types/budget-slider';
import { useBudgetSlider } from '../../hooks/useBudgetSlider';
import { Currency } from '../../types/enhanced-form-data';

export const EnhancedBudgetSlider = forwardRef<EnhancedBudgetSliderRef, EnhancedBudgetSliderProps>(
  (
    {
      value,
      onChange,
      min = 1000,
      max = 20000,
      step = 250,
      currency = 'USD' as Currency,
      enableRealTimeSync = true,
      showFlexibleToggle = false,
      onDragStart,
      onDragEnd,
    },
    ref
  ) => {
    const sliderRef = useRef<HTMLInputElement>(null);

    const { state, actions } = useBudgetSlider(value, {
      currency,
      min,
      max,
      step,
      enableRealTimeSync,
    });

    // Expose imperative methods
    useImperativeHandle(
      ref,
      () => ({
        getValue: () => state.value,
        setValue: actions.setValue,
        getCurrency: () => state.currency,
        setCurrency: actions.setCurrency,
        toggleFlexible: actions.toggleFlexible,
        reset: () => actions.setValue(min),
        focus: () => sliderRef.current?.focus(),
      }),
      [state.value, state.currency, actions, min]
    );

    // Handle slider changes
    const handleSliderChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        actions.setValue(newValue);
        onChange(newValue);
      },
      [actions, onChange]
    );

    // Handle drag events
    const handleMouseDown = useCallback(() => {
      onDragStart?.();
    }, [onDragStart]);

    const handleMouseUp = useCallback(() => {
      onDragEnd?.();
    }, [onDragEnd]);

    return (
      <div className="enhanced-budget-slider w-full">
        {/* Budget display */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-900" data-testid="budget-display">
            {state.displayValue}
          </div>
          {state.isFlexible && <div className="text-sm text-gray-600 mt-1">Flexible budget</div>}
        </div>

        {/* Slider */}
        <div className="mb-4">
          <input
            ref={sliderRef}
            type="range"
            min={state.min}
            max={state.max}
            step={state.step}
            value={state.value}
            onChange={handleSliderChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            data-testid="budget-slider"
          />
        </div>

        {/* Range labels */}
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>{actions.formatDisplay(state.min, state.currency)}</span>
          <span>{actions.formatDisplay(state.max, state.currency)}</span>
        </div>

        {/* Flexible budget toggle */}
        {showFlexibleToggle && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="flexible-budget"
              checked={state.isFlexible}
              onChange={actions.toggleFlexible}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              data-testid="flexible-toggle"
            />
            <label htmlFor="flexible-budget" className="ml-2 text-sm text-gray-600 cursor-pointer">
              I'm not sure or my budget is flexible
            </label>
          </div>
        )}
      </div>
    );
  }
);
