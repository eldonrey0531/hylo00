/**
 * Enhanced DinnerChoice Component for TripDetails
 * Feature: T011 DinnerChoice Enhancement
 * 
 * Applies established TripDetails patterns to capture comprehensive dinner choice data
 * with specific choice names and Other option integration.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { BaseFormProps } from './types';

// Dinner choice options with specific IDs and labels for comprehensive data capture
const DINNER_CHOICES = [
  { id: 'michelin-starred', label: 'Michelin-starred restaurant', emoji: '⭐️' },
  { id: 'street-food', label: 'Local street food vendors', emoji: '🍖' },
  { id: 'hotel-restaurant', label: 'Hotel restaurant dining', emoji: '🏩' },
  { id: 'wander-explore', label: 'Wander and explore options', emoji: '🥟' },
  { id: 'not-food-person', label: 'Not a big food person', emoji: '🤷‍♀️' },
  { id: 'food-truck', label: 'Food truck roundup', emoji: '🌮' },
  { id: 'fast-food', label: 'Fast food chains', emoji: '🍟' },
  { id: 'cook-own', label: 'Cook our own dinner', emoji: '🥘' },
  { id: 'other', label: 'Other', emoji: '✨' }
];

const DinnerChoice: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.otherDinnerChoiceText || '');

  // Extract dinner choice selections from formData
  const selectedChoices = formData.selectedDinnerChoices || [];

  // Derive visibility: show when 'other' is selected
  const showOtherInput = selectedChoices.includes('other');

  useEffect(() => {
    setLocalOtherText(formData.otherDinnerChoiceText || '');
  }, [formData.otherDinnerChoiceText]);

  const handleChoiceSelection = useCallback(
    (choiceId: string) => {
      let newSelection: string[];

      if (choiceId === 'other') {
        const willShow = !selectedChoices.includes('other');

        if (willShow) {
          newSelection = [...selectedChoices, 'other'];
        } else {
          // Removing other: remove from selection & clear text
          newSelection = selectedChoices.filter((c) => c !== 'other');
          setLocalOtherText('');
          onFormChange({ otherDinnerChoiceText: '' });
        }
      } else {
        newSelection = selectedChoices.includes(choiceId)
          ? selectedChoices.filter((c) => c !== choiceId)
          : [...selectedChoices, choiceId];
      }

      onFormChange({ selectedDinnerChoices: newSelection });
    },
    [selectedChoices, onFormChange]
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setLocalOtherText(text);
      onFormChange({ otherDinnerChoiceText: text });
    },
    [onFormChange]
  );

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Dinner Preferences
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          You just landed and are starving. Where are you having dinner?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {DINNER_CHOICES.map((choice) => {
          const isSelected = selectedChoices.includes(choice.id);

          return (
            <button
              key={choice.id}
              onClick={() => handleChoiceSelection(choice.id)}
              aria-label={`Toggle ${choice.label} choice`}
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
              <span className="text-xl flex-shrink-0">{choice.emoji}</span>
              <span
                className={`font-bold font-raleway text-sm ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {choice.label}
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
            <label className="block text-primary font-bold text-base font-raleway">Other Dinner Preference</label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            Describe your dinner preferences
          </label>
          <textarea
            value={localOtherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Describe your dinner preference or dietary requirements..."
            maxLength={150}
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
            aria-label="Describe other dinner preference"
          />
        </div>
      )}
    </div>
  );
};

export default DinnerChoice;