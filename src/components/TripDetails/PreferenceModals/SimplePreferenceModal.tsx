import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SimplePreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  emoji: string;
  placeholder: string;
  preferences: string;
  onSave: (preferences: string) => void;
}

const SimplePreferenceModal: React.FC<SimplePreferenceModalProps> = ({
  isOpen,
  onClose,
  title,
  emoji,
  placeholder,
  preferences,
  onSave,
}) => {
  const [text, setText] = useState(preferences || '');

  useEffect(() => {
    if (isOpen) {
      setText(preferences || '');
    }
  }, [isOpen, preferences]);

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[36px] p-6 border-3 border-primary max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{emoji}</span>
            <h3 className="text-xl font-bold text-primary uppercase tracking-wide font-raleway">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div>
          <label className="block text-primary font-bold font-raleway text-base mb-3">
            (Optional) Help us understand the types of {title.toLowerCase().replace(' preferences', '')} to include
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-[#ece8de] resize-none font-raleway font-bold"
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t-2 border-primary/20">
          <button
            onClick={onClose}
            className="px-6 py-3 border-3 border-primary text-primary rounded-[10px] font-bold font-raleway hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-white rounded-[10px] font-bold font-raleway hover:bg-primary-dark transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplePreferenceModal;