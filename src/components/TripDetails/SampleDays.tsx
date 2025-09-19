/**
 * Enhanced SampleDays Component for TripDetails
 * Feature: T010 SampleDays Enhancement
 * 
 * Applies established TripDetails patterns to capture comprehensive sample travel days data
 * with specific choice names and Other option integration.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { BaseFormProps } from './types';

// Sample day options with specific IDs and labels for comprehensive data capture
const SAMPLE_DAYS = [
  { id: 'guided-tour', label: 'Guided tour with landmarks and history', emoji: '🚐' },
  { id: 'wander-own-pace', label: 'Wander at our own pace to explore', emoji: '📸' },
  { id: 'pool-beach-relax', label: 'Pool or beach relaxation day', emoji: '👙' },
  { id: 'adventure-activities', label: 'Adventure activities like ziplining', emoji: '🧑‍🍳' },
  { id: 'cultural-immersion', label: 'Cultural immersion with locals', emoji: '🏟️' },
  { id: 'active-hiking', label: 'Active day with hiking', emoji: '🥾' },
  { id: 'winery-tasting', label: 'Winery or distillery tasting', emoji: '🍷' },
  { id: 'nightlife', label: 'Easy day, party night', emoji: '🥳' },
  { id: 'other', label: 'Other', emoji: '✨' }
];

const SampleDays: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.otherSampleDaysText || '');

  // Extract sample days selections from formData
  const selectedDays = formData.selectedSampleDays || [];

  // Derive visibility: show when 'other' is selected
  const showOtherInput = selectedDays.includes('other');

  useEffect(() => {
    setLocalOtherText(formData.otherSampleDaysText || '');
  }, [formData.otherSampleDaysText]);

  const handleDaySelection = useCallback(
    (dayId: string) => {
      let newSelection: string[];

      if (dayId === 'other') {
        const willShow = !selectedDays.includes('other');

        if (willShow) {
          newSelection = [...selectedDays, 'other'];
        } else {
          // Removing other: remove from selection & clear text
          newSelection = selectedDays.filter((d) => d !== 'other');
          setLocalOtherText('');
          onFormChange({ otherSampleDaysText: '' });
        }
      } else {
        newSelection = selectedDays.includes(dayId)
          ? selectedDays.filter((d) => d !== dayId)
          : [...selectedDays, dayId];
      }

      onFormChange({ selectedSampleDays: newSelection });
    },
    [selectedDays, onFormChange]
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setLocalOtherText(text);
      onFormChange({ otherSampleDaysText: text });
    },
    [onFormChange]
  );

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Sample Travel Days
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          Which of these sample travel days are you drawn to?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SAMPLE_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.id);

          return (
            <button
              key={day.id}
              onClick={() => handleDaySelection(day.id)}
              aria-label={`Toggle ${day.label} day`}
              aria-pressed={isSelected}
              className={`
                p-4 rounded-[10px] border-3 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-3
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
            >
              <span className="text-xl flex-shrink-0">{day.emoji}</span>
              <span
                className={`font-bold font-raleway text-sm ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {day.label}
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
            <label className="block text-primary font-bold text-base font-raleway">Other Travel Day</label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            Describe your ideal travel day activities
          </label>
          <textarea
            value={localOtherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Describe your ideal travel day activities or itinerary..."
            maxLength={200}
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
            aria-label="Describe other travel day"
          />
        </div>
      )}
    </div>
  );
};

export default SampleDays;