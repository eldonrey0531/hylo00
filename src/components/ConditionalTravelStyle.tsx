/**
 * ConditionalTravelStyle Component
 * Feature: 003-group-travel-style
 * 
 * Manages conditional rendering based on user's travel style choice:
 * - NOT_SELECTED: Shows TravelStyleChoice buttons
 * - DETAILED: Shows existing travel style forms
 * - SKIP: Shows nickname entry only
 */

import React from 'react';
import TravelStyleChoice from './TravelStyleChoice';
import TravelExperience from './travel-style/TravelExperience';
import TripVibe from './travel-style/TripVibe';
import SampleDays from './travel-style/SampleDays';
import DinnerChoice from './travel-style/DinnerChoice';
import TripNickname from './travel-style/TripNickname';
import { GenerateItineraryButton } from './GenerateItineraryButton';
import { TravelStyleChoice as TravelStyleChoiceEnum, ConditionalTravelStyleProps } from '../types/travel-style-choice';

const ConditionalTravelStyle: React.FC<ConditionalTravelStyleProps> = ({
  choice,
  onChoiceChange,
  formData,
  onFormChange,
  disabled = false,
}) => {
  // NOT_SELECTED: Show choice buttons
  if (choice === TravelStyleChoiceEnum.NOT_SELECTED) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 font-raleway">
            🌏 TRAVEL STYLE
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-raleway">
            Help us create the perfect itinerary by sharing your travel preferences
          </p>
        </div>
        
        <TravelStyleChoice 
          onChoiceSelect={onChoiceChange}
          disabled={disabled}
        />
      </div>
    );
  }

  // DETAILED: Show existing travel style forms
  if (choice === TravelStyleChoiceEnum.DETAILED) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 font-raleway">
            🌏 TRAVEL STYLE
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-raleway">
            Tell us about your travel preferences for a personalized itinerary
          </p>
        </div>
        
        <div className="space-y-8">
          <div data-testid="travel-experience-form">
            <TravelExperience
              selectedExperience={formData?.travelStyleAnswers?.experience || []}
              onSelectionChange={(experience) => 
                onFormChange({
                  ...formData,
                  travelStyleAnswers: {
                    ...formData?.travelStyleAnswers,
                    experience,
                  },
                })
              }
            />
          </div>

          <div data-testid="trip-vibe-form">
            <TripVibe
              selectedVibes={formData?.travelStyleAnswers?.vibes || []}
              onSelectionChange={(vibes) => 
                onFormChange({
                  ...formData,
                  travelStyleAnswers: {
                    ...formData?.travelStyleAnswers,
                    vibes,
                  },
                })
              }
              otherText={formData?.travelStyleAnswers?.vibesOther || ''}
              onOtherTextChange={(vibesOther: string) => 
                onFormChange({
                  ...formData,
                  travelStyleAnswers: {
                    ...formData?.travelStyleAnswers,
                    vibesOther,
                  },
                })
              }
            />
          </div>

          <div data-testid="sample-days-form">
            <SampleDays
              selectedDays={formData?.travelStyleAnswers?.sampleDays || []}
              onSelectionChange={(sampleDays) => 
                onFormChange({
                  ...formData,
                  travelStyleAnswers: {
                    ...formData?.travelStyleAnswers,
                    sampleDays,
                  },
                })
              }
            />
          </div>

          <div data-testid="dinner-choice-form">
            <DinnerChoice
              selectedChoice={formData?.travelStyleAnswers?.dinnerChoices || []}
              onSelectionChange={(dinnerChoices: string[]) => 
                onFormChange({
                  ...formData,
                  travelStyleAnswers: {
                    ...formData?.travelStyleAnswers,
                    dinnerChoices,
                  },
                })
              }
            />
          </div>

          <div data-testid="trip-nickname-form">
            <TripNickname
              tripNickname={formData?.tripNickname || ''}
              onNicknameChange={(tripNickname: string) => 
                onFormChange({
                  ...formData,
                  tripNickname,
                })
              }
              contactInfo={formData?.contactInfo || {}}
              onContactChange={(contactInfo: any) => 
                onFormChange({
                  ...formData,
                  contactInfo,
                })
              }
            />
          </div>

          <GenerateItineraryButton 
            isSubmitting={false}
            onClick={() => {}}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  // SKIP: Show nickname entry only
  if (choice === TravelStyleChoiceEnum.SKIP) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 font-raleway">
            🏷️ TRIP NICKNAME
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-raleway">
            Give your trip a memorable name
          </p>
        </div>
        
        <div data-testid="trip-nickname-form">
          <TripNickname
            tripNickname={formData?.tripNickname || ''}
            onNicknameChange={(tripNickname: string) => 
              onFormChange({
                ...formData,
                tripNickname,
              })
            }
            contactInfo={formData?.contactInfo || {}}
            onContactChange={(contactInfo: any) => 
              onFormChange({
                ...formData,
                contactInfo,
              })
            }
          />
        </div>

        <GenerateItineraryButton 
          isSubmitting={false}
          onClick={() => {}}
          disabled={disabled}
        />
        
        <div className="text-center">
          <button
            onClick={() => onChoiceChange(TravelStyleChoiceEnum.NOT_SELECTED)}
            disabled={disabled}
            className={`
              text-primary hover:text-primary-dark underline font-raleway font-medium
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:no-underline'}
            `}
          >
            ← Back to travel style options
          </button>
        </div>
      </div>
    );
  }

  // Fallback for any unexpected state
  return null;
};

export default ConditionalTravelStyle;