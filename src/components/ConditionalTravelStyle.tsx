/**
 * ConditionalTravelStyle
 * Feature: 003-group-travel-style
 * 
 * Manages conditional rendering based on user's travel style choice:
 * - NOT_SELECTED: Shows TravelStyleChoice buttons
 * - DETAILED: Shows existing travel style forms
 * - SKIP: Shows nickname entry only
 */

import React from 'react';
import { TravelStyleChoice as TravelStyleChoiceEnum, ConditionalTravelStyleProps } from '../types/travel-style-choice';
import TravelStyleChoice from './TravelStyleChoice';
import { TravelStyleGroup } from './TravelStyleGroup';
import TripNickname from './travel-style/TripNickname';
import { GenerateItineraryButton } from './GenerateItineraryButton';

const ConditionalTravelStyle: React.FC<ConditionalTravelStyleProps> = ({
  choice,
  onChoiceChange,
  formData,
  onFormChange,
  // Unused props preserved for backward compatibility
  selectedExperience: _selectedExperience,
  onExperienceChange: _onExperienceChange,
  selectedVibes: _selectedVibes,
  onVibeChange: _onVibeChange,
  customVibesText: _customVibesText,
  onCustomVibesChange: _onCustomVibesChange,
  selectedSampleDays: _selectedSampleDays,
  onSampleDaysChange: _onSampleDaysChange,
  dinnerChoices: _dinnerChoices,
  onDinnerChoicesChange: _onDinnerChoicesChange,
  tripNickname,
  onTripNicknameChange,
  contactInfo,
  onContactChange,
  disabled = false,
  onGenerateItinerary,
  isGenerating = false,
}) => {
  // Handle itinerary generation button click
  const handleGenerateClick = () => {
    if (onGenerateItinerary) {
      onGenerateItinerary();
    }
  };

  return (
    <div className="space-y-8" data-testid="travel-style-container">
      {choice === TravelStyleChoiceEnum.NOT_SELECTED && (
        <TravelStyleChoice onChoiceSelect={onChoiceChange} disabled={disabled} />
      )}

      {choice === TravelStyleChoiceEnum.DETAILED && (
        <div className="space-y-8">
          {/* Travel Style Groups - Uses its own prop interface */}
          <TravelStyleGroup
            formData={formData}
            onFormChange={onFormChange}
          />

          {/* Generate Button for Detailed Flow */}
          {onGenerateItinerary && (
            <GenerateItineraryButton 
              isSubmitting={isGenerating} 
              onClick={handleGenerateClick} 
            />
          )}
        </div>
      )}

      {choice === TravelStyleChoiceEnum.SKIP && (
        <div className="space-y-8">
          {/* Trip Nickname Form Only */}
          <div className="bg-form-box rounded-[20px] p-6">
            <TripNickname
              tripNickname={tripNickname || ''}
              onNicknameChange={onTripNicknameChange}
              contactInfo={contactInfo}
              onContactChange={onContactChange}
            />
          </div>

          {/* Generate Button for Skip Flow */}
          {onGenerateItinerary && (
            <GenerateItineraryButton 
              isSubmitting={isGenerating} 
              onClick={handleGenerateClick} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ConditionalTravelStyle;
