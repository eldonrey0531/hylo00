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
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200 mt-4">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">🏨</span>
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
          Accommodation Preferences
        </h3>
      </div>

      <div className="space-y-6">
        {/* Accommodation Types */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            Preferred accommodation type(s)
          </label>
          <p className="text-primary font-bold font-raleway text-xs mb-4">Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {accommodationTypes.map((type) => (
              <label
                key={type}
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-[10px] border-2 border-gray-200 hover:border-primary transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="w-5 h-5 text-primary border-3 border-primary rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-primary font-raleway font-bold text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Other Type */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-[10px] border-2 border-gray-200 hover:border-primary transition-colors">
            <input
              type="checkbox"
              checked={otherType !== ''}
              onChange={(e) => {
                if (!e.target.checked) {
                  setOtherType('');
                }
              }}
              className="w-5 h-5 text-primary border-3 border-primary rounded focus:ring-2 focus:ring-primary"
            />
            <span className="text-primary font-raleway font-bold text-sm flex items-center">
              <span className="text-xl mr-2">✨</span>
              Other
            </span>
          </label>
          {otherType !== '' && (
            <input
              type="text"
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
              placeholder="Specify other accommodation type..."
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