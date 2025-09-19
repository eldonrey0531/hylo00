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
import ContactForm from './ContactForm';
import { GenerateItineraryButton } from './GenerateItineraryButton';

const ConditionalTravelStyle: React.FC<ConditionalTravelStyleProps> = ({
  choice,
  onChoiceChange,
  formData,
  onFormChange,
  selectedExperience,
  onExperienceChange,
  selectedVibes,
  onVibeChange,
  customVibesText,
  onCustomVibesChange,
  selectedSampleDays,
  onSampleDaysChange,
  dinnerChoices,
  onDinnerChoicesChange,
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
    <div className="space-y-8">
      <div className="bg-form-box text-primary p-6 shadow-lg -mx-4 sm:-mx-6 lg:-mx-8 2xl:-mx-16" data-testid="travel-style-container">
        <div className="text-center bg-[#f9dd8b] p-6 mb-6">
          <h2 className="text-3xl font-bold text-primary mb-4 font-raleway">
            🌏 TRAVEL STYLE
          </h2>
        </div>
        <div className="text-center">
          <p className="text-lg text-primary max-w-2xl mx-auto font-raleway opacity-90">
            Help us create the perfect itinerary by sharing your travel preferences
          </p>
        </div>
      </div>

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

          {/* Contact Form */}
          <ContactForm
            contactInfo={contactInfo}
            onContactChange={onContactChange}
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
          {/* Contact Form Only */}
          <ContactForm
            contactInfo={contactInfo}
            onContactChange={onContactChange}
          />

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
