// src/components/TripDetails/ItineraryInclusions.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BaseFormProps, ITINERARY_INCLUSIONS } from './types';

const ItineraryInclusions: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.customInclusionsText || '');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Extract inclusion selections from formData
  const selectedInclusions = formData.selectedInclusions || [];
  const inclusionPreferences = formData.inclusionPreferences || {};

  // Derive visibility: show when 'other' is selected
  const showOtherInput = selectedInclusions.includes('other');

  useEffect(() => {
    setLocalOtherText(formData.customInclusionsText || '');
  }, [formData.customInclusionsText]);

  const toggleSection = useCallback((inclusionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(inclusionId) ? prev.filter((id) => id !== inclusionId) : [...prev, inclusionId]
    );
  }, []);

  const toggleInclusion = useCallback(
    (inclusionId: string) => {
      let newSelection: string[];

      if (inclusionId === 'other') {
        const willShow = !selectedInclusions.includes('other');

        if (willShow) {
          newSelection = [...selectedInclusions, 'other'];
        } else {
          // Removing other: remove from selection & clear text
          newSelection = selectedInclusions.filter((i) => i !== 'other');
          setLocalOtherText('');
          onFormChange({ customInclusionsText: '' });
        }
      } else {
        newSelection = selectedInclusions.includes(inclusionId)
          ? selectedInclusions.filter((i) => i !== inclusionId)
          : [...selectedInclusions, inclusionId];
      }

      onFormChange({ selectedInclusions: newSelection });
    },
    [selectedInclusions, onFormChange]
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setLocalOtherText(text);
      onFormChange({ customInclusionsText: text });
    },
    [onFormChange]
  );

  const handlePreferenceChange = useCallback(
    (inclusionId: string, preference: string) => {
      const newPreferences = {
        ...inclusionPreferences,
        [inclusionId]: preference,
      };
      onFormChange({ inclusionPreferences: newPreferences });
    },
    [inclusionPreferences, onFormChange]
  );

  const renderBasicPreferences = (inclusionId: string) => {
    const isExpanded = expandedSections.includes(inclusionId);
    const preference = inclusionPreferences[inclusionId] || '';
    const inclusionLabel =
      ITINERARY_INCLUSIONS.find((i) => i.id === inclusionId)?.label || inclusionId;

    return (
      <div key={inclusionId} className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-3">
        <button
          onClick={() => toggleSection(inclusionId)}
          className="w-full flex justify-between items-center text-primary font-bold font-raleway text-sm"
        >
          <span>{inclusionLabel} Preferences</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="mt-3">
            <textarea
              value={preference}
              onChange={(e) => handlePreferenceChange(inclusionId, e.target.value)}
              placeholder={`Any specific preferences for ${inclusionLabel.toLowerCase()}?`}
              className="w-full px-3 py-2 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none font-raleway font-bold text-sm"
              rows={2}
              aria-label={`${inclusionLabel} preferences`}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          ITINERARY INCLUSIONS
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What should be included in your itinerary?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ITINERARY_INCLUSIONS.map((option) => {
          const isSelected = selectedInclusions.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggleInclusion(option.id)}
              className={`
                h-24 p-3 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-2
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-label={`Toggle ${option.label} inclusion`}
              aria-pressed={isSelected}
            >
              <span className="text-xl">{option.emoji}</span>
              <span
                className={`text-xs font-bold text-center leading-tight font-raleway ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preferences for selected inclusions */}
      {selectedInclusions.filter((id) => id !== 'other').length > 0 && (
        <div className="mt-4 space-y-3">
          {selectedInclusions
            .filter((id) => id !== 'other')
            .map((inclusionId) => renderBasicPreferences(inclusionId))}
        </div>
      )}

      {/* Other Input Field */}
      {showOtherInput && (
        <div className="bg-primary/10 rounded-[10px] p-4 border-3 border-primary/20 mt-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">✨</span>
            <label className="block text-primary font-bold text-base font-raleway">Other</label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            What else should we include in your itinerary?
          </label>
          <textarea
            value={localOtherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Describe any other inclusions or special requirements..."
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
            aria-label="Describe other inclusions"
          />
        </div>
      )}
    </div>
  );
};

export default ItineraryInclusions;