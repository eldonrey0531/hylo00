/**
 * Enhanced TripVibe Component for TripDetails
 * Feature: T009 TripVibe Enhancement
 * 
 * Applies established TripDetails patterns to capture comprehensive trip vibe data
 * with specific choice names and Other option integration.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { BaseFormProps } from './types';

// Trip vibe options with specific IDs and labels for comprehensive data capture
const TRIP_VIBES = [
  { id: 'adventure', label: 'Adventure seeking', emoji: '🏔️' },
  { id: 'relaxation', label: 'Relaxation focused', emoji: '🧘' },
  { id: 'cultural', label: 'Cultural immersion', emoji: '🏛️' },
  { id: 'romantic', label: 'Romantic getaway', emoji: '💕' },
  { id: 'family-fun', label: 'Family fun', emoji: '👨‍👩‍👧‍👦' },
  { id: 'friends-celebration', label: 'Friends celebration', emoji: '🎉' },
  { id: 'solo-discovery', label: 'Solo discovery', emoji: '🎒' },
  { id: 'wellness', label: 'Wellness retreat', emoji: '🌿' },
  { id: 'foodie', label: 'Foodie exploration', emoji: '🍜' },
  { id: 'nature', label: 'Nature connection', emoji: '🌲' },
  { id: 'urban', label: 'Urban exploration', emoji: '🏙️' },
  { id: 'historical', label: 'Historical journey', emoji: '🏰' },
  { id: 'artistic', label: 'Artistic inspiration', emoji: '🎨' },
  { id: 'spiritual', label: 'Spiritual journey', emoji: '🕉️' },
  { id: 'luxury', label: 'Luxury indulgence', emoji: '💎' },
  { id: 'budget-conscious', label: 'Budget conscious', emoji: '💰' },
  { id: 'off-beaten-path', label: 'Off the beaten path', emoji: '🗺️' },
  { id: 'photography', label: 'Photography focused', emoji: '📸' },
  { id: 'other', label: 'Other', emoji: '✨' }
];

const TripVibe: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localOtherText, setLocalOtherText] = useState(formData.otherTripVibeText || '');

  // Extract trip vibe selections from formData
  const selectedVibes = formData.selectedTripVibes || [];

  // Derive visibility: show when 'other' is selected
  const showOtherInput = selectedVibes.includes('other');

  useEffect(() => {
    setLocalOtherText(formData.otherTripVibeText || '');
  }, [formData.otherTripVibeText]);

  const handleVibeSelection = useCallback(
    (vibeId: string) => {
      let newSelection: string[];

      if (vibeId === 'other') {
        const willShow = !selectedVibes.includes('other');

        if (willShow) {
          newSelection = [...selectedVibes, 'other'];
        } else {
          // Removing other: remove from selection & clear text
          newSelection = selectedVibes.filter((v) => v !== 'other');
          setLocalOtherText('');
          onFormChange({ otherTripVibeText: '' });
        }
      } else {
        newSelection = selectedVibes.includes(vibeId)
          ? selectedVibes.filter((v) => v !== vibeId)
          : [...selectedVibes, vibeId];
      }

      onFormChange({ selectedTripVibes: newSelection });
    },
    [selectedVibes, onFormChange]
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setLocalOtherText(text);
      onFormChange({ otherTripVibeText: text });
    },
    [onFormChange]
  );

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Trip Vibe
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What vibe are you looking for on this trip?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {TRIP_VIBES.map((vibe) => {
          const isSelected = selectedVibes.includes(vibe.id);

          return (
            <button
              key={vibe.id}
              onClick={() => handleVibeSelection(vibe.id)}
              aria-label={`Toggle ${vibe.label} vibe`}
              aria-pressed={isSelected}
              className={`
                h-20 p-3 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-3
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
            >
              <span className="text-xl">{vibe.emoji}</span>
              <span
                className={`font-bold text-left leading-tight font-raleway text-sm ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {vibe.label}
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
            <label className="block text-primary font-bold text-base font-raleway">Other Trip Vibe</label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            Describe the specific vibe you're looking for
          </label>
          <textarea
            value={localOtherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Describe your ideal trip vibe or atmosphere..."
            maxLength={150}
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
            aria-label="Describe other trip vibe"
          />
        </div>
      )}
    </div>
  );
};

export default TripVibe;