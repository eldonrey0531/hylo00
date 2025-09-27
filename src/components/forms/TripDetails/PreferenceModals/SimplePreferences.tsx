import React, { useState, useEffect, useCallback } from 'react';

interface SimplePreferencesProps {
  title: string;
  emoji: string;
  placeholder: string;
  preferences: string;
  onSave: (preferences: string) => void;
  hasValidationError?: boolean;
}

const SimplePreferences: React.FC<SimplePreferencesProps> = ({
  title,
  emoji,
  placeholder,
  preferences,
  onSave,
  hasValidationError = false,
}) => {
  const [text, setText] = useState(preferences || '');

  useEffect(() => {
    setText(preferences || '');
  }, [preferences]);

  const handleSave = useCallback(() => {
    onSave(text);
  }, [text, onSave]);

  // Save when user finishes editing (onBlur)
  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  return (
    <div className={`w-full bg-[#b0c29b] rounded-[36px] py-6 border-4 ${hasValidationError ? 'border-red-500' : 'border-transparent'}`}>
      <div className="w-full flex items-center space-x-3 bg-[#406170] px-6 py-4">
        <span className="text-2xl">{emoji}</span>
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          {title}
        </h3>
      </div>

      <div className="px-6 bg-[#b0c29b] rounded-b-[36px] pt-2">
        <label className="block text-primary font-bold font-raleway text-base mb-3">
          (Optional) Help us understand the types of {title.toLowerCase().replace(' preferences', '')} to include
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold"
          rows={4}
        />
      </div>
    </div>
  );
};

export default SimplePreferences;