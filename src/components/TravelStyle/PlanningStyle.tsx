// src/components/TravelStyle/PlanningStyle.tsx
import React, { useCallback, useEffect } from 'react';
import { BaseStyleFormProps, PLANNING_STYLES, PlanningPreference } from './types';

const PlanningStyle: React.FC<BaseStyleFormProps> = ({
  styleData,
  onStyleChange,
  validationErrors,
  onValidation,
}) => {
  const currentPlanningStyle = styleData.planningPreference;

  useEffect(() => {
    // Validate on mount and when planning style changes
    if (onValidation) {
      const isValid = Boolean(currentPlanningStyle);
      const errors = isValid ? [] : ['Please select your planning preference'];
      onValidation('planningPreference', isValid, errors);
    }
  }, [currentPlanningStyle, onValidation]);

  const handlePlanningSelect = useCallback(
    (planningPreference: PlanningPreference) => {
      onStyleChange({ planningPreference });
    },
    [onStyleChange]
  );

  const hasError = validationErrors?.['planningPreference'];

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Planning Style
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          How much planning do you prefer?
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANNING_STYLES.map((option) => {
          const isSelected = currentPlanningStyle === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handlePlanningSelect(option.value as PlanningPreference)}
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
              aria-label={`Select ${option.label} planning style`}
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
      {currentPlanningStyle && !hasError && (
        <div className="mt-4 text-center">
          <span className="text-sm text-green-600 font-bold font-raleway flex items-center justify-center">
            <span className="mr-1">✓</span>
            Planning style preference set!
          </span>
        </div>
      )}
    </div>
  );
};

export default PlanningStyle;
