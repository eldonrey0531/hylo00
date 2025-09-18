// src/components/TravelStyle/GenerateItineraryButton.tsx
import React from 'react';
import { TravelStyleData, validateTravelStyleCompletion, getTravelStyleProgress } from './types';

interface GenerateItineraryButtonProps {
  styleData: TravelStyleData;
  onGenerate: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const GenerateItineraryButton: React.FC<GenerateItineraryButtonProps> = ({
  styleData,
  onGenerate,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const isFormValid = validateTravelStyleCompletion(styleData);
  const progress = getTravelStyleProgress(styleData);
  const isDisabled = disabled || !isFormValid || isLoading;

  const getButtonText = () => {
    if (isLoading) return '🔄 Generating Your Itinerary...';
    if (!isFormValid) return `⏳ Complete Travel Style (${progress.completed}/${progress.total})`;
    return '🚀 Generate My Personalized Itinerary';
  };

  const getButtonIcon = () => {
    if (isLoading) return '🔄';
    if (!isFormValid) return '⏳';
    return '🚀';
  };

  return (
    <div className={`text-center ${className}`}>
      {/* Progress indicator when form is incomplete */}
      {!isFormValid && !isLoading && (
        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-amber-400">📋</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-amber-800 font-raleway">
                Complete your travel style preferences to generate your personalized itinerary
              </p>
              <div className="mt-2">
                <div className="bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-amber-700 font-raleway mt-1">
                  {progress.completed} of {progress.total} required sections completed
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success indicator when form is complete */}
      {isFormValid && !isLoading && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-green-800 font-raleway">
                Perfect! Your travel style is complete. Ready to create your personalized itinerary!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-blue-400 animate-spin">🔄</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-blue-800 font-raleway">
                Creating your personalized itinerary based on your travel style...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main generate button */}
      <button
        onClick={onGenerate}
        disabled={isDisabled}
        className={`
          px-8 py-4 rounded-[36px] font-bold font-raleway text-lg transition-all duration-200 min-w-[300px]
          ${
            isFormValid && !isLoading
              ? 'bg-primary text-white hover:scale-105 shadow-lg hover:shadow-xl'
              : isLoading
              ? 'bg-blue-500 text-white cursor-wait'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
        aria-label={getButtonText()}
      >
        <span className="flex items-center justify-center space-x-2">
          <span className={isLoading ? 'animate-spin' : ''}>{getButtonIcon()}</span>
          <span>{getButtonText()}</span>
        </span>
      </button>

      {/* Help text */}
      <p className="text-xs text-gray-600 font-raleway mt-3 max-w-md mx-auto">
        {isFormValid
          ? 'Your itinerary will be customized based on your travel style preferences'
          : 'Complete the required sections above to unlock itinerary generation'}
      </p>
    </div>
  );
};

export default GenerateItineraryButton;
