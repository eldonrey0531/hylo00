// src/components/TripDetails/TravelGroupSelector.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { BaseFormProps, TRAVEL_GROUPS, validateTravelGroups } from './types';

const TravelGroupSelector: React.FC<BaseFormProps> = ({ formData, onFormChange, validationErrors = [] }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.customGroupText || '');
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Extract group selections from formData (using selectedGroups)
  const selectedGroups = formData.selectedGroups || [];

  useEffect(() => {
    setLocalOtherText(formData.customGroupText || '');
    setShowOtherInput(selectedGroups.includes('other'));
  }, [formData.customGroupText, selectedGroups]);

  const toggleGroup = useCallback(
    (groupId: string) => {
      let newSelection: string[];
      
      if (groupId === 'other') {
        const willShow = !selectedGroups.includes('other');
        
        if (willShow) {
          newSelection = [...selectedGroups, 'other'];
          setShowOtherInput(true);
        } else {
          // Removing other: remove from selection & clear text
          newSelection = selectedGroups.filter((g: string) => g !== 'other');
          setShowOtherInput(false);
          setLocalOtherText('');
          onFormChange({ customGroupText: '' });
        }
      } else {
        newSelection = selectedGroups.includes(groupId)
          ? selectedGroups.filter((g: string) => g !== groupId)
          : [...selectedGroups, groupId];
      }

      onFormChange({ selectedGroups: newSelection });
    },
    [selectedGroups, onFormChange]
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setLocalOtherText(text);
      onFormChange({ customGroupText: text });
    },
    [onFormChange]
  );

  const isValid = validateTravelGroups(formData);

  const hasValidationError = validationErrors.length > 0;

  return (
    <div className={`bg-form-box rounded-[36px] p-6 border-3 ${hasValidationError ? 'border-red-500' : 'border-gray-200'}`}>
      <div className="mb-4">
        <h3 className="text-[25px] font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          TRAVEL GROUP
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">Select all that apply</p>
      </div>

      {/* Updated Grid Layout: 4 columns, 2 rows */}
      <div className="grid grid-cols-4 gap-3">
        {TRAVEL_GROUPS.map((option) => {
          const isSelected = selectedGroups.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggleGroup(option.id)}
              className={`
                h-20 p-3 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-1
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-label={option.id === 'extended' ? 'Select Family with Relatives group' : `Select ${option.label.replace('\n', ' ')} group`}
              aria-pressed={isSelected}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span
                className={`text-base font-bold text-center leading-tight font-raleway whitespace-pre-line ${
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
            Tell us more about your travel group
          </label>
          <textarea
            value={localOtherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Specify your travel group"
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold"
            rows={3}
            aria-label="Specify custom travel group"
          />
        </div>
      )}
    </div>
  );
};

export default TravelGroupSelector;