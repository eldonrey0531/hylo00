// src/components/TripDetails/ItineraryInclusions.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { BaseFormProps, ITINERARY_INCLUSIONS } from './types';
import FlightPreferencesModal from './PreferenceModals/FlightPreferencesModal';
import AccommodationPreferencesModal from './PreferenceModals/AccommodationPreferencesModal';
import RentalCarPreferencesModal from './PreferenceModals/RentalCarPreferencesModal';
import SimplePreferenceModal from './PreferenceModals/SimplePreferenceModal';

const ItineraryInclusions: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.customInclusionsText || '');
  const [activeModal, setActiveModal] = useState<string | null>(null);

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

  return (
    <>
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
              placeholder="Describe any other inclusions or special requirements..."
              className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
              rows={3}
              aria-label="Describe other inclusions"
            />
          </div>
        )}
      </div>

      {/* External Preference Sections - Outside the main form */}
      {selectedInclusions.filter((id) => id !== 'other').length > 0 && (
        <div className="space-y-4">
          {selectedInclusions
            .filter((id) => id !== 'other')
            .map((inclusionId) => {
              const inclusion = ITINERARY_INCLUSIONS.find((i) => i.id === inclusionId);
              if (!inclusion) return null;

              const hasPreferences = inclusionPreferences[inclusionId];

              return (
                <div
                  key={inclusionId}
                  className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{inclusion.emoji}</span>
                      <h4 className="text-lg font-bold text-primary uppercase tracking-wide font-raleway">
                        {inclusion.label} Preferences
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveModal(inclusionId)}
                      className={`px-4 py-2 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-sm ${
                        hasPreferences
                          ? 'border-primary bg-primary text-white'
                          : 'border-primary bg-[#ece8de] text-primary hover:bg-primary/10'
                      }`}
                    >
                      {hasPreferences ? 'Edit Preferences' : 'Set Preferences'}
                    </button>
                  </div>
                  
                  {hasPreferences && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-[10px] border border-primary/20">
                      <p className="text-primary font-raleway text-sm">
                        ✓ Preferences configured
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Modals */}
      <FlightPreferencesModal
        isOpen={activeModal === 'flights'}
        onClose={() => setActiveModal(null)}
        preferences={inclusionPreferences['flights'] || {}}
        onSave={(preferences) => handlePreferencesSave('flights', preferences)}
      />

      <AccommodationPreferencesModal
        isOpen={activeModal === 'accommodations'}
        onClose={() => setActiveModal(null)}
        preferences={inclusionPreferences['accommodations'] || {}}
        onSave={(preferences) => handlePreferencesSave('accommodations', preferences)}
      />

      <RentalCarPreferencesModal
        isOpen={activeModal === 'rental-car'}
        onClose={() => setActiveModal(null)}
        preferences={inclusionPreferences['rental-car'] || {}}
        onSave={(preferences) => handlePreferencesSave('rental-car', preferences)}
      />

      {/* Simple text modals for other categories */}
      <SimplePreferenceModal
        isOpen={activeModal === 'activities'}
        onClose={() => setActiveModal(null)}
        title="Activities & Tours Preferences"
        emoji="🛶"
        placeholder="Example: I love history and culture, I want to bar hop in Barcelona"
        preferences={inclusionPreferences['activities'] || ''}
        onSave={(preferences) => handlePreferencesSave('activities', preferences)}
      />

      <SimplePreferenceModal
        isOpen={activeModal === 'dining'}
        onClose={() => setActiveModal(null)}
        title="Dining Preferences"
        emoji="🍽️"
        placeholder="Example: We love street food, we want fine dining for dinner every night"
        preferences={inclusionPreferences['dining'] || ''}
        onSave={(preferences) => handlePreferencesSave('dining', preferences)}
      />

      <SimplePreferenceModal
        isOpen={activeModal === 'entertainment'}
        onClose={() => setActiveModal(null)}
        title="Entertainment Preferences"
        emoji="🪇"
        placeholder="Example: We love live music, I want to attend a local cultural festival"
        preferences={inclusionPreferences['entertainment'] || ''}
        onSave={(preferences) => handlePreferencesSave('entertainment', preferences)}
      />

      <SimplePreferenceModal
        isOpen={activeModal === 'nature'}
        onClose={() => setActiveModal(null)}
        title="Nature Preferences"
        emoji="🌲"
        placeholder="Example: We love hiking and biking, my kids love to swim"
        preferences={inclusionPreferences['nature'] || ''}
        onSave={(preferences) => handlePreferencesSave('nature', preferences)}
      />

      <SimplePreferenceModal
        isOpen={activeModal === 'train'}
        onClose={() => setActiveModal(null)}
        title="Train Tickets Preferences"
        emoji="🚆"
        placeholder="Example: We want to take a bullet train between Tokyo and Kyoto, I want to experience a sleeper train"
        preferences={inclusionPreferences['train'] || ''}
        onSave={(preferences) => handlePreferencesSave('train', preferences)}
      />

      <SimplePreferenceModal
        isOpen={activeModal === 'cruise'}
        onClose={() => setActiveModal(null)}
        title="Cruise Preferences"
        emoji="🛳️"
        placeholder="Example: Royal Caribbean departing from Florida, Balcony Suite"
        preferences={inclusionPreferences['cruise'] || ''}
        onSave={(preferences) => handlePreferencesSave('cruise', preferences)}
      />
    </>
  );
};

export default ItineraryInclusions;