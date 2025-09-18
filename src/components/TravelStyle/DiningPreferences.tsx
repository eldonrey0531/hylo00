// src/components/TravelStyle/DiningPreferences.tsx
import React, { useCallback, useEffect } from 'react';
import { BaseStyleFormProps, DINING_PREFERENCES } from './types';

const DiningPreferences: React.FC<BaseStyleFormProps> = ({
  styleData,
  onStyleChange,
  validationErrors,
  onValidation,
}) => {
  const selectedPreferences = styleData.diningPreferences || [];

  useEffect(() => {
    if (onValidation) {
      const isValid = selectedPreferences.length > 0;
      const errors = isValid ? [] : ['Please select at least one dining preference'];
      onValidation('diningPreferences', isValid, errors);
    }
  }, [selectedPreferences, onValidation]);

  const handleToggle = useCallback(
    (preferenceId: string) => {
      const updated = selectedPreferences.includes(preferenceId)
        ? selectedPreferences.filter((id) => id !== preferenceId)
        : [...selectedPreferences, preferenceId];

      onStyleChange({ diningPreferences: updated });
    },
    [selectedPreferences, onStyleChange]
  );

  const hasError = validationErrors?.['diningPreferences'];

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Dining Preferences
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What dining experiences appeal to you? (Select all that apply)
        </p>
        {selectedPreferences.length > 0 && (
          <p className="text-green-600 font-bold font-raleway text-xs mt-1">
            {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''}{' '}
            selected
          </p>
        )}
        {hasError && (
          <p
            className="text-sm text-red-600 font-bold font-raleway mt-2 flex items-center"
            role="alert"
          >
            <span className="mr-1">⚠️</span>
            {hasError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DINING_PREFERENCES.map((option) => {
          const isSelected = selectedPreferences.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`
                h-20 p-2 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-1 text-center
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-pressed={isSelected}
            >
              <span className="text-lg">{option.emoji}</span>
              <span
                className={`text-xs font-bold leading-tight font-raleway ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {option.label}
              </span>
              {isSelected && <span className="text-white text-xs">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DiningPreferences;
