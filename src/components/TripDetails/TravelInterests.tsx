// src/components/TripDetails/TravelInterests.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { BaseFormProps, TRAVEL_INTERESTS } from './types';

const TravelInterests: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.customInterestsText || '');

  // Extract interest selections from formData
  const selectedInterests = formData.selectedInterests || [];

  // Derive visibility: show when 'other' is selected
  const showOtherInput = selectedInterests.includes('other');

  useEffect(() => {
    setLocalOtherText(formData.customInterestsText || '');
  }, [formData.customInterestsText]);

  const toggleInterest = useCallback(
    (interestId: string) => {
      let newSelection: string[];

      if (interestId === 'other') {
        const willShow = !selectedInterests.includes('other');

        if (willShow) {
          newSelection = [...selectedInterests, 'other'];
        } else {
          // Removing other: remove from selection & clear text
          newSelection = selectedInterests.filter((i) => i !== 'other');
          setLocalOtherText('');
          onFormChange({ customInterestsText: '' });
        }
      } else {
        newSelection = selectedInterests.includes(interestId)
          ? selectedInterests.filter((i) => i !== interestId)
          : [...selectedInterests, interestId];
      }

      onFormChange({ selectedInterests: newSelection });
    },
    [selectedInterests, onFormChange]
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setLocalOtherText(text);
      onFormChange({ customInterestsText: text });
    },
    [onFormChange]
  );

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          TRAVEL INTERESTS
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          Select all that apply to this trip
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TRAVEL_INTERESTS.map((option) => {
          const isSelected = selectedInterests.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggleInterest(option.id)}
              className={`
                h-24 p-3 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-2
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-label={`Select ${option.label.replace('\n', ' ')} interest`}
              aria-pressed={isSelected}
            >
              <span className="text-xl">{option.emoji}</span>
              <span
                className={`text-xs font-bold text-center leading-tight font-raleway whitespace-pre-line ${
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
            <label className="block text-primary font-bold text-base font-raleway">Other</label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            What other interests would you like to explore?
          </label>
          <textarea
            value={localOtherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Specify your interests: photography, cooking classes, wine tasting, etc."
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
            aria-label="Describe other interests"
          />
        </div>
      )}
    </div>
  );
};

export default TravelInterests;