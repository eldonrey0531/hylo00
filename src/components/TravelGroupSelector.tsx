import React, { useState } from 'react';

interface TravelGroupSelectorProps {
  selectedGroups: string[];
  onSelectionChange: (groups: string[]) => void;
}

const TravelGroupSelector: React.FC<TravelGroupSelectorProps> = ({
  selectedGroups,
  onSelectionChange,
}) => {
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const groupOptions = [
    { id: 'family', label: 'Family', emoji: '🧑‍🧑‍🧒‍🧒' },
    { id: 'couple', label: 'Couple', emoji: '👩‍❤️‍👨' },
    { id: 'solo', label: 'Solo', emoji: '🥾' },
    { id: 'friends', label: 'Friends', emoji: '👯' },
    { id: 'large-group', label: 'Large\nGroup', emoji: '🚌' },
    { id: 'extended', label: 'Extended\nFamily', emoji: '🏘️' },
    { id: 'business', label: 'Business\nAssociates', emoji: '💼' },
    { id: 'other', label: 'Other', emoji: '✨' },
  ];

  const toggleGroup = (groupId: string) => {
    if (groupId === 'other') {
      setShowOtherInput(!showOtherInput);
      if (!showOtherInput) {
        if (!selectedGroups.includes('other')) {
          onSelectionChange([...selectedGroups, 'other']);
        }
      } else {
        onSelectionChange(selectedGroups.filter((id) => id !== 'other'));
        setOtherText('');
      }
    } else {
      const newSelection = selectedGroups.includes(groupId)
        ? selectedGroups.filter((id) => id !== groupId)
        : [...selectedGroups, groupId];
      onSelectionChange(newSelection);
    }
  };

  return (
    <div className="bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
          TRAVEL GROUP
        </h3>
        <p className="text-primary font-bold font-raleway text-xs">
          Select all that apply
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {groupOptions.map((option) => {
          const isSelected = selectedGroups.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggleGroup(option.id)}
              className={`
                h-24 p-4 rounded-[10px] border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center space-y-2
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md'
                }
              `}
            >
              <span className="text-2xl">{option.emoji}</span>
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
      {showOtherInput && (
        <div className="bg-primary/10 rounded-[10px] p-4 border border-primary/20">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">✨</span>
            <label className="block text-primary font-bold text-base font-raleway">
              Other
            </label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            Tell us more about your travel group
          </label>
          <textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Example: Group dynamics, how you know each other, why you're traveling together, etc."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default TravelGroupSelector;
