// src/components/TripDetails/useFormValidation.ts
import { useState, useCallback, useEffect } from 'react';
import { FormData, ValidationResult } from './types';
import { validationUtils } from './utils';

interface UseFormValidationOptions {
  enableRealTimeValidation?: boolean;
  validateOnMount?: boolean;
  debounceDelay?: number;
}

interface UseFormValidationReturn {
  validationResult: ValidationResult;
  fieldErrors: Record<string, string>;
  isValid: boolean;
  validateField: (field: string, value: any) => void;
  validateForm: () => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
}

export const useFormValidation = (
  formData: Partial<FormData>,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn => {
  const { enableRealTimeValidation = true, validateOnMount = false, debounceDelay = 300 } = options;

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    fieldErrors: {},
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validate entire form
  const validateForm = useCallback(() => {
    const result = validationUtils.validateFormData(formData);
    setValidationResult(result);
    setFieldErrors(result.fieldErrors);
    return result;
  }, [formData]);

  // Validate specific field
  const validateField = useCallback(
    (field: string, value: any) => {
      const result = validationUtils.validateField(field, value, formData);

      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        if (result.errors.length > 0 && result.errors[0]) {
          newErrors[field] = result.errors[0];
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      // Update overall validation result
      const updatedData = { ...formData, [field]: value };
      const fullResult = validationUtils.validateFormData(updatedData);
      setValidationResult(fullResult);

      return result;
    },
    [formData]
  );

  // Clear specific field error
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setValidationResult({
      isValid: true,
      errors: {},
      fieldErrors: {},
    });
  }, []);

  // Debounced validation for real-time updates
  const debouncedValidate = useCallback(
    validationUtils.debounceValidation(validateForm, debounceDelay),
    [validateForm, debounceDelay]
  );

  // Auto-validate when form data changes (if enabled)
  useEffect(() => {
    if (enableRealTimeValidation) {
      debouncedValidate();
    }
  }, [formData, enableRealTimeValidation, debouncedValidate]);

  // Validate on mount (if enabled)
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount, validateForm]);

  return {
    validationResult,
    fieldErrors,
    isValid: validationResult.isValid,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
  };
};
