import React from 'react';
import { BaseFormProps } from './types';

const RentalCarPreferences: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const carTypes = [
    'Economy', 'Compact', 'Midsize', 'Full-size',
    'SUV', 'Luxury', 'Convertible', 'Van/Minivan'
  ];

  const handleCarTypeChange = (type: string) => {
    const currentTypes = formData.carTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFormChange({ carTypes: updatedTypes });
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="-mx-6 -mt-6 mb-6 bg-primary px-6 py-4 rounded-t-[33px]">
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          RENTAL CAR PREFERENCES
        </h3>
      </div>
      
      {/* Car Types - 2 rows of 4 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {carTypes.map((type) => (
          <label key={type} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(formData.carTypes || []).includes(type)}
              onChange={() => handleCarTypeChange(type)}
              className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
            />
            <span className="text-primary font-bold font-raleway text-base">{type}</span>
          </label>
        ))}
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
                checked={(formData.carOptions || []).includes(option)}
                onChange={(e) => {
                  const currentOptions = formData.carOptions || [];
                  const updatedOptions = e.target.checked
                    ? [...currentOptions, option]
                    : currentOptions.filter(o => o !== option);
                  onFormChange({ carOptions: updatedOptions });
                }}
                className="w-5 h-5 text-primary bg-gray-100 border-3 border-primary rounded-md focus:ring-primary focus:ring-2 mr-2"
              />
              <span className="text-primary font-bold font-raleway text-base">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentalCarPreferences;
