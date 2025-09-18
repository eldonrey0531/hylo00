// src/components/TravelStyle/BudgetStyle.tsx
import React, { useCallback, useEffect } from 'react';
import { BaseStyleFormProps, BUDGET_STYLES, BudgetStyle as BudgetStyleType } from './types';

const BudgetStyle: React.FC<BaseStyleFormProps> = ({
  styleData,
  onStyleChange,
  validationErrors,
  onValidation,
}) => {
  const currentBudgetStyle = styleData.budgetStyle;

  useEffect(() => {
    // Validate on mount and when budget style changes
    if (onValidation) {
      const isValid = Boolean(currentBudgetStyle);
      const errors = isValid ? [] : ['Please select your budget style'];
      onValidation('budgetStyle', isValid, errors);
    }
  }, [currentBudgetStyle, onValidation]);

  const handleBudgetSelect = useCallback(
    (budgetStyle: BudgetStyleType) => {
      onStyleChange({ budgetStyle });
    },
    [onStyleChange]
  );

  const hasError = validationErrors?.['budgetStyle'];

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Budget Style
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What's your approach to spending while traveling?
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
        {BUDGET_STYLES.map((option) => {
          const isSelected = currentBudgetStyle === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleBudgetSelect(option.value as BudgetStyleType)}
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
              aria-label={`Select ${option.label} budget style`}
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
      {currentBudgetStyle && !hasError && (
        <div className="mt-4 text-center">
          <span className="text-sm text-green-600 font-bold font-raleway flex items-center justify-center">
            <span className="mr-1">✓</span>
            Budget style preference set!
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetStyle;
