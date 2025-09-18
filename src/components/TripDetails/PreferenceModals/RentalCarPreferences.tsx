import React, { useState, useEffect } from 'react';

interface RentalCarPreferencesProps {
  preferences: any;
  onSave: (preferences: any) => void;
}

const RentalCarPreferences: React.FC<RentalCarPreferencesProps> = ({
  preferences = {},
  onSave,
}) => {
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(preferences.vehicleTypes || []);
  const [specialRequirements, setSpecialRequirements] = useState(preferences.specialRequirements || '');

  const vehicleTypeOptions = [
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
    setVehicleTypes(preferences.vehicleTypes || []);
    setSpecialRequirements(preferences.specialRequirements || '');
  }, [preferences]);

  const toggleVehicleType = (type: string) => {
    setVehicleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = () => {
    onSave({
      vehicleTypes,
      specialRequirements,
    });
  };

  // Auto-save when any field changes
  useEffect(() => {
    handleSave();
  }, [vehicleTypes, specialRequirements]);

  return (
    <div className="rounded-[36px] p-6 border-3 border-gray-200 mt-4" style={{ backgroundColor: '#b0c29b' }}>
      <div className="flex items-center space-x-3 mb-6 bg-[#406170] rounded-[20px] px-4 py-3">
        <span className="text-3xl">🚗</span>
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          Rental Car Preferences
        </h3>
      </div>

      <div className="space-y-6">
        {/* Vehicle Type */}
        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            Preferred vehicle type(s) (select all that apply)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {vehicleTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => toggleVehicleType(type)}
                className={`px-3 py-2 rounded-[10px] border-3 transition-all duration-200 font-bold font-raleway text-xs ${
                  vehicleTypes.includes(type)
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