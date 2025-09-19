// src/components/TripDetails/DateRangePicker.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, X, Check } from 'lucide-react';
import { dateUtils } from './utils';

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  departDate: string;
  returnDate: string;
  onDatesChange: (departDate: string, returnDate: string) => void;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isOpen,
  onClose,
  departDate,
  returnDate,
  onDatesChange,
  disabled = false,
}) => {
  const [localDepartDate, setLocalDepartDate] = useState(departDate);
  const [localReturnDate, setLocalReturnDate] = useState(returnDate);
  const [errors, setErrors] = useState<{ departDate?: string; returnDate?: string }>({});

  // Update local state when props change
  useEffect(() => {
    setLocalDepartDate(departDate);
    setLocalReturnDate(returnDate);
    setErrors({});
  }, [departDate, returnDate, isOpen]);

  // Convert MM/DD/YY format to YYYY-MM-DD for input[type="date"]
  const convertToInputFormat = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    return dateUtils.convertToInputFormat(dateStr);
  }, []);

  // Convert YYYY-MM-DD format back to MM/DD/YY
  const convertFromInputFormat = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return dateUtils.formatToMMDDYY(date);
  }, []);

  // Get minimum date (today)
  const getMinDate = useCallback(() => {
    return dateUtils.getTodayString();
  }, []);

  // Get minimum return date (day after departure)
  const getMinReturnDate = useCallback(() => {
    if (localDepartDate) {
      const departDate = dateUtils.parseMMDDYY(localDepartDate);
      if (departDate) {
        departDate.setDate(departDate.getDate() + 1);
        return departDate.toISOString().split('T')[0];
      }
    }
    return getMinDate();
  }, [localDepartDate, getMinDate]);

  // Validate dates
  const validateDates = useCallback(() => {
    const newErrors: { departDate?: string; returnDate?: string } = {};

    if (!localDepartDate) {
      newErrors.departDate = 'Departure date is required';
    } else {
      const departDateObj = dateUtils.parseMMDDYY(localDepartDate);
      if (!departDateObj || departDateObj < new Date(new Date().setHours(0, 0, 0, 0))) {
        newErrors.departDate = 'Departure date must be today or later';
      }
    }

    if (localReturnDate) {
      if (!localDepartDate) {
        newErrors.returnDate = 'Please select departure date first';
      } else if (!dateUtils.isReturnDateValid(localDepartDate, localReturnDate)) {
        newErrors.returnDate = 'Return date must be after departure date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [localDepartDate, localReturnDate]);

  // Handle departure date change
  const handleDepartDateChange = useCallback((value: string) => {
    const formattedDate = convertFromInputFormat(value);
    setLocalDepartDate(formattedDate);

    // Clear return date if it becomes invalid
    if (localReturnDate && formattedDate && !dateUtils.isReturnDateValid(formattedDate, localReturnDate)) {
      setLocalReturnDate('');
    }
  }, [localReturnDate, convertFromInputFormat]);

  // Handle return date change
  const handleReturnDateChange = useCallback((value: string) => {
    const formattedDate = convertFromInputFormat(value);
    setLocalReturnDate(formattedDate);
  }, [convertFromInputFormat]);

  // Handle save
  const handleSave = useCallback(() => {
    if (validateDates()) {
      onDatesChange(localDepartDate, localReturnDate);
      onClose();
    }
  }, [localDepartDate, localReturnDate, validateDates, onDatesChange, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setLocalDepartDate(departDate);
    setLocalReturnDate(returnDate);
    setErrors({});
    onClose();
  }, [departDate, returnDate, onClose]);

  // Validate on changes
  useEffect(() => {
    if (localDepartDate || localReturnDate) {
      validateDates();
    }
  }, [localDepartDate, localReturnDate, validateDates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-raleway">Select Travel Dates</h3>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-primary-light rounded-full transition-colors duration-200"
              aria-label="Close date picker"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Departure Date */}
          <div>
            <label className="block text-primary mb-2 font-bold font-raleway text-base">
              Departure Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={convertToInputFormat(localDepartDate)}
                onChange={(e) => handleDepartDateChange(e.target.value)}
                min={getMinDate()}
                disabled={disabled}
                className={`w-full px-4 py-3 pr-12 border-3 rounded-[10px] focus:ring-2 focus:ring-primary transition-all duration-200 font-bold font-raleway text-base ${
                  errors.departDate
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-primary focus:border-primary'
                } ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-primary'}`}
                aria-label="Departure date"
                aria-invalid={!!errors.departDate}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
            </div>
            {errors.departDate && (
              <p className="text-red-500 text-sm mt-1 font-raleway">{errors.departDate}</p>
            )}
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-primary mb-2 font-bold font-raleway text-base">
              Return Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={convertToInputFormat(localReturnDate)}
                onChange={(e) => handleReturnDateChange(e.target.value)}
                min={getMinReturnDate()}
                disabled={disabled || !localDepartDate}
                className={`w-full px-4 py-3 pr-12 border-3 rounded-[10px] focus:ring-2 focus:ring-primary transition-all duration-200 font-bold font-raleway text-base ${
                  errors.returnDate
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-primary focus:border-primary'
                } ${
                  disabled || !localDepartDate 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-primary'
                }`}
                aria-label="Return date"
                aria-invalid={!!errors.returnDate}
                placeholder="Optional"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
            </div>
            {errors.returnDate && (
              <p className="text-red-500 text-sm mt-1 font-raleway">{errors.returnDate}</p>
            )}
            {!localDepartDate && (
              <p className="text-gray-500 text-sm mt-1 font-raleway">
                Select departure date first
              </p>
            )}
          </div>

          {/* Trip Duration Display */}
          {localDepartDate && localReturnDate && !errors.departDate && !errors.returnDate && (
            <div className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-4 text-center">
              <span className="text-primary font-bold font-raleway text-base">
                Trip Duration: {dateUtils.calculateDaysBetween(localDepartDate, localReturnDate)} days
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-raleway font-bold transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!localDepartDate || Object.keys(errors).length > 0}
            className={`px-6 py-2 rounded-lg font-raleway font-bold transition-all duration-200 flex items-center gap-2 ${
              !localDepartDate || Object.keys(errors).length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            <Check className="h-4 w-4" />
            Save Dates
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;