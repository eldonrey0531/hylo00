import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ItineraryInclusionsProps {
  selectedInclusions: string[];
  onSelectionChange: (inclusions: string[]) => void;
}

const ItineraryInclusions: React.FC<ItineraryInclusionsProps> = ({
  selectedInclusions,
  onSelectionChange,
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [inclusionPreferences, setInclusionPreferences] = useState<
    Record<string, any>
  >({});

  const inclusionOptions = [
    { id: 'flights', label: 'Flights', emoji: '✈️' },
    { id: 'accommodations', label: 'Accommodations', emoji: '🏨' },
    { id: 'rental-car', label: 'Rental Car', emoji: '🚗' },
    { id: 'activities', label: 'Activities & Tours', emoji: '🛶' },
    { id: 'dining', label: 'Dining', emoji: '🍽️' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🪇' },
    { id: 'nature', label: 'Nature', emoji: '🌲' },
    { id: 'train', label: 'Train Tickets', emoji: '🚆' },
    { id: 'cruise', label: 'Cruise', emoji: '🛳️' },
    { id: 'other', label: 'Other', emoji: '✨' },
  ];

  const toggleInclusion = (inclusionId: string) => {
    if (inclusionId === 'other') {
      setShowOtherInput(!showOtherInput);
      if (!showOtherInput) {
        if (!selectedInclusions.includes('other')) {
          onSelectionChange([...selectedInclusions, 'other']);
        }
      } else {
        onSelectionChange(selectedInclusions.filter((id) => id !== 'other'));
        setOtherText('');
      }
    } else {
      const isCurrentlySelected = selectedInclusions.includes(inclusionId);

      if (isCurrentlySelected) {
        // Remove from selection
        onSelectionChange(
          selectedInclusions.filter((id) => id !== inclusionId)
        );
        // Remove preferences for this inclusion
        const newPreferences = { ...inclusionPreferences };
        delete newPreferences[inclusionId];
        setInclusionPreferences(newPreferences);
      } else {
        // Add to selection
        onSelectionChange([...selectedInclusions, inclusionId]);
      }
    }
  };

  const updatePreference = (inclusionId: string, key: string, value: any) => {
    setInclusionPreferences({
      ...inclusionPreferences,
      [inclusionId]: {
        ...inclusionPreferences[inclusionId],
        [key]: value,
      },
    });
  };

  const toggleArrayPreference = (
    inclusionId: string,
    key: string,
    value: string
  ) => {
    const currentArray = inclusionPreferences[inclusionId]?.[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    updatePreference(inclusionId, key, newArray);
  };

  const renderPreferences = (inclusionId: string) => {
    if (!selectedInclusions.includes(inclusionId)) return null;

    const option = inclusionOptions.find((opt) => opt.id === inclusionId);

    switch (inclusionId) {
      case 'flights':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">✈️</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Flight preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              {/* Departure Airport */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  Traveler departure airport(s)
                </label>
                <input
                  type="text"
                  placeholder="Example: SFO, London area airports"
                  value={
                    inclusionPreferences[inclusionId]?.departureAirport || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'departureAirport',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] font-raleway font-bold"
                />
              </div>

              {/* Cabin Class */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
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
                      onClick={() =>
                        toggleArrayPreference(inclusionId, 'cabinClass', option)
                      }
                      className={`px-4 py-2 rounded-[10px] border-2 transition-all duration-200 font-bold font-raleway text-sm ${
                        (
                          inclusionPreferences[inclusionId]?.cabinClass || []
                        ).includes(option)
                          ? 'border-primary bg-primary text-white'
                          : 'border-primary bg-[#ece8de] text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flight Preferences */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) Flight or airline preferences
                </label>
                <textarea
                  placeholder="Example: I prefer Delta or United, 1 layover or less"
                  value={
                    inclusionPreferences[inclusionId]?.flightPreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'flightPreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 'accommodations':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🏨</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Accommodation preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              {/* Accommodation Types */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  Preferred accommodation type(s)
                </label>
                <p className="text-primary/70 text-xs mb-4 font-bold font-raleway">
                  Select all that apply
                </p>
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
                    '✨ Other',
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        toggleArrayPreference(
                          inclusionId,
                          'accommodationTypes',
                          option
                        )
                      }
                      className={`px-4 py-3 rounded-[10px] border-2 text-left transition-all duration-200 font-bold font-raleway text-sm ${
                        (
                          inclusionPreferences[inclusionId]
                            ?.accommodationTypes || []
                        ).includes(option)
                          ? 'border-primary bg-primary text-white'
                          : 'border-primary bg-[#ece8de] text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Other accommodation type input */}
                {(
                  inclusionPreferences[inclusionId]?.accommodationTypes || []
                ).includes('✨ Other') && (
                  <div className="mt-4 bg-primary/10 rounded-[10px] p-4 border border-primary/20">
                    <textarea
                      placeholder="Tell us more about your preferred accommodations"
                      value={
                        inclusionPreferences[inclusionId]
                          ?.otherAccommodationType || ''
                      }
                      onChange={(e) =>
                        updatePreference(
                          inclusionId,
                          'otherAccommodationType',
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) Special accommodation requests or preferred hotel
                  brands
                </label>
                <textarea
                  placeholder="Example: We want 2 separate rooms, We prefer Hyatt or Marriott hotels"
                  value={
                    inclusionPreferences[inclusionId]?.specialRequests || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'specialRequests',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 'rental-car':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🚗</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Rental car preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              {/* Car Type */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
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
                      onClick={() =>
                        toggleArrayPreference(
                          inclusionId,
                          'vehicleTypes',
                          option
                        )
                      }
                      className={`px-4 py-3 rounded-[10px] border-2 text-left transition-all duration-200 font-bold font-raleway text-sm ${
                        (
                          inclusionPreferences[inclusionId]?.vehicleTypes || []
                        ).includes(option)
                          ? 'border-primary bg-primary text-white'
                          : 'border-primary bg-[#ece8de] text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requirements */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) Special requirements or preferences
                </label>
                <textarea
                  placeholder="Example: We need seats for 6 people, We prefer Budget or Avis"
                  value={
                    inclusionPreferences[inclusionId]?.specialRequirements || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'specialRequirements',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🛶</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Activities & Tours preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) Help us understand the types of activities and
                  tours to include
                </label>
                <textarea
                  placeholder="Example: I love history and culture, I want to bar hop in Barcelona"
                  value={
                    inclusionPreferences[inclusionId]?.activityPreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'activityPreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 'dining':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🍽️</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Dining preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              {/* Dining Preferences Text Box */}
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) Help us understand the types of dining to include
                </label>
                <textarea
                  placeholder="Example: We love street food, we want fine dining for dinner every night"
                  value={
                    inclusionPreferences[inclusionId]?.diningPreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'diningPreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 'entertainment':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🪇</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Entertainment preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) Help us understand the types of entertainment to
                  include
                </label>
                <textarea
                  placeholder="Example: We love live music, I want to attend a local cultural festival"
                  value={
                    inclusionPreferences[inclusionId]
                      ?.entertainmentPreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'entertainmentPreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 'nature':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🌲</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Nature preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) How do you like to enjoy nature?
                </label>
                <textarea
                  placeholder="Example: We love hiking and biking, my kids love to swim"
                  value={
                    inclusionPreferences[inclusionId]?.naturePreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'naturePreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 'train':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🚆</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Train Tickets preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) List any train travel preferences
                </label>
                <textarea
                  placeholder="Example: We want to take a bullet train between Tokyo and Kyoto, I want to experience a sleeper train"
                  value={
                    inclusionPreferences[inclusionId]?.trainPreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'trainPreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 'cruise':
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">🛳️</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                Cruise preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) List any cruise preferences
                </label>
                <textarea
                  placeholder="Example: Royal Caribbean departing from Florida, Balcony Suite"
                  value={
                    inclusionPreferences[inclusionId]?.cruisePreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'cruisePreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-[#b0c29b] rounded-[36px] overflow-hidden preferences-section">
            {/* Empty line */}
            <div className="h-6"></div>

            {/* Title section with #406170 background and border only on title */}
            <div className="bg-[#406170] text-white px-8 py-4 flex items-center space-x-3 border-b-3 border-[#406170]">
              <div className="bg-[#406170] p-2 rounded-lg">
                <span className="text-xl">{option?.emoji || '✨'}</span>
              </div>
              <h4 className="text-xl font-bold font-raleway">
                {option?.label} preferences
              </h4>
            </div>

            {/* Content section with #b0c29b background */}
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="bg-[#b0c29b]">
                <label className="block text-primary font-bold mb-2 font-raleway text-base">
                  (Optional) What else do you want included in your itinerary?
                </label>
                <textarea
                  placeholder="What else should we include in your itinerary?"
                  value={
                    inclusionPreferences[inclusionId]?.generalPreferences || ''
                  }
                  onChange={(e) =>
                    updatePreference(
                      inclusionId,
                      'generalPreferences',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Section */}
      <div className="bg-form-box rounded-[36px] p-6 shadow-lg border-3 border-gray-200">
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            What Should We Include in Your Itinerary?
          </h3>
          <p className="text-primary font-bold font-raleway text-xs">
            Select all that apply
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {inclusionOptions.map((option) => {
            const isSelected = selectedInclusions.includes(option.id);

            return (
              <button
                key={option.id}
                onClick={() => toggleInclusion(option.id)}
                className={`
                  w-full flex flex-col items-center space-y-2 px-4 py-3 rounded-[10px] border-3 transition-all duration-200 hover:scale-105
                  ${
                    isSelected
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-primary bg-[#ece8de] text-primary hover:border-primary'
                  }
                `}
              >
                <span className="text-xl">{option.emoji}</span>
                <span
                  className={`text-base text-center font-bold font-raleway ${
                    isSelected ? 'text-white' : 'text-primary'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Other Input Field - Reduced spacing */}
        {showOtherInput && (
          <div className="bg-primary/10 rounded-[10px] p-4 border border-primary/20 mt-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">✨</span>
              <label className="block text-primary font-bold text-base font-raleway">
                Other
              </label>
            </div>
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="What else should we include in your itinerary?"
              className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Preferences Sections - Now rendered outside main section */}
      {selectedInclusions
        .filter((id) => id !== 'other')
        .map((inclusionId) => (
          <div key={inclusionId} className="shadow-lg">
            {renderPreferences(inclusionId)}
          </div>
        ))}
    </div>
  );
};

export default ItineraryInclusions;
