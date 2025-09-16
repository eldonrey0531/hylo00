import React, { useState, useEffect } from 'react';
import { X, Plane, Hotel, Car, MapPin, Utensils } from 'lucide-react';

interface PreferencesModalProps {
  inclusionType: string;
  existingPreferences: any;
  onSave: (preferences: any) => void;
  onClose: () => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  inclusionType,
  existingPreferences,
  onSave,
  onClose,
}) => {
  const [preferences, setPreferences] = useState(existingPreferences || {});

  useEffect(() => {
    setPreferences(existingPreferences || {});
  }, [existingPreferences]);

  const handleSave = () => {
    onSave(preferences);
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const toggleArrayPreference = (key: string, value: string) => {
    const currentArray = preferences[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    updatePreference(key, newArray);
  };

  const getModalContent = () => {
    switch (inclusionType) {
      case 'flights':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary p-3 rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                Flight Preferences
              </h3>
            </div>

            {/* Departure Airport */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                Traveler departure airport(s)
              </label>
              <input
                type="text"
                placeholder="Seattle-Tacoma International Airport (SEA)"
                value={preferences.departureAirport || ''}
                onChange={(e) =>
                  updatePreference('departureAirport', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white"
              />
            </div>

            {/* Cabin Class */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                (Optional) Preferred cabin class
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  'Economy $',
                  'Premium Economy $$',
                  'Business $$$',
                  'First $$$$',
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => updatePreference('cabinClass', option)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      preferences.cabinClass === option
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-primary hover:border-primary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Flight Preferences */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                (Optional) Flight or airlines preferences
              </label>
              <textarea
                placeholder="We prefer a layover or less each way and like flying Delta or British Airways"
                value={preferences.flightPreferences || ''}
                onChange={(e) =>
                  updatePreference('flightPreferences', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 'accommodations':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary p-3 rounded-lg">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                Accommodation Preferences
              </h3>
            </div>

            {/* Accommodation Types */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                Preferred accommodation type(s)
              </label>
              <p className="text-sm text-primary mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Traditional hotel',
                  'Boutique hotel',
                  'AirBnB/Rental',
                  'Resort',
                  'All-inclusive',
                  'Budget hotel or hostel',
                  'Quirky or unique local stay',
                  'Camping or glamping',
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      toggleArrayPreference('accommodationTypes', option)
                    }
                    className={`px-4 py-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      (preferences.accommodationTypes || []).includes(option)
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-primary hover:border-primary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                (Optional) Special accommodation requests or preferred hotel
                brands
              </label>
              <textarea
                placeholder="If we stay in an AirBnb, we want at least 3 bedrooms"
                value={preferences.specialRequests || ''}
                onChange={(e) =>
                  updatePreference('specialRequests', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                Activities & Tours Preferences
              </h3>
            </div>

            {/* Activity Types */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                (Optional) Help us understand the types of activities and tours
                to include
              </label>
              <textarea
                placeholder="History and culture tours! But we don't like really large tours on big busses."
                value={preferences.activityPreferences || ''}
                onChange={(e) =>
                  updatePreference('activityPreferences', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
                rows={4}
              />
            </div>
          </div>
        );

      case 'nature':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary p-3 rounded-lg">
                <span className="text-2xl">🌲</span>
              </div>
              <h3 className="text-2xl font-bold text-primary">
                Nature Preferences
              </h3>
            </div>

            {/* Nature Preferences */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                (Optional) How do want to enjoy nature on your trip?
              </label>
              <textarea
                placeholder="We'll have our 4 year old, so nothing too crazy, but we love the outdoors and being active."
                value={preferences.naturePreferences || ''}
                onChange={(e) =>
                  updatePreference('naturePreferences', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
                rows={4}
              />
            </div>
          </div>
        );

      case 'rental-car':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary p-3 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                Rental Car Preferences
              </h3>
            </div>

            {/* Car Type */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                Preferred vehicle type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Economy',
                  'Compact',
                  'Mid-size',
                  'Full-size',
                  'SUV',
                  'Luxury',
                  'Van/Minivan',
                  'Convertible',
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => updatePreference('vehicleType', option)}
                    className={`px-4 py-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      preferences.vehicleType === option
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-primary hover:border-primary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requirements */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                (Optional) Special requirements or preferences
              </label>
              <textarea
                placeholder="Need automatic transmission, GPS, child car seats, etc."
                value={preferences.specialRequirements || ''}
                onChange={(e) =>
                  updatePreference('specialRequirements', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 'dining':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary p-3 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                Dining Preferences
              </h3>
            </div>

            {/* Dining Style */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                Preferred dining experiences
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Fine dining',
                  'Local cuisine',
                  'Street food',
                  'Casual dining',
                  'Food tours',
                  'Cooking classes',
                  'Wine tastings',
                  'Family-friendly',
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      toggleArrayPreference('diningStyles', option)
                    }
                    className={`px-4 py-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      (preferences.diningStyles || []).includes(option)
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-primary hover:border-primary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                (Optional) Dietary restrictions or preferences
              </label>
              <textarea
                placeholder="Vegetarian, gluten-free, allergies, etc."
                value={preferences.dietaryRestrictions || ''}
                onChange={(e) =>
                  updatePreference('dietaryRestrictions', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary">
              {inclusionType} Preferences
            </h3>
            <div className="bg-form-box p-6 rounded-xl">
              <label className="block text-lg font-semibold text-primary mb-3">
                Tell us about your preferences for {inclusionType}
              </label>
              <textarea
                placeholder={`Share any specific preferences or requirements for ${inclusionType}...`}
                value={preferences.generalPreferences || ''}
                onChange={(e) =>
                  updatePreference('generalPreferences', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
                rows={4}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">Preferences</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">{getModalContent()}</div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 rounded-b-2xl">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium shadow-lg"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;
