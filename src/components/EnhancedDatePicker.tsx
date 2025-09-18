import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface EnhancedDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputClick = () => {
    setIsOpen(true);
    // Trigger native date picker
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.click();
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return placeholder;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-bold text-primary mb-2 font-raleway">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={handleDateChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          required={required}
        />

        <div
          onClick={handleInputClick}
          className="w-full px-4 py-3 bg-[#ece8de] border-2 border-primary rounded-[10px] cursor-pointer hover:bg-[#e5e1d5] transition-colors duration-200 flex items-center justify-between font-raleway"
        >
          <span className={`text-primary ${value ? 'font-medium' : 'text-gray-500'}`}>
            {formatDisplayDate(value)}
          </span>
          <Calendar className="w-5 h-5 text-primary" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="text-center text-sm text-gray-600">Use your device's date picker</div>
        </div>
      )}
    </div>
  );
};
