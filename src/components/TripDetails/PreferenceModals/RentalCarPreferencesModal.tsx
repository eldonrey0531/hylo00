import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RentalCarPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: any;
  onSave: (preferences: any) => void;
}

const RentalCarPreferencesModal: React.FC<RentalCarPreferencesModalProps> = ({
  isOpen,
  onClose,
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
    if (isOpen) {
      setVehicleType(preferences.vehicleType || '');
      setSpecialRequirements(preferences.specialRequirements || '');
    }
  }, [isOpen, preferences]);

  const handleSave = () => {
    onSave({
      vehicleType,
      specialRequirements,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[36px] p-6 border-3 border-primary max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🚗</span>
            <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
              Rental Car Preferences
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

export default RentalCarPreferencesModal;