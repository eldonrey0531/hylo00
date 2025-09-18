import React, { useState, useEffect } from 'react';

interface FlightPreferencesProps {
  preferences: any;
  onSave: (preferences: any) => void;
}

const FlightPreferences: React.FC<FlightPreferencesProps> = ({
  preferences = {},
  onSave,
}) => {
  const [departureAirports, setDepartureAirports] = useState(preferences.departureAirports || '');
  const [cabinClass, setCabinClass] = useState(preferences.cabinClass || '');
  const [flightPreferences, setFlightPreferences] = useState(preferences.flightPreferences || '');

  useEffect(() => {
    setDepartureAirports(preferences.departureAirports || '');
    setCabinClass(preferences.cabinClass || '');
    setFlightPreferences(preferences.flightPreferences || '');
  }, [preferences]);

  const handleSave = () => {
    onSave({
      departureAirports,
      cabinClass,
      flightPreferences,
    });
  };

  // Auto-save when any field changes
  useEffect(() => {
    handleSave();
  }, [departureAirports, cabinClass, flightPreferences]);

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200 mt-4">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">✈️</span>
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
          Flight Preferences
        </h3>
      </div>

      <div className="space-y-6">
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
            (Optional) Preferred cabin class
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'economy', label: 'Economy $' },
              { value: 'premium-economy', label: 'Premium Economy $$' },
              { value: 'business', label: 'Business $$$' },
              { value: 'first', label: 'First $$$$' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setCabinClass(option.value)}
                className={`p-3 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-sm ${
                  cabinClass === option.value
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