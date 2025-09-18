import React, { useState, useEffect } from 'react';

interface RentalCarPreferencesProps {
  preferences: any;
  onSave: (preferences: any) => void;
}

const RentalCarPreferences: React.FC<RentalCarPreferencesProps> = ({
  preferences = {},
  onSave,
}) => {
  const [vehicleType, setVehicleType] = useState(preferences.vehicleType || '');
  const [specialRequirements, setSpecialRequirements] = useState(preferences.specialRequirements || '');

  const vehicleTypes = [
    'Economy',
    'Compact',
    'Mid-size',
    'Full-size',
    'SUV',
    'Luxury',
    'Van/Minivan',
    'Convertible',
  ];

  useEffect(() => {
    setVehicleType(preferences.vehicleType || '');
    setSpecialRequirements(preferences.specialRequirements || '');
  }, [preferences]);

  const handleSave = () => {
    onSave({
      vehicleType,
      specialRequirements,
    });
  };

  // Auto-save when any field changes
  useEffect(() => {
    handleSave();
  }, [vehicleType, specialRequirements]);

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200 mt-4">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">🚗</span>
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
          Rental Car Preferences
        </h3>
      </div>

      <div className="space-y-6">
        {/* Vehicle Type */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            Preferred vehicle type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setVehicleType(type)}
                className={`p-3 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-sm ${
                  vehicleType === type
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary bg-[#ece8de] text-primary hover:bg-primary/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Special Requirements */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            (Optional) Special requirements or preferences
          </label>
          <textarea
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            placeholder="Example: We need seats for 6 people, We prefer Budget or Avis"
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default RentalCarPreferences;