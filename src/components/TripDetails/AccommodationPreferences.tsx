import React, { useState } from 'react';
import { BaseFormProps } from './types';

const AccommodationPreferences: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const accommodationTypes = [
    'Hotel', 'Resort', 'Vacation Rental', 'Other'
  ];

  const additionalAccommodationTypes = [
    'Boutique Hotel', 'Bed & Breakfast', 'Hostel', 'Eco-Lodge'
  ];

  // Use a simple string array stored in the form data
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleAccommodationChange = (type: string) => {
    let updatedTypes;
    
    if (type === 'Other') {
      if (selectedTypes.includes(type)) {
        updatedTypes = selectedTypes.filter(t => t !== type);
        setSelectedTypes(updatedTypes);
        setShowOtherInput(false);
        onFormChange({ accommodationOther: '' });
      } else {
        updatedTypes = [...selectedTypes, type];
        setSelectedTypes(updatedTypes);
        setShowOtherInput(true);
      }
    } else {
      updatedTypes = selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type)
        : [...selectedTypes, type];
      setSelectedTypes(updatedTypes);
    }
  };

  return (
    <div className="bg-form-box rounded-[36px] border-3 border-primary overflow-hidden">
      <div className="bg-primary px-6 py-4">
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          ACCOMMODATION PREFERENCES
        </h3>
      </div>
      
      <div className="p-6">
      {/* Accommodation Types - 2x2 Layout */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {accommodationTypes.map((type) => (
          <label key={type} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={() => handleAccommodationChange(type)}
              className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
            />
            <span className="text-primary font-bold font-raleway text-base">{type}</span>
          </label>
        ))}
      </div>

      {/* Additional Accommodation Types */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-primary uppercase mb-3 font-raleway">
          More Options
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {additionalAccommodationTypes.map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleAccommodationChange(type)}
                className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
              />
              <span className="text-primary font-bold font-raleway text-base">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Other accommodation input */}
      {showOtherInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Tell us more about your preferred accommodations"
            value={formData.accommodationOther || ''}
            onChange={(e) => onFormChange({ accommodationOther: e.target.value })}
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] bg-[#ece8de] text-primary font-bold placeholder-primary/50 focus:ring-2 focus:ring-primary font-raleway"
          />
        </div>
      )}

      {/* Amenities section */}
      <div className="mt-6">
        <h4 className="text-lg font-bold text-primary uppercase mb-3 font-raleway">
          Important Amenities
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {['WiFi', 'Pool', 'Gym', 'Kitchen', 'Parking', 'Pet-Friendly'].map((amenity) => (
            <label key={amenity} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={(e) => {
                  const updatedAmenities = e.target.checked
                    ? [...selectedAmenities, amenity]
                    : selectedAmenities.filter((a: string) => a !== amenity);
                  setSelectedAmenities(updatedAmenities);
                }}
                className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
              />
              <span className="text-primary font-bold font-raleway text-base">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AccommodationPreferences;
