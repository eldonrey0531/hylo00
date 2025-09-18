import React from 'react';
import { BaseFormProps } from './types';

const AccommodationPreferences: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const accommodationTypes = [
    'Hotel', 'Resort', 'Boutique Hotel', 'Bed & Breakfast',
    'Vacation Rental', 'Hostel', 'Eco-Lodge', 'Other'
  ];

  const handleAccommodationChange = (type: string) => {
    const currentTypes = formData.accommodationTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFormChange({ accommodationTypes: updatedTypes });
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="-mx-6 -mt-6 mb-6 bg-primary px-6 py-4 rounded-t-[33px]">
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          ACCOMMODATION PREFERENCES
        </h3>
      </div>
      
      {/* Accommodation Types - 2 rows of 4 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {accommodationTypes.map((type) => (
          <label key={type} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(formData.accommodationTypes || []).includes(type)}
              onChange={() => handleAccommodationChange(type)}
              className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
            />
            <span className="text-primary font-bold font-raleway text-base">{type}</span>
          </label>
        ))}
      </div>

      {/* Other accommodation details */}
      {(formData.accommodationTypes || []).includes('Other') && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Tell us more about your preferred accommodations"
            value={formData.otherAccommodation || ''}
            onChange={(e) => onFormChange({ otherAccommodation: e.target.value })}
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
                checked={(formData.amenities || []).includes(amenity)}
                onChange={(e) => {
                  const currentAmenities = formData.amenities || [];
                  const updatedAmenities = e.target.checked
                    ? [...currentAmenities, amenity]
                    : currentAmenities.filter(a => a !== amenity);
                  onFormChange({ amenities: updatedAmenities });
                }}
                className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
              />
              <span className="text-primary font-bold font-raleway text-base">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccommodationPreferences;
