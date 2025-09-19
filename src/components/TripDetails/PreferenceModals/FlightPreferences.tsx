import React, { useState, useEffect, useCallback } from 'react';

interface FlightPreferencesProps {
  preferences: any;
  onSave: (preferences: any) => void;
}

const FlightPreferences: React.FC<FlightPreferencesProps> = ({
  preferences = {},
  onSave,
}) => {
  const [departureAirports, setDepartureAirports] = useState(preferences.departureAirports || '');
  const [cabinClasses, setCabinClasses] = useState<string[]>(preferences.cabinClasses || []);
  const [flightPreferences, setFlightPreferences] = useState(preferences.flightPreferences || '');

  useEffect(() => {
    setDepartureAirports(preferences.departureAirports || '');
    setCabinClasses(preferences.cabinClasses || []);
    setFlightPreferences(preferences.flightPreferences || '');
  }, [preferences]);

  const toggleCabinClass = (classValue: string) => {
    setCabinClasses((prev) =>
      prev.includes(classValue) ? prev.filter((c) => c !== classValue) : [...prev, classValue]
    );
  };

  const handleSave = useCallback(() => {
    onSave({
      departureAirports,
      cabinClasses,
      flightPreferences,
    });
  }, [departureAirports, cabinClasses, flightPreferences, onSave]);

  // Auto-save when any field changes
  useEffect(() => {
    handleSave();
  }, [handleSave]);

  return (
    <div className="w-full bg-[#b0c29b] rounded-[36px] py-6">
      <div className="w-full flex items-center space-x-3 bg-[#406170] px-6 py-4">
        <span className="text-2xl">✈️</span>
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          Flight Preferences
        </h3>
      </div>

      <div className="space-y-6 px-6 bg-[#b0c29b] rounded-b-[36px] pt-2">
        {/* Departure Airports */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            Traveler departure airport(s)
          </label>
          <input
            type="text"
            value={departureAirports}
            onChange={(e) => setDepartureAirports(e.target.value)}
            placeholder="Example: SFO, London area airports"
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] font-raleway font-bold"
          />
        </div>

        {/* Cabin Class */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            (Optional) Preferred cabin class (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'economy', label: 'Economy $' },
              { value: 'premium-economy', label: 'Premium Economy $$' },
              { value: 'business', label: 'Business $$$' },
              { value: 'first', label: 'First $$$$' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => toggleCabinClass(option.value)}
                className={`px-3 py-2 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-sm text-left flex items-center ${
                  cabinClasses.includes(option.value)
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary bg-[#ece8de] text-primary hover:bg-primary/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flight Preferences */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            (Optional) Flight or airline preferences
          </label>
          <textarea
            value={flightPreferences}
            onChange={(e) => setFlightPreferences(e.target.value)}
            placeholder="Example: I prefer Delta or United, 1 layover or less"
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default FlightPreferences;