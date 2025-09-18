// Enhanced Date Input Hook
// Constitutional compliance: Edge-compatible, type-safe, observable

import { useState, useCallback, useRef, useEffect } from 'react';
import { DateInputState, DateInputActions, DateValidationRule } from '../types/date-input';
import { ValidationLevel } from '../types/enhanced-form-data';
import { validateDateInput } from '../utils/validation/date-input-schema';

interface UseDateInputOptions {
  validationRules?: DateValidationRule[];
  enableClickZoneExpansion?: boolean;
  debounceMs?: number;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  onPickerOpen?: () => void;
  onPickerClose?: () => void;
}

export const useDateInput = (initialValue = '', options: UseDateInputOptions = {}) => {
  const {
    validationRules = [],
    enableClickZoneExpansion = true,
    debounceMs = 300,
    onValidationChange,
    onPickerOpen,
    onPickerClose,
  } = options;

  // Core state
  const [state, setState] = useState<DateInputState>({
    value: initialValue,
    displayValue: initialValue,
    isValid: true,
    isPickerOpen: false,
    clickZoneActive: enableClickZoneExpansion,
    hasFocus: false,
    validationLevel: 'none' as ValidationLevel,
    ariaLabel: 'Date input',
  });

  // Performance refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastValidationTimeRef = useRef<number>(0);

  // Validation function
  const validateValue = useCallback(
    (value: string): { isValid: boolean; message?: string; level: ValidationLevel } => {
      const startTime = performance.now();

      // Basic format validation
      const formatValidation = validateDateInput(value);
      if (!formatValidation.isValid) {
        return {
          isValid: false,
          level: 'error',
          ...(formatValidation.message && { message: formatValidation.message }),
        };
      } // Apply custom validation rules
      for (const rule of validationRules) {
        if (!rule.validate(value)) {
          return {
            isValid: false,
            message: rule.message,
            level: rule.level,
          };
        }
      }

      // Performance tracking
      const validationTime = performance.now() - startTime;
      lastValidationTimeRef.current = validationTime;

      return { isValid: true, level: 'none' };
    },
    [validationRules]
  );

  // Actions
  const actions: DateInputActions = {
    setValue: useCallback(
      (value: string) => {
        setState((prev) => ({
          ...prev,
          value,
          displayValue: value,
        }));

        // Debounced validation
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          const validation = validateValue(value);

          setState((prev) => ({
            ...prev,
            isValid: validation.isValid,
            validationLevel: validation.level,
            ...(validation.message && { validationMessage: validation.message }),
          }));

          onValidationChange?.(validation.isValid, validation.message);
        }, debounceMs);
      },
      [validateValue, debounceMs, onValidationChange]
    ),

    openPicker: useCallback(() => {
      if (!state.isPickerOpen) {
        setState((prev) => ({ ...prev, isPickerOpen: true }));
        onPickerOpen?.();
      }
    }, [state.isPickerOpen, onPickerOpen]),

    closePicker: useCallback(() => {
      if (state.isPickerOpen) {
        setState((prev) => ({ ...prev, isPickerOpen: false }));
        onPickerClose?.();
      }
    }, [state.isPickerOpen, onPickerClose]),

    setFocus: useCallback((focused: boolean) => {
      setState((prev) => ({ ...prev, hasFocus: focused }));
    }, []),

    validate: useCallback(() => {
      const validation = validateValue(state.value);

      setState((prev) => ({
        ...prev,
        isValid: validation.isValid,
        validationLevel: validation.level,
        ...(validation.message && { validationMessage: validation.message }),
      }));

      onValidationChange?.(validation.isValid, validation.message);
      return validation.isValid;
    }, [state.value, validateValue, onValidationChange]),

    clearValue: useCallback(() => {
      setState((prev) => ({
        ...prev,
        value: '',
        displayValue: '',
        isValid: true,
        validationLevel: 'none',
      }));
      onValidationChange?.(true);
    }, [onValidationChange]),
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
      lastValidationTime: lastValidationTimeRef.current,
      isWithinPerformanceThreshold: lastValidationTimeRef.current < 1, // < 1ms validation
    }),
    []
  );

  return {
    state,
    actions,
    getPerformanceMetrics,
  };
};
