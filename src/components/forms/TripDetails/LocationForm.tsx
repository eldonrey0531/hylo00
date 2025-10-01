// src/components/TripDetails/LocationForm.tsx
'use client';

import React, { useRef, useState, useCallback } from 'react';
import { BaseFormProps } from './types';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const LocationForm: React.FC<BaseFormProps> = ({ formData, onFormChange, validationErrors = [] }) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingRef = useRef(false);

  const handleLocationChange = useCallback((value: string, skipSearch = false) => {
    console.log('Updating location to:', value, 'skipSearch:', skipSearch);
    onFormChange({ location: value });

    // Skip search if this is from a selection
    if (skipSearch || isSelectingRef.current) {
      console.log('Skipping search - value selected from suggestions');
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce the API call
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(value)}` +
          `&format=json` +
          `&limit=5` +
          `&addressdetails=1` +
          `&accept-language=en`,
          {
            headers: {
              'User-Agent': 'Hylo Travel Itinerary App',
            },
          }
        );

        if (response.ok) {
          const results: NominatimResult[] = await response.json();
          console.log('Got suggestions:', results);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      } catch (error) {
        console.error('Failed to fetch location suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [onFormChange]);

  const selectSuggestion = useCallback((suggestion: NominatimResult) => {
    console.log('Selected suggestion:', suggestion.display_name);
    isSelectingRef.current = true;
    setSuggestions([]);
    setShowSuggestions(false);
    handleLocationChange(suggestion.display_name, true);
    // Reset the flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  }, [handleLocationChange]);

  const hasValidationError = validationErrors.length > 0;

  return (
    <div className={`bg-form-box rounded-[36px] p-6 border-3 ${hasValidationError ? 'border-red-500' : 'border-gray-200'} relative`}>
      <h3 className="text-[25px] font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        LOCATION(S)
      </h3>
      <div className="space-y-2 relative">
        <input
          type="text"
          placeholder='Example: "New York", "Thailand", "Spain and Portugal"'
          value={formData.location || ''}
          onChange={(e) => handleLocationChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          className="w-full px-4 py-3 border-3 rounded-[10px] focus:ring-2 focus:border-primary transition-all duration-200 bg-white placeholder-gray-500 font-bold font-raleway text-base border-primary focus:ring-primary text-primary"
          aria-label="Trip location"
          autoComplete="off"
        />
        
        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border-3 border-primary rounded-[10px] shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(suggestion);
                }}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 border-b border-gray-200 last:border-b-0 font-raleway text-sm text-primary"
              >
                <div className="flex items-start">
                  <span className="mr-2">📍</span>
                  <span>{suggestion.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          {isLoading && <span>🔍 Searching...</span>}
          {!isLoading && formData.location && formData.location.length >= 3 && (
            <span>✨ Powered by OpenStreetMap</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationForm;