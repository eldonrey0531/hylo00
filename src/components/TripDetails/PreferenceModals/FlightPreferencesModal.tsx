import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FlightPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: any;
  onSave: (preferences: any) => void;
}

const FlightPreferencesModal: React.FC<FlightPreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences = {},
  onSave,
}) => {
  const [departureAirports, setDepartureAirports] = useState(preferences.departureAirports || '');
  const [cabinClass, setCabinClass] = useState(preferences.cabinClass || '');
  const [flightPreferences, setFlightPreferences] = useState(preferences.flightPreferences || '');

  useEffect(() => {
    if (isOpen) {
      setDepartureAirports(preferences.departureAirports || '');
      setCabinClass(preferences.cabinClass || '');
      setFlightPreferences(preferences.flightPreferences || '');
    }
  }, [isOpen, preferences]);

  const handleSave = () => {
    onSave({
      departureAirports,
      cabinClass,
      flightPreferences,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[36px] p-6 border-3 border-primary max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✈️</span>
            <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
              Flight Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t-2 border-primary/20">
          <button
            onClick={onClose}
            className="px-6 py-3 border-3 border-primary text-primary rounded-[10px] font-bold font-raleway hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-white rounded-[10px] font-bold font-raleway hover:bg-primary-dark transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightPreferencesModal;