// src/components/TravelStyle/ActivityLevel.tsx
import React, { useCallback, useEffect } from 'react';
import { BaseStyleFormProps, ACTIVITY_LEVELS, ActivityLevel as ActivityLevelType } from './types';

const ActivityLevel: React.FC<BaseStyleFormProps> = ({
  styleData,
  onStyleChange,
  validationErrors,
  onValidation,
}) => {
  const currentActivityLevel = styleData.activityLevel;

  useEffect(() => {
    // Validate on mount and when activity level changes
    if (onValidation) {
      const isValid = Boolean(currentActivityLevel);
      const errors = isValid ? [] : ['Please select your preferred activity level'];
      onValidation('activityLevel', isValid, errors);
    }
  }, [currentActivityLevel, onValidation]);

  const handleActivitySelect = useCallback(
    (activityLevel: ActivityLevelType) => {
      onStyleChange({ activityLevel });
    },
    [onStyleChange]
  );

  const hasError = validationErrors?.['activityLevel'];

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Activity Level
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          How active do you want your trip to be?
        </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACTIVITY_LEVELS.map((option) => {
          const isSelected = currentActivityLevel === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleActivitySelect(option.value as ActivityLevelType)}
              className={`
                h-32 p-4 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-2 text-center
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : hasError
                    ? 'border-red-500 bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-label={`Select ${option.label} activity level`}
              aria-pressed={isSelected}
            >
              <span className="text-3xl">{option.icon}</span>
              <span
                className={`text-base font-bold leading-tight font-raleway ${
                  isSelected ? 'text-white' : hasError ? 'text-red-600' : 'text-primary'
                }`}
              >
                {option.label}
              </span>
              <span
                className={`text-xs leading-tight font-raleway ${
                  isSelected
                    ? 'text-white opacity-90'
                    : hasError
                    ? 'text-red-500'
                    : 'text-primary opacity-75'
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Success indicator */}
      {currentActivityLevel && !hasError && (
        <div className="mt-4 text-center">
          <span className="text-sm text-green-600 font-bold font-raleway flex items-center justify-center">
            <span className="mr-1">✓</span>
            Activity level preference set!
          </span>
        </div>
      )}
    </div>
  );
};

export default ActivityLevel;
