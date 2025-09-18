import React, { useState } from 'react';
import { BaseFormProps } from './types';

const RentalCarPreferences: React.FC<BaseFormProps> = ({ formData, onFormChange: _onFormChange }) => {
  // Using local state for now, can be integrated with form data later
  console.log('Form data:', formData); // Prevent unused parameter warning
  
  const carTypes = [
    'Economy', 'Compact', 'SUV', 'Luxury'
  ];

  const additionalCarTypes = [
    'Midsize', 'Full-size', 'Convertible', 'Van/Minivan'
  ];

  const [selectedCarTypes, setSelectedCarTypes] = useState<string[]>([]);
  const [selectedCarOptions, setSelectedCarOptions] = useState<string[]>([]);

  const handleCarTypeChange = (type: string) => {
    const updatedTypes = selectedCarTypes.includes(type)
      ? selectedCarTypes.filter((t: string) => t !== type)
      : [...selectedCarTypes, type];
    
    setSelectedCarTypes(updatedTypes);
  };

  return (
    <div className="bg-form-box rounded-[36px] border-3 border-primary overflow-hidden">
      <div className="bg-primary px-6 py-4">
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          RENTAL CAR PREFERENCES
        </h3>
      </div>
      
      <div className="p-6">
      {/* Car Types - 2x2 Layout */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {carTypes.map((type) => (
          <label key={type} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCarTypes.includes(type)}
              onChange={() => handleCarTypeChange(type)}
              className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
            />
            <span className="text-primary font-bold font-raleway text-base">{type}</span>
          </label>
        ))}
      </div>

      {/* Additional Car Types */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-primary uppercase mb-3 font-raleway">
          More Vehicle Types
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {additionalCarTypes.map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCarTypes.includes(type)}
                onChange={() => handleCarTypeChange(type)}
                className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
              />
              <span className="text-primary font-bold font-raleway text-base">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="mt-6">
        <h4 className="text-lg font-bold text-primary uppercase mb-3 font-raleway">
          Additional Options
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {['GPS Navigation', 'Child Seat', 'Insurance', 'Automatic Transmission'].map((option) => (
            <label key={option} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCarOptions.includes(option)}
                onChange={(e) => {
                  const updatedOptions = e.target.checked
                    ? [...selectedCarOptions, option]
                    : selectedCarOptions.filter((o: string) => o !== option);
                  setSelectedCarOptions(updatedOptions);
                }}
                className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
              />
              <span className="text-primary font-bold font-raleway text-base">{option}</span>
            </label>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default RentalCarPreferences;
