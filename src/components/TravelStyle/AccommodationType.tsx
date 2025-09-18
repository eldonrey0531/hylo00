// src/components/TravelStyle/AccommodationType.tsx
import React, { useCallback, useEffect } from 'react';
import { BaseStyleFormProps, ACCOMMODATION_TYPES } from './types';

const AccommodationType: React.FC<BaseStyleFormProps> = ({
  styleData,
  onStyleChange,
  validationErrors,
  onValidation,
}) => {
  const selectedTypes = styleData.accommodationTypes || [];

  useEffect(() => {
    // Validate on mount and when selections change
    if (onValidation) {
      const isValid = selectedTypes.length > 0;
      const errors = isValid ? [] : ['Please select at least one accommodation type'];
      onValidation('accommodationTypes', isValid, errors);
    }
  }, [selectedTypes, onValidation]);

  const handleToggle = useCallback(
    (typeId: string) => {
      const updatedTypes = selectedTypes.includes(typeId)
        ? selectedTypes.filter((id) => id !== typeId)
        : [...selectedTypes, typeId];

      onStyleChange({ accommodationTypes: updatedTypes });
    },
    [selectedTypes, onStyleChange]
  );

  const hasError = validationErrors?.['accommodationTypes'];

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Accommodation Types
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What types of accommodations appeal to you? (Select all that apply)
        </p>
        {selectedTypes.length > 0 && (
          <p className="text-green-600 font-bold font-raleway text-xs mt-1">
            {selectedTypes.length} type{selectedTypes.length !== 1 ? 's' : ''} selected
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
        {ACCOMMODATION_TYPES.map((option) => {
          const isSelected = selectedTypes.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`
                h-24 p-3 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-1 text-center
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : hasError
                    ? 'border-red-500 bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${option.label}`}
              aria-pressed={isSelected}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span
                className={`text-xs font-bold leading-tight font-raleway ${
                  isSelected ? 'text-white' : hasError ? 'text-red-600' : 'text-primary'
                }`}
              >
                {option.label}
              </span>
              {isSelected && <span className="text-white text-xs">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Success indicator */}
      {selectedTypes.length > 0 && !hasError && (
        <div className="mt-4 text-center">
          <span className="text-sm text-green-600 font-bold font-raleway flex items-center justify-center">
            <span className="mr-1">✓</span>
            Accommodation preferences set!
          </span>
        </div>
      )}
    </div>
  );
};

export default AccommodationType;
