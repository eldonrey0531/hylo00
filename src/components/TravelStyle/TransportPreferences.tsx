// src/components/TravelStyle/TransportPreferences.tsx
import React, { useCallback } from 'react';
import { BaseStyleFormProps, TRANSPORT_PREFERENCES } from './types';

const TransportPreferences: React.FC<BaseStyleFormProps> = ({ styleData, onStyleChange }) => {
  const selectedTransport = styleData.transportPreferences || [];

  const handleToggle = useCallback(
    (transportId: string) => {
      const updated = selectedTransport.includes(transportId)
        ? selectedTransport.filter((id) => id !== transportId)
        : [...selectedTransport, transportId];

      onStyleChange({ transportPreferences: updated });
    },
    [selectedTransport, onStyleChange]
  );

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          Transport Preferences
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          How do you prefer to get around? (Optional - Select any that interest you)
        </p>
        {selectedTransport.length > 0 && (
          <p className="text-green-600 font-bold font-raleway text-xs mt-1">
            {selectedTransport.length} transport type{selectedTransport.length !== 1 ? 's' : ''}{' '}
            selected
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TRANSPORT_PREFERENCES.map((option) => {
          const isSelected = selectedTransport.includes(option.id);

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

export default TransportPreferences;
