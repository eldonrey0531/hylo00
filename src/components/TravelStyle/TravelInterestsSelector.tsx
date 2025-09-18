// src/components/TravelStyle/TravelInterestsSelector.tsx
import React, { useCallback, useEffect } from 'react';
import { BaseStyleFormProps, TRAVEL_INTERESTS } from './types';

const TravelInterestsSelector: React.FC<BaseStyleFormProps> = ({
  styleData,
  onStyleChange,
  validationErrors,
  onValidation,
}) => {
  const selectedInterests = styleData.interests || [];

  useEffect(() => {
    // Validate on mount and when selections change
    if (onValidation) {
      const isValid = selectedInterests.length > 0;
      const errors = isValid ? [] : ['Please select at least one travel interest'];
      onValidation('interests', isValid, errors);
    }
  }, [selectedInterests, onValidation]);

  const handleToggle = useCallback(
    (interestId: string) => {
      const updatedInterests = selectedInterests.includes(interestId)
        ? selectedInterests.filter((id) => id !== interestId)
        : [...selectedInterests, interestId];

      onStyleChange({ interests: updatedInterests });
    },
    [selectedInterests, onStyleChange]
  );

  const hasError = validationErrors?.['interests'];

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Travel Interests
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What types of experiences interest you most? (Select all that apply)
        </p>
        {selectedInterests.length > 0 && (
          <p className="text-green-600 font-bold font-raleway text-xs mt-1">
            {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {TRAVEL_INTERESTS.map((option) => {
          const isSelected = selectedInterests.includes(option.id);

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
              <span className="text-xl">{option.emoji}</span>
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
      {selectedInterests.length > 0 && !hasError && (
        <div className="mt-4 text-center">
          <span className="text-sm text-green-600 font-bold font-raleway flex items-center justify-center">
            <span className="mr-1">✓</span>
            Travel interests selected!
          </span>
        </div>
      )}
    </div>
  );
};

export default TravelInterestsSelector;
