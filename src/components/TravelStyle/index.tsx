// src/components/TravelStyle/index.tsx
// Parent orchestrator component for all TravelStyle forms

import React, { useCallback, useState, useEffect } from 'react';
import { TravelStyleData, validateTravelStyleCompletion, getTravelStyleProgress } from './types';

// Import all form components (will be implemented in Phase 2)
// import PacePreference from './PacePreference';
// import ActivityLevel from './ActivityLevel';
// import PlanningStyle from './PlanningStyle';
// import AccommodationType from './AccommodationType';
// import CulturalInterest from './CulturalInterest';
// import BudgetStyle from './BudgetStyle';
// import DiningPreferences from './DiningPreferences';
// import TransportPreferences from './TransportPreferences';
// import TravelInterestsSelector from './TravelInterestsSelector';
// import TripPurpose from './TripPurpose';
// import GenerateItineraryButton from './GenerateItineraryButton';

interface TravelStyleProps {
  styleData: TravelStyleData;
  onStyleChange: (data: TravelStyleData) => void;
  enableValidation?: boolean;
  visibleSections?: {
    pace?: boolean;
    activityLevel?: boolean;
    planningStyle?: boolean;
    accommodationType?: boolean;
    culturalInterest?: boolean;
    budgetStyle?: boolean;
    diningPreferences?: boolean;
    transportPreferences?: boolean;
    interests?: boolean;
    purpose?: boolean;
  };
  showGenerateButton?: boolean;
  onGenerate?: () => void;
}

const TravelStyle: React.FC<TravelStyleProps> = ({
  styleData,
  onStyleChange,
  enableValidation = true,
  visibleSections = {
    pace: true,
    activityLevel: true,
    planningStyle: true,
    accommodationType: true,
    culturalInterest: true,
    budgetStyle: true,
    diningPreferences: true,
    transportPreferences: true,
    interests: true,
    purpose: true,
  },
  showGenerateButton = false,
  onGenerate,
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form completion when data changes
  useEffect(() => {
    if (enableValidation) {
      const isValid = validateTravelStyleCompletion(styleData);
      setIsFormValid(isValid);

      // Update completion tracking
      const updatedData = { ...styleData, isComplete: isValid };
      if (updatedData.isComplete !== styleData.isComplete) {
        onStyleChange(updatedData);
      }
    }
  }, [styleData, enableValidation, onStyleChange]);

  const handleStyleUpdate = useCallback(
    (updates: Partial<TravelStyleData>) => {
      const newStyleData = { ...styleData, ...updates };
      onStyleChange(newStyleData);
    },
    [styleData, onStyleChange]
  );

  const handleValidation = useCallback((field: string, isValid: boolean, errors?: string[]) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (errors && errors.length > 0 && errors[0]) {
        newErrors[field] = errors[0];
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, []);

  const baseProps = {
    styleData,
    onStyleChange: handleStyleUpdate,
    ...(enableValidation && {
      validationErrors,
      onValidation: handleValidation,
    }),
  };

  const progress = getTravelStyleProgress(styleData);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wide mb-2 font-raleway">
            Travel Style Preferences
          </h2>
          <p className="text-primary font-bold font-raleway text-sm mb-4">
            Help us understand your travel style to create the perfect itinerary
          </p>

          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-primary font-bold font-raleway text-xs">
            {progress.completed} of {progress.total} sections completed ({progress.percentage}%)
          </p>
        </div>
      </div>

      {/* Validation Summary */}
      {enableValidation && Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800 font-raleway">
                Please complete the following:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside font-raleway">
                {Object.entries(validationErrors).map(([field, error]) =>
                  error ? (
                    <li key={field}>
                      <span className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>:{' '}
                      {error}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form completion success indicator */}
      {enableValidation && isFormValid && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-green-800 font-raleway">
                Travel style preferences complete! Ready to generate your personalized itinerary.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PLACEHOLDER: Form Components will be added in Phase 2 */}
      <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
          Travel Style Components
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-primary font-raleway">
          {visibleSections.pace && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-bold">🏃 Pace Preference</span>
              <p className="text-sm">Will be implemented in Phase 2</p>
            </div>
          )}
          {visibleSections.activityLevel && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-bold">🥾 Activity Level</span>
              <p className="text-sm">Will be implemented in Phase 2</p>
            </div>
          )}
          {visibleSections.planningStyle && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-bold">📋 Planning Style</span>
              <p className="text-sm">Will be implemented in Phase 2</p>
            </div>
          )}
          {visibleSections.accommodationType && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-bold">🏨 Accommodation</span>
              <p className="text-sm">Will be implemented in Phase 2</p>
            </div>
          )}
          {visibleSections.culturalInterest && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-bold">🏛️ Cultural Interest</span>
              <p className="text-sm">Will be implemented in Phase 2</p>
            </div>
          )}
          {visibleSections.budgetStyle && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-bold">💰 Budget Style</span>
              <p className="text-sm">Will be implemented in Phase 2</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button (Phase 3) */}
      {showGenerateButton && (
        <div className="text-center">
          <button
            onClick={onGenerate}
            disabled={!isFormValid}
            className={`
              px-8 py-4 rounded-[36px] font-bold font-raleway text-lg transition-all duration-200
              ${
                isFormValid
                  ? 'bg-primary text-white hover:scale-105 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isFormValid
              ? '🚀 Generate My Personalized Itinerary'
              : '⏳ Complete Travel Style First'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelStyle;
