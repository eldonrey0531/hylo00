// T008: TravelExperience Enhanced Component
// Enhanced to capture specific choice names including Other option with custom text input

import React, { useState, useCallback, useEffect } from 'react';
import { BaseFormProps } from './types';

// Travel Experience options with IDs for data gathering
const TRAVEL_EXPERIENCES = [
  { id: 'first-time-visiting', label: 'First time visiting this destination', emoji: '🌟' },
  { id: 'returning-visitor', label: 'Returning visitor to this destination', emoji: '🔄' },
  { id: 'local-connections', label: 'Have local connections or contacts', emoji: '🤝' },
  { id: 'business-travel', label: 'Traveling for business/work purposes', emoji: '💼' },
  { id: 'group-organizer', label: 'Organizing travel for a group', emoji: '👥' },
  { id: 'experienced-traveler', label: 'Experienced international traveler', emoji: '🧳' },
  { id: 'nervous-traveler', label: 'Nervous or first-time international traveler', emoji: '😟' },
  { id: 'other', label: 'Other', emoji: '✨' }
];

const TravelExperience: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.customTravelExperienceText || '');

  // Extract travel experience selections from formData
  const selectedExperiences = formData.travelExperience || [];

  // Derive visibility: show when 'other' is selected
  const showOtherInput = selectedExperiences.includes('other');

  useEffect(() => {
    setLocalOtherText(formData.customTravelExperienceText || '');
  }, [formData.customTravelExperienceText]);

  const toggleExperience = useCallback(
    (experienceId: string) => {
      let newSelection: string[];

      if (experienceId === 'other') {
        const willShow = !selectedExperiences.includes('other');

        if (willShow) {
          newSelection = [...selectedExperiences, 'other'];
        } else {
          // Removing other: remove from selection & clear text
          newSelection = selectedExperiences.filter((e) => e !== 'other');
          setLocalOtherText('');
          onFormChange({ customTravelExperienceText: '' });
        }
      } else {
        newSelection = selectedExperiences.includes(experienceId)
          ? selectedExperiences.filter((e) => e !== experienceId)
          : [...selectedExperiences, experienceId];
      }

      onFormChange({ travelExperience: newSelection });
    },
    [selectedExperiences, onFormChange]
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setLocalOtherText(text);
      onFormChange({ customTravelExperienceText: text });
    },
    [onFormChange]
  );

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Travel Experience Level
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What best describes your travel experience?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRAVEL_EXPERIENCES.map((option) => {
          const isSelected = selectedExperiences.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggleExperience(option.id)}
              className={`
                h-20 p-3 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-3
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-label={`Toggle ${option.label} experience`}
              aria-pressed={isSelected}
            >
              <span className="text-xl">{option.emoji}</span>
              <span
                className={`font-bold text-left leading-tight font-raleway text-sm ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Other Input Field */}
      {showOtherInput && (
        <div className="bg-primary/10 rounded-[10px] p-4 border-3 border-primary/20 mt-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">✨</span>
            <label className="block text-primary font-bold text-base font-raleway">Other Travel Experience</label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            Describe your travel experience background
          </label>
          <textarea
            value={localOtherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Describe your travel experience level or any specific background relevant to this trip..."
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
            aria-label="Describe other travel experience"
          />
        </div>
      )}
    </div>
  );
};

export default TravelExperience;