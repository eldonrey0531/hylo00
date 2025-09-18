// Travel Style Progressive Disclosure Component
// Constitutional compliance: Edge-compatible, type-safe, observable

import React, { useCallback } from 'react';
import { TravelStyleProgressiveDisclosureProps } from '../../types/travel-style';
import { useTravelStyle } from '../../hooks/useTravelStyle';
import { TravelStyleChoice } from '../../types/enhanced-form-data';

export const TravelStyleProgressiveDisclosure: React.FC<TravelStyleProgressiveDisclosureProps> = ({
  onChoiceSelect,
  onSkipToNickname,
  onComplete,
  initialChoice = 'not-selected',
  preservedData,
  enableProgressTracking = true,
  allowBackNavigation = true,
  validateOnStepChange = false,
  choiceButtonTexts = {
    answerQuestions: 'Answer style questions',
    skipAhead: 'Skip to trip details'
  },
  onStepChange,
  onDataPreservation,
  className = '',
}) => {
  const [state, actions] = useTravelStyle(initialChoice);

  // Handle choice selection
  const handleChoiceSelect = useCallback((choice: TravelStyleChoice) => {
    actions.makeChoice(choice);
    onChoiceSelect(choice);

    if (choice === 'skip-to-details') {
      onSkipToNickname();
    }
  }, [actions, onChoiceSelect, onSkipToNickname]);

  // Handle section completion
  const handleSectionComplete = useCallback((section: string) => {
    actions.markSectionComplete(section);
    onStepChange?.(section, state.preservedData);
  }, [actions, onStepChange, state.preservedData]);

  // Handle data preservation
  const handleDataPreservation = useCallback((data: any) => {
    actions.preserveData(data);
    onDataPreservation?.(data);
  }, [actions, onDataPreservation]);

  // Render choice buttons (initial state)
  if (!state.showSelectionButtons) {
    return (
      <div className={`travel-style-progressive ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How would you like to define your travel style?
          </h2>

          <div className="space-y-4">
            <button
              onClick={() => handleChoiceSelect('answer-questions')}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg font-medium"
              data-testid="answer-questions-button"
            >
              {choiceButtonTexts.answerQuestions}
            </button>

            <button
              onClick={() => handleChoiceSelect('skip-to-details')}
              className="w-full px-6 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg font-medium"
              data-testid="skip-ahead-button"
            >
              {choiceButtonTexts.skipAhead}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render travel style sections (after choice is made)
  return (
    <div className={`travel-style-progressive ${className}`}>
      <div className="space-y-8">
        {/* Experience Section */}
        <div className="travel-style-section">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How experienced are you with travel planning?
          </h3>
          <div className="space-y-2">
            {['First time', 'Occasional traveler', 'Frequent traveler', 'Travel expert'].map((option) => (
              <button
                key={option}
                onClick={() => handleDataPreservation({ experience: [option] })}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                data-testid={`experience-${option.toLowerCase().replace(' ', '-')}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Pace Section */}
        <div className="travel-style-section">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What pace do you prefer for your trip?
          </h3>
          <div className="space-y-2">
            {['Relaxed and leisurely', 'Balanced mix', 'Fast-paced and adventurous', 'Flexible'].map((option) => (
              <button
                key={option}
                onClick={() => handleDataPreservation({ pace: [option] })}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                data-testid={`pace-${option.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Interests Section */}
        <div className="travel-style-section">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What are your main interests? (Select all that apply)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Culture & History',
              'Nature & Outdoors',
              'Food & Cuisine',
              'Adventure & Sports',
              'Relaxation & Wellness',
              'Nightlife & Entertainment'
            ].map((interest) => (
              <button
                key={interest}
                onClick={() => handleDataPreservation({ interests: [interest] })}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 text-sm"
                data-testid={`interest-${interest.toLowerCase().replace(/\s+&\s+|\s+/g, '-')}`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Complete Button */}
        <div className="text-center pt-6">
          <button
            onClick={() => onComplete(state.preservedData)}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg font-medium"
            data-testid="complete-travel-style"
          >
            Complete Travel Style Setup
          </button>
        </div>

        {/* Progress indicator */}
        {enableProgressTracking && (
          <div className="text-center text-sm text-gray-600">
            Sections completed: {state.completedSections.length}
          </div>
        )}
      </div>
    </div>
  );
};