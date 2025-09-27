// src/components/TripDetails/ValidationSummary.tsx
import React from 'react';
import { ValidationResult } from './types';

interface ValidationSummaryProps {
  validationResult: ValidationResult;
  isVisible?: boolean;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validationResult,
  isVisible = true,
}) => {
  if (!isVisible || validationResult.isValid) {
    return null;
  }

  const errorEntries = Object.entries(validationResult.fieldErrors).filter(([, error]) => error);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-red-400 text-lg">⚠️</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold text-red-800 font-raleway">
            Please fix the following issues to continue:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside font-raleway space-y-1">
            {errorEntries.map(([field, error]) => (
              <li key={field}>
                <span className="capitalize font-semibold">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </span>
                : {error}
              </li>
            ))}
          </ul>
          <div className="mt-3 text-xs text-red-600 font-raleway">
            💡 <span className="font-semibold">Tip:</span> All fields marked with red borders need
            attention
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;
