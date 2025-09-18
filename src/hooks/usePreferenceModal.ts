// Enhanced Preference Modal Hook
// Constitutional compliance: Edge-compatible, type-safe, observable

import { useState, useCallback } from 'react';
import { PreferenceModalState } from '../types/preference-modal';
import { InclusionType } from '../types/enhanced-form-data';

interface UsePreferenceModalOptions {
  enableFocusTrap?: boolean;
  onDataChange?: (data: Record<string, any>) => void;
}

export const usePreferenceModal = (
  inclusionType: InclusionType,
  options: UsePreferenceModalOptions = {}
) => {
  const { enableFocusTrap = true, onDataChange } = options;

  const [state, setState] = useState<PreferenceModalState>({
    isOpen: false,
    inclusionType,
    canInteract: true,
    formData: {},
    validationErrors: {},
    showOtherInput: false,
    otherInputValue: '',
    multiSelectValues: [],
    trapFocus: enableFocusTrap,
  });

  const actions = {
    openModal: useCallback(() => {
      setState((prev) => ({ ...prev, isOpen: true }));
    }, []),

    closeModal: useCallback(() => {
      setState((prev) => ({ ...prev, isOpen: false }));
    }, []),

    updateFormData: useCallback(
      (data: Record<string, any>) => {
        setState((prev) => ({ ...prev, formData: { ...prev.formData, ...data } }));
        onDataChange?.(data);
      },
      [onDataChange]
    ),

    toggleOtherInput: useCallback(() => {
      setState((prev) => ({ ...prev, showOtherInput: !prev.showOtherInput }));
    }, []),

    setMultiSelectValues: useCallback((values: string[]) => {
      setState((prev) => ({ ...prev, multiSelectValues: values }));
    }, []),
  };

  return { state, actions };
};
