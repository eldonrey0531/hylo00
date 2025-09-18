// Enhanced Preference Modal Component
// Constitutional compliance: Edge-compatible, type-safe, observable

import React, { useCallback, useEffect, useRef } from 'react';
import { EnhancedPreferenceModalProps } from '../../types/preference-modal';
import { usePreferenceModal } from '../../hooks/usePreferenceModal';
import { InclusionType } from '../../types/enhanced-form-data';

export const EnhancedPreferenceModal: React.FC<EnhancedPreferenceModalProps> = ({
  isOpen,
  onClose,
  inclusionType,
  initialData = {},
  onDataChange,
  onSubmit,
  enableInteractionFixes = true,
  enableOtherInput = false,
  enableMultiSelect = false,
  multiSelectFields = [],
  validationSchema,
  onValidationError,
  returnFocusTo,
  enableFocusTrap = true,
  ariaLabelledBy,
  className = '',
  overlayClassName = '',
  contentClassName = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { state, actions } = usePreferenceModal(inclusionType, {
    enableFocusTrap,
    onDataChange,
  });

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      actions.openModal(inclusionType);
      // Focus trap setup
      if (enableFocusTrap && modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      actions.closeModal();
      // Return focus
      if (returnFocusTo) {
        returnFocusTo.focus();
      }
    }
  }, [isOpen, actions, inclusionType, enableFocusTrap, returnFocusTo]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation(); // Fix for button interaction issues

      if (validationSchema) {
        const result = validationSchema.safeParse(state.formData);
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          onValidationError?.(errors as Record<string, string>);
          return;
        }
      }

      onSubmit(state.formData);
      onClose();
    },
    [state.formData, validationSchema, onSubmit, onClose, onValidationError]
  );

  // Handle data changes
  const handleDataChange = useCallback(
    (field: string, value: any) => {
      actions.updateFormData({ [field]: value });
      onDataChange({ [field]: value });
    },
    [actions, onDataChange]
  );

  // Handle multi-select changes
  const handleMultiSelectChange = useCallback(
    (field: string, value: string, checked: boolean) => {
      const currentValues = state.multiSelectValues || [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);

      actions.setMultiSelectValues(newValues);
      handleDataChange(field, newValues);
    },
    [actions, handleDataChange, state.multiSelectValues]
  );

  // Handle other input toggle
  const handleOtherToggle = useCallback(() => {
    actions.toggleOtherInput();
  }, [actions]);

  // Handle other input value change
  const handleOtherInputChange = useCallback(
    (value: string) => {
      actions.updateFormData({ other: value });
      handleDataChange('other', value);
    },
    [actions, handleDataChange]
  ); // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}
      onClick={handleOverlayClick}
      data-testid="preference-modal-overlay"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${contentClassName}`}
        tabIndex={-1}
        data-testid="preference-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id={ariaLabelledBy} className="text-xl font-semibold text-gray-900">
            {inclusionType === 'accommodations'
              ? 'Accommodation Preferences'
              : 'Rental Car Preferences'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close modal"
            data-testid="modal-close-button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {inclusionType === 'accommodations' ? (
            /* Accommodations Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred accommodation types
                </label>
                <div className="space-y-2">
                  {['Hotel', 'Resort', 'Vacation Rental', 'Hostel', 'Boutique Hotel'].map(
                    (type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          value={type}
                          onChange={(e) =>
                            handleDataChange(
                              'accommodationTypes',
                              e.target.checked
                                ? [...(state.formData['accommodationTypes'] || []), type]
                                : (state.formData['accommodationTypes'] || []).filter(
                                    (t: string) => t !== type
                                  )
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          data-testid={`accommodation-${type.toLowerCase().replace(' ', '-')}`}
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Other input */}
              {enableOtherInput && (
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={state.showOtherInput}
                      onChange={handleOtherToggle}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      data-testid="other-toggle"
                    />
                    <span className="ml-2 text-sm text-gray-700">Other</span>
                  </label>

                  {state.showOtherInput && (
                    <input
                      type="text"
                      value={state.otherInputValue}
                      onChange={(e) => handleOtherInputChange(e.target.value)}
                      placeholder="Please specify"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="other-input"
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Rental Car Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred vehicle types
                </label>
                <div className="space-y-2">
                  {['Compact', 'Midsize', 'Full-size', 'SUV', 'Luxury', 'Convertible'].map(
                    (type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          value={type}
                          checked={state.multiSelectValues.includes(type)}
                          onChange={(e) =>
                            handleMultiSelectChange('vehicleTypes', type, e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          data-testid={`vehicle-${type.toLowerCase()}`}
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Validation errors */}
          {Object.keys(state.validationErrors).length > 0 && (
            <div className="text-red-600 text-sm space-y-1">
              {Object.entries(state.validationErrors).map(([field, error]) => (
                <div key={field} data-testid={`error-${field}`}>
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              data-testid="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
              data-testid="submit-button"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
