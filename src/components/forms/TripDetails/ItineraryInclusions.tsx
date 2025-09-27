// src/components/TripDetails/ItineraryInclusions.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ItineraryInclusionsProps, ITINERARY_INCLUSIONS, validateItineraryInclusions } from './types';
import FlightPreferences from './PreferenceModals/FlightPreferences';
import AccommodationPreferences from './PreferenceModals/AccommodationPreferences';
import RentalCarPreferences from './PreferenceModals/RentalCarPreferences';
import SimplePreferences from './PreferenceModals/SimplePreferences';

const ItineraryInclusions: React.FC<ItineraryInclusionsProps> = ({ formData, onFormChange, validationErrors = {} }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.customInclusionsText || '');

  // Extract inclusion selections from formData
  const selectedInclusions = formData.selectedInclusions || [];
  const inclusionPreferences = formData.inclusionPreferences || {};

  // Derive visibility: show when 'other' is selected
  const showOtherInput = selectedInclusions.includes('other');

  useEffect(() => {
    setLocalOtherText(formData.customInclusionsText || '');
  }, [formData.customInclusionsText]);

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

  const handlePreferencesSave = useCallback(
    (inclusionId: string, preferences: any) => {
      const newPreferences = {
        ...inclusionPreferences,
        [inclusionId]: preferences,
      };
      onFormChange({ inclusionPreferences: newPreferences });
    },
    [inclusionPreferences, onFormChange]
  );

  const isValid = validateItineraryInclusions(formData);

  const hasValidationError = Object.keys(validationErrors).length > 0;

  return (
    <>
      <div className={`bg-form-box rounded-[36px] p-6 border-3 ${hasValidationError ? 'border-red-500' : 'border-gray-200'}`}>
        <div className="mb-4">
          <h3 className="text-[25px] font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            What Should We Include in Your Itinerary?
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

        {/* Other Input Field - Only this stays inside */}
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
              placeholder="Specify what else you'd like included in your itinerary..."
              className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
              rows={3}
              aria-label="Describe other inclusions"
            />
          </div>
        )}
      </div>

      {/* Inline Preference Forms - Outside the main form */}
      {selectedInclusions
        .filter((id) => id !== 'other')
        .map((inclusionId) => {
          switch (inclusionId) {
            case 'flights':
              return (
                <FlightPreferences
                  key={inclusionId}
                  preferences={inclusionPreferences[inclusionId] || {}}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-flights']}
                />
              );
            case 'accommodations':
              return (
                <AccommodationPreferences
                  key={inclusionId}
                  preferences={inclusionPreferences[inclusionId] || {}}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-accommodations']}
                />
              );
            case 'rental-car':
              return (
                <RentalCarPreferences
                  key={inclusionId}
                  preferences={inclusionPreferences[inclusionId] || {}}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-rental-car']}
                />
              );
            case 'activities':
              return (
                <SimplePreferences
                  key={inclusionId}
                  title="Activities & Tours Preferences"
                  emoji="🛶"
                  placeholder="Example: I love history and culture, I want to bar hop in Barcelona"
                  preferences={inclusionPreferences[inclusionId] || ''}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-activities']}
                />
              );
            case 'dining':
              return (
                <SimplePreferences
                  key={inclusionId}
                  title="Dining Preferences"
                  emoji="🍽️"
                  placeholder="Example: We love street food, we want fine dining for dinner every night"
                  preferences={inclusionPreferences[inclusionId] || ''}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-dining']}
                />
              );
            case 'entertainment':
              return (
                <SimplePreferences
                  key={inclusionId}
                  title="Entertainment Preferences"
                  emoji="🪇"
                  placeholder="Example: We love live music, I want to attend a local cultural festival"
                  preferences={inclusionPreferences[inclusionId] || ''}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-entertainment']}
                />
              );
            case 'nature':
              return (
                <SimplePreferences
                  key={inclusionId}
                  title="Nature Preferences"
                  emoji="🌲"
                  placeholder="Example: We love hiking and biking, my kids love to swim"
                  preferences={inclusionPreferences[inclusionId] || ''}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-nature']}
                />
              );
            case 'train':
              return (
                <SimplePreferences
                  key={inclusionId}
                  title="Train Tickets Preferences"
                  emoji="🚆"
                  placeholder="Example: We want to take a bullet train between Tokyo and Kyoto, I want to experience a sleeper train"
                  preferences={inclusionPreferences[inclusionId] || ''}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-train']}
                />
              );
            case 'cruise':
              return (
                <SimplePreferences
                  key={inclusionId}
                  title="Cruise Preferences"
                  emoji="🛳️"
                  placeholder="Example: Royal Caribbean departing from Florida, Balcony Suite"
                  preferences={inclusionPreferences[inclusionId] || ''}
                  onSave={(preferences) => handlePreferencesSave(inclusionId, preferences)}
                  hasValidationError={!!validationErrors['inclusion-cruise']}
                />
              );
            default:
              return null;
          }
        })}
    </>
  );
};

export default ItineraryInclusions;