// Enhanced Date Input Component
// Constitutional compliance: Edge-compatible, type-safe, observable

import React, { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { EnhancedDateInputProps, EnhancedDateInputRef } from '../../types/date-input';
import { useDateInput } from '../../hooks/useDateInput';
import { clickZoneExpansion } from '../../utils/eventHandling';

export const EnhancedDateInput = forwardRef<EnhancedDateInputRef, EnhancedDateInputProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select date',
      disabled = false,
      readonly = false,
      enableClickZoneExpansion = true,
      showValidationFeedback = true,
      validationRules = [],
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      id,
      onPickerOpen,
      onPickerClose,
      onFocus,
      onBlur,
      onValidationChange,
      className = '',
      style,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const hookOptions: any = {
      validationRules,
      enableClickZoneExpansion,
    };

    if (onValidationChange) hookOptions.onValidationChange = onValidationChange;
    if (onPickerOpen) hookOptions.onPickerOpen = onPickerOpen;
    if (onPickerClose) hookOptions.onPickerClose = onPickerClose;

    const { state, actions } = useDateInput(value, hookOptions); // Expose imperative methods
    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        openPicker: actions.openPicker,
        closePicker: actions.closePicker,
        validate: actions.validate,
        getValue: () => state.value,
        setValue: actions.setValue,
        reset: actions.clearValue,
      }),
      [actions, state.value]
    );

    // Handle value changes
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        actions.setValue(newValue);
        onChange(newValue);
      },
      [actions, onChange]
    );

    // Handle focus/blur
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        actions.setFocus(true);
        onFocus?.(e);
      },
      [actions, onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        actions.setFocus(false);
        onBlur?.(e);
      },
      [actions, onBlur]
    );

    // Handle click zone expansion
    const handleContainerClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (enableClickZoneExpansion && inputRef.current && !disabled && !readonly) {
          // Check if click is within expanded zone
          if (clickZoneExpansion.isWithinExpandedZone(e.nativeEvent, inputRef.current)) {
            inputRef.current.focus();
            actions.openPicker();
          }
        }
      },
      [enableClickZoneExpansion, disabled, readonly, actions]
    );

    // Determine input styling based on state
    const getInputClassName = () => {
      const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors duration-200';
      const stateClasses = [];

      if (state.hasFocus) {
        stateClasses.push('ring-2 ring-blue-500 border-blue-500');
      } else if (!state.isValid && state.value) {
        stateClasses.push('border-red-500');
      } else if (state.isValid && state.value) {
        stateClasses.push('border-green-500');
      } else {
        stateClasses.push('border-gray-300');
      }

      if (disabled) {
        stateClasses.push('bg-gray-100 cursor-not-allowed');
      }

      return `${baseClasses} ${stateClasses.join(' ')} ${className}`;
    };

    return (
      <div
        ref={containerRef}
        className="enhanced-date-input w-full"
        data-testid="date-picker-zone"
        onClick={handleContainerClick}
      >
        <input
          ref={inputRef}
          type="text"
          value={state.displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          className={getInputClassName()}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          id={id}
          style={style}
          data-testid="enhanced-date-input"
        />

        {/* Validation feedback */}
        {showValidationFeedback && state.validationMessage && (
          <p
            className={`text-sm mt-1 ${
              state.validationLevel === 'error'
                ? 'text-red-600'
                : state.validationLevel === 'warning'
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
            data-testid="date-validation-message"
          >
            {state.validationMessage}
          </p>
        )}
      </div>
    );
  }
);
