/**
 * Hook for location autocomplete using OpenStreetMap Nominatim
 * No API key required - completely free!
 */

import { useEffect, useState } from 'react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export function useLocationAutocomplete(inputRef: React.RefObject<HTMLInputElement>) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    let debounceTimer: NodeJS.Timeout;

    const handleInput = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const query = target.value;

      // Clear previous timer
      clearTimeout(debounceTimer);

      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Debounce the API call
      debounceTimer = setTimeout(async () => {
        setIsLoading(true);
        try {
          // Use OpenStreetMap Nominatim API for geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}` +
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
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
          }
        } catch (error) {
          console.error('Failed to fetch location suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce
    };

    const handleFocus = () => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    };

    const handleBlur = () => {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => setShowSuggestions(false), 200);
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    return () => {
      clearTimeout(debounceTimer);
      input.removeEventListener('input', handleInput);
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, [inputRef]);

  const selectSuggestion = (suggestion: NominatimResult) => {
    if (inputRef.current) {
      // Trigger a custom event with place details
      const event = new CustomEvent('placeSelected', {
        detail: {
          description: suggestion.display_name,
          placeId: suggestion.place_id,
          lat: parseFloat(suggestion.lat),
          lng: parseFloat(suggestion.lon),
        },
      });
      inputRef.current.dispatchEvent(event);
      setShowSuggestions(false);
    }
  };

  return { suggestions, showSuggestions, isLoading, selectSuggestion };
}
