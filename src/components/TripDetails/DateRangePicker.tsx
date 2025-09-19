// src/components/TripDetails/DateRangePicker.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { dateUtils } from './utils';
import { VisualCalendar } from './VisualCalendar';

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
  const [selectedDepartDate, setSelectedDepartDate] = useState<Date | undefined>();
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | undefined>();

  // Update local state when props change
  useEffect(() => {
    setLocalDepartDate(departDate);
    setLocalReturnDate(returnDate);
    setErrors({});
    
    // Convert MM/DD/YY to Date objects for calendar
    if (departDate) {
      const departDateObj = dateUtils.parseMMDDYY(departDate);
      setSelectedDepartDate(departDateObj || undefined);
    } else {
      setSelectedDepartDate(undefined);
    }
    
    if (returnDate) {
      const returnDateObj = dateUtils.parseMMDDYY(returnDate);
      setSelectedReturnDate(returnDateObj || undefined);
    } else {
      setSelectedReturnDate(undefined);
    }
  }, [departDate, returnDate, isOpen]);

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

  // Handle departure date selection from calendar
  const handleDepartDateSelect = useCallback((date: Date) => {
    const formattedDate = dateUtils.formatToMMDDYY(date);
    setLocalDepartDate(formattedDate);
    setSelectedDepartDate(date);

    // Clear return date if it becomes invalid
    if (localReturnDate && !dateUtils.isReturnDateValid(formattedDate, localReturnDate)) {
      setLocalReturnDate('');
      setSelectedReturnDate(undefined);
    }
  }, [localReturnDate]);

  // Handle return date selection from calendar
  const handleReturnDateSelect = useCallback((date: Date) => {
    const formattedDate = dateUtils.formatToMMDDYY(date);
    setLocalReturnDate(formattedDate);
    setSelectedReturnDate(date);
  }, []);

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
        <div className="p-6">
          {/* Calendar Grid - 2 Columns */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Departure Calendar */}
            <div>
              <h4 className="text-lg font-bold text-primary mb-3 font-raleway text-center">
                Departure Date *
              </h4>
              <VisualCalendar
                selectedDate={selectedDepartDate}
                onDateSelect={handleDepartDateSelect}
                minDate={new Date()}
                highlightedDates={selectedReturnDate ? [selectedReturnDate] : []}
                className="w-full"
              />
              {errors.departDate && (
                <p className="text-red-500 text-sm mt-2 font-raleway text-center">{errors.departDate}</p>
              )}
            </div>

            {/* Return Calendar */}
            <div>
              <h4 className="text-lg font-bold text-primary mb-3 font-raleway text-center">
                Return Date (Optional)
              </h4>
              <VisualCalendar
                selectedDate={selectedReturnDate}
                onDateSelect={handleReturnDateSelect}
                minDate={selectedDepartDate ? new Date(selectedDepartDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                highlightedDates={selectedDepartDate ? [selectedDepartDate] : []}
                className={`w-full ${!selectedDepartDate ? 'opacity-50' : ''}`}
              />
              {errors.returnDate && (
                <p className="text-red-500 text-sm mt-2 font-raleway text-center">{errors.returnDate}</p>
              )}
              {!selectedDepartDate && (
                <p className="text-gray-500 text-sm mt-2 font-raleway text-center">
                  Select departure date first
                </p>
              )}
            </div>
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