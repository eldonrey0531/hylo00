import React, { useState, useEffect } from 'react';

interface AccommodationPreferencesProps {
  preferences: any;
  onSave: (preferences: any) => void;
}

const AccommodationPreferences: React.FC<AccommodationPreferencesProps> = ({
  preferences = {},
  onSave,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(preferences.selectedTypes || []);
  const [otherType, setOtherType] = useState(preferences.otherType || '');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [specialRequests, setSpecialRequests] = useState(preferences.specialRequests || '');

  const accommodationTypes = [
    'Traditional hotel',
    'Boutique hotel',
    'AirBnB/Rental',
    'Resort',
    'All-inclusive',
    'Budget hotel or hostel',
    'Quirky or unique local stay',
    'Camping or glamping',
  ];

  useEffect(() => {
    setSelectedTypes(preferences.selectedTypes || []);
    setOtherType(preferences.otherType || '');
    setSpecialRequests(preferences.specialRequests || '');
  }, [preferences]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = () => {
    onSave({
      selectedTypes,
      otherType,
      specialRequests,
    });
  };

  // Auto-save when any field changes
  useEffect(() => {
    handleSave();
  }, [selectedTypes, otherType, specialRequests]);

  return (
    <div className="w-full bg-[#b0c29b] rounded-[36px] py-6 border-3 border-gray-200">
      <div className="w-full flex items-center space-x-3 bg-[#406170] px-6 py-4 rounded-b-[20px]">
        <span className="text-2xl">🏨</span>
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          Accommodation Preferences
        </h3>
      </div>

      <div className="space-y-6 px-6 bg-[#b0c29b]">
        {/* Accommodation Types */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            Preferred accommodation type(s)
          </label>
          <p className="text-primary font-bold font-raleway text-xs mb-4">Select all that apply</p>
          <div className="grid grid-cols-2 gap-2">
            {accommodationTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-2 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-sm text-left flex items-center ${
                  selectedTypes.includes(type)
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary bg-[#ece8de] text-primary hover:bg-primary/10'
                }`}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => {
                setShowOtherInput(!showOtherInput);
                if (!showOtherInput) {
                  setOtherType(''); // Start with empty input
                }
              }}
              className={`px-3 py-2 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-sm text-left flex items-center ${
                showOtherInput
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary bg-[#ece8de] text-primary hover:bg-primary/10'
              }`}
            >
              ✨ Other
            </button>
          </div>
          {showOtherInput && (
            <input
              type="text"
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
              placeholder="Tell us more about your preferred accommodations"
              className="mt-3 w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] font-raleway font-bold"
            />
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            (Optional) Special accommodation requests or preferred hotel brands
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Example: We want 2 separate rooms, We prefer Hyatt or Marriott hotels"
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default AccommodationPreferences;