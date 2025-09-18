import React from 'react';

interface TravelInterestsProps {
  selectedInterests: string[];
  onSelectionChange: (interests: string[]) => void;
  /** Controlled value for custom 'other' interest text */
  otherText: string;
  /** Handler when the custom 'other' interest text changes */
  onOtherTextChange: (value: string) => void;
  /** Optional externally controlled visibility (if parent wants to force open) */
  showOther?: boolean;
  /** Notify parent that the other section was toggled (used to manage show state upstream) */
  onToggleOther?: (visible: boolean) => void;
}

const TravelInterests: React.FC<TravelInterestsProps> = ({
  selectedInterests,
  onSelectionChange,
  otherText,
  onOtherTextChange,
  showOther,
  onToggleOther,
}) => {
  // Derive visibility if not explicitly provided: show when 'other' is selected
  const derivedShowOther =
    typeof showOther === 'boolean' ? showOther : selectedInterests.includes('other');

  const interestOptions = [
    { id: 'beach', label: 'Beach', emoji: '🏖️' },
    { id: 'culture', label: 'Culture', emoji: '🛕' },
    { id: 'history', label: 'History', emoji: '📜' },
    { id: 'food', label: 'Food', emoji: '🍜' },
    { id: 'drinks', label: 'Drinks', emoji: '🍷' },
    { id: 'nature', label: 'Nature', emoji: '🌲' },
    { id: 'relaxation', label: 'Relaxation', emoji: '🍹' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'nightlife', label: 'Nightlife', emoji: '🕺' },
    { id: 'arts', label: 'Arts &\nEntertainment', emoji: '🎭' },
    { id: 'museums', label: 'Museums &\nExhibitions', emoji: '🖼️' },
    { id: 'zoos', label: 'Zoos &\nAquariums', emoji: '🦁' },
    { id: 'kids', label: 'Kid-friendly', emoji: '👧' },
    { id: 'theme-parks', label: 'Theme\nParks', emoji: '🎢' },
    { id: 'sports', label: 'Sporting\nEvents', emoji: '⚽️' },
    { id: 'wellness', label: 'Health &\nWellness', emoji: '🧘' },
    { id: 'classes', label: 'Classes', emoji: '🧑‍🍳' },
    { id: 'digital-detox', label: 'Digital\ndetox', emoji: '📵' },
    { id: 'volunteering', label: 'Volunteering', emoji: '🤝' },
    { id: 'other', label: 'Other', emoji: '✨' },
  ];

  const toggleInterest = (interestId: string) => {
    if (interestId === 'other') {
      const willShow = !derivedShowOther;
      if (willShow) {
        if (!selectedInterests.includes('other')) {
          onSelectionChange([...selectedInterests, 'other']);
        }
      } else {
        // Removing other: remove from selection & clear text
        onSelectionChange(selectedInterests.filter((id) => id !== 'other'));
        onOtherTextChange('');
      }
      onToggleOther?.(willShow);
      return;
    }
    const newSelection = selectedInterests.includes(interestId)
      ? selectedInterests.filter((id) => id !== interestId)
      : [...selectedInterests, interestId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          TRAVEL INTERESTS
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          Select all that apply to this trip
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {interestOptions.map((option) => {
          const isSelected = selectedInterests.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggleInterest(option.id)}
              className={`
                h-24 p-3 rounded-[10px] border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-2
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md'
                }
              `}
            >
              <span className="text-xl">{option.emoji}</span>
              <span
                className={`text-base font-bold text-center leading-tight font-raleway whitespace-pre-line ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Other Input Field */}
      {derivedShowOther && (
        <div className="bg-primary/10 rounded-[10px] p-4 border border-primary/20">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">✨</span>
            <label className="block text-primary font-bold text-base font-raleway">Other</label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            What other interests should be part of your itinerary?
          </label>
          <textarea
            value={otherText}
            onChange={(e) => onOtherTextChange(e.target.value)}
            placeholder="Include anything that will help us customize your itinerary"
            className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default TravelInterests;
