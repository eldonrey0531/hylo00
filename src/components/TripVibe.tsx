import React, { useState } from 'react';

interface TripVibeProps {
  selectedVibes: string[];
  onSelectionChange: (vibes: string[]) => void;
}

const TripVibe: React.FC<TripVibeProps> = ({
  selectedVibes,
  onSelectionChange,
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');

  const vibeOptions = [
    { text: 'Up for anything', emoji: '🎊' },
    { text: 'Relax & recharge', emoji: '🧘' },
    { text: 'Be in the action', emoji: '🎬' },
    { text: 'Go with the flow', emoji: '🕺' },
    { text: 'Wander & get lost', emoji: '🧭' },
    { text: 'Follow a detailed plan', emoji: '✅' },
    { text: 'Go-go-go to maximize time', emoji: '🏃‍♀️' },
    { text: 'Food is half the fun', emoji: '🍱' },
    { text: 'Need a lot of variety', emoji: '📸' },
    { text: 'Immersed in local culture', emoji: '💃' },
    { text: 'Classic tourist spots & experiences', emoji: '🗽' },
    { text: 'Unique or offbeat experiences', emoji: '🔮' },
    { text: 'Learn and grow', emoji: '🧠' },
    { text: 'Reconnect as a group', emoji: '⛓️' },
    { text: 'An escape from everyday life', emoji: '🍹' },
    { text: 'Other', emoji: '✨' },
  ];

  const toggleVibe = (vibe: string) => {
    if (vibe === 'Other') {
      setShowOtherInput(!showOtherInput);
      if (!showOtherInput) {
        if (!selectedVibes.includes('Other')) {
          onSelectionChange([...selectedVibes, 'Other']);
        }
      } else {
        onSelectionChange(selectedVibes.filter((item) => item !== 'Other'));
        setOtherText('');
      }
    } else {
      const newSelection = selectedVibes.includes(vibe)
        ? selectedVibes.filter((item) => item !== vibe)
        : [...selectedVibes, vibe];
      onSelectionChange(newSelection);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {vibeOptions.map((option) => {
          const isSelected = selectedVibes.includes(option.text);

          return (
            <button
              key={option.text}
              onClick={() => toggleVibe(option.text)}
              className={`
                p-4 rounded-[10px] border-2 text-center transition-all duration-200 hover:scale-105 flex flex-col items-center space-y-2
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-primary bg-[#ece8de] hover:border-primary hover:shadow-md text-primary'
                }
              `}
            >
              <span className="text-xl">{option.emoji}</span>
              <span
                className={`font-bold font-raleway text-sm ${
                  isSelected ? 'text-white' : 'text-primary'
                }`}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Other Input Field */}
      {showOtherInput && (
        <div className="bg-primary/10 rounded-[10px] p-4 border border-primary/20 mt-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">✨</span>
            <label className="block text-primary font-bold text-base font-raleway">
              Other
            </label>
          </div>
          <label className="block text-primary font-bold mb-3 text-sm font-raleway">
            What other vibe(s) do you want for this trip?
          </label>
          <textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Example: We want down time to laugh and reminisce about the good old days"
            className="w-full px-4 py-3 border-3 border-[#406170] rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold text-sm"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default TripVibe;
