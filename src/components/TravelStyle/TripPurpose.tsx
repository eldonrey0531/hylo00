// src/components/TravelStyle/TripPurpose.tsx
import React, { useCallback } from 'react';
import { BaseStyleFormProps, TRIP_PURPOSES } from './types';

const TripPurpose: React.FC<BaseStyleFormProps> = ({ styleData, onStyleChange }) => {
  const selectedPurposes = styleData.tripPurpose || [];

  const handleToggle = useCallback(
    (purposeId: string) => {
      const updated = selectedPurposes.includes(purposeId)
        ? selectedPurposes.filter((id) => id !== purposeId)
        : [...selectedPurposes, purposeId];

      onStyleChange({ tripPurpose: updated });
    },
    [selectedPurposes, onStyleChange]
  );

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Trip Purpose
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          What's the main purpose of your trip? (Optional - Select any that apply)
        </p>
        {selectedPurposes.length > 0 && (
          <p className="text-green-600 font-bold font-raleway text-xs mt-1">
            {selectedPurposes.length} purpose{selectedPurposes.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TRIP_PURPOSES.map((option) => {
          const isSelected = selectedPurposes.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`
                h-20 p-2 rounded-[10px] border-3 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-1 text-center
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
              aria-pressed={isSelected}
            >
              <span className="text-lg">{option.emoji}</span>
              <span
                className={`text-xs font-bold leading-tight font-raleway ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {option.label}
              </span>
              {isSelected && <span className="text-white text-xs">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TripPurpose;
