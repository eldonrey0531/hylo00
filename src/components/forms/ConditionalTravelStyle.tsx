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
import { TravelStyleChoice as TravelStyleChoiceEnum, ConditionalTravelStyleProps } from '@/types/travel-style-choice';
import TravelStyleChoice from './TravelStyleChoice';
import { TravelStyleGroup } from './TravelStyleGroup';
import TripNickname from './travel-style/TripNickname';

const ConditionalTravelStyle: React.FC<ConditionalTravelStyleProps> = ({
  choice,
  onChoiceChange,
  formData,
  onFormChange,
  onGenerateItinerary,
  // Unused props preserved for backward compatibility
  selectedExperience = [],
  onExperienceChange = () => {},
  selectedVibes = [],
  onVibeChange = () => {},
  customVibesText = '',
  onCustomVibesChange = () => {},
  selectedSampleDays = [],
  onSampleDaysChange = () => {},
  dinnerChoices = [],
  onDinnerChoicesChange = () => {},
  tripNickname = '',
  onTripNicknameChange = () => {},
  contactInfo = {},
  onContactChange = () => {},
  disabled = false,
  validationErrors = {},
}) => {
  return (
    <div className="space-y-8" data-testid="travel-style-container">
      {choice === TravelStyleChoiceEnum.NOT_SELECTED && (
        <div key="choice-component">
          <TravelStyleChoice onChoiceSelect={onChoiceChange} disabled={disabled} />
        </div>
      )}

      {choice === TravelStyleChoiceEnum.DETAILED && (
        <div key="detailed-placeholder" className="space-y-8">
          {/* Travel Style Groups are now rendered at page level for full width */}
        </div>
      )}

      {choice === TravelStyleChoiceEnum.SKIP && (
        <div key="skip-component" className="space-y-8">
          {/* Trip Nickname Form Only */}
          <div className="bg-form-box rounded-[20px] p-6">
            <TripNickname
              tripNickname={tripNickname || ''}
              onNicknameChange={onTripNicknameChange}
              contactInfo={contactInfo}
              onContactChange={onContactChange}
              formData={formData}
              validationErrors={validationErrors.tripNickname || []}
            />
          </div>
        </div>
      )}

      {/* Generate Itinerary Button - shown only for SKIP path */}
      {choice === TravelStyleChoiceEnum.SKIP && (
        <div className="pt-6">
          <button
            type="button"
            onClick={onGenerateItinerary}
            className="w-full px-12 py-6 rounded-[36px] font-bold font-raleway text-[32px] bg-[#f68854] text-primary hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 transform hover:scale-105 relative group"
          >
            <div className="flex items-center justify-center space-x-3">
              <span>GENERATE MY PERSONALIZED ITINERARY</span>
              <span className="text-2xl">✨</span>
            </div>

            {/* Animated background effect on hover */}
            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConditionalTravelStyle;
