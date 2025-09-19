// src/components/TripDetails/DatesForm.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { BaseFormProps, MAX_PLANNED_DAYS } from './types';
import { dateUtils } from './utils';
import DateRangePicker from './DateRangePicker';

const DatesForm: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localFlexibleDates, setLocalFlexibleDates] = useState(Boolean(formData.flexibleDates));
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  useEffect(() => {
    setLocalFlexibleDates(Boolean(formData.flexibleDates));
  }, [formData.flexibleDates]);

  const handleFlexibleDatesChange = useCallback(
    (checked: boolean) => {
      setLocalFlexibleDates(checked);
      const updates: Partial<typeof formData> = { flexibleDates: checked };

      if (checked) {
        updates.returnDate = '';
      } else {
        delete updates.plannedDays;
      }

      onFormChange(updates);
    },
    [formData, onFormChange]
  );

  // Handle date range picker
  const handleDateRangeChange = useCallback((departDate: string, returnDate: string) => {
    onFormChange({ departDate, returnDate });
  }, [onFormChange]);

  const handleOpenDateRangePicker = useCallback(() => {
    setIsDateRangePickerOpen(true);
  }, []);

  const handleCloseDateRangePicker = useCallback(() => {
    setIsDateRangePickerOpen(false);
  }, []);

  const totalDays = formData.departDate && formData.returnDate 
    ? dateUtils.calculateDaysBetween(formData.departDate, formData.returnDate) 
    : null;
  const isFlexibleDatesEnabled = localFlexibleDates;

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        DATES
      </h3>
      
      {/* Unified Date Range Section */}
      {!isFlexibleDatesEnabled && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-primary font-bold font-raleway text-base">
              Travel Dates
            </span>
            <button
              type="button"
              onClick={handleOpenDateRangePicker}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-raleway font-bold"
              aria-label="Edit travel dates"
            >
              <Calendar className="h-4 w-4" />
              Edit Dates
            </button>
          </div>

          {/* Date Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-3 border-primary rounded-[10px] p-4">
              <div className="text-sm text-primary font-raleway font-bold mb-1">Depart</div>
              <div className="text-primary font-raleway font-bold text-lg">
                {formData.departDate || 'Select date'}
              </div>
            </div>
            <div className="bg-white border-3 border-primary rounded-[10px] p-4">
              <div className="text-sm text-primary font-raleway font-bold mb-1">Return</div>
              <div className="text-primary font-raleway font-bold text-lg">
                {formData.returnDate || 'Optional'}
              </div>
            </div>
          </div>

          {/* Total Days Display */}
          {totalDays && (
            <div className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-4 text-center mt-4">
              <span className="text-primary font-bold font-raleway text-base">Total days: </span>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border-3 border-primary ml-2">
                <span className="font-bold text-primary font-raleway text-xl">{totalDays}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Legacy individual date inputs are replaced by unified date range picker above */}
      </div>

      {/* Old Total Days Display - now integrated above */}
      {/* {totalDays && !isFlexibleDatesEnabled && (
        <div className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-4 text-center mt-4">
          <span className="text-primary font-bold font-raleway text-base">Total days: </span>
          <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border-3 border-primary ml-2">
            <span className="font-bold text-primary font-raleway text-xl">{totalDays}</span>
          </div>
        </div>
      )} */}

      {/* Flexible Dates Switch */}
      <div className="flex items-center mt-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isFlexibleDatesEnabled}
            onChange={(e) => handleFlexibleDatesChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
              isFlexibleDatesEnabled
                ? 'bg-primary border-primary after:bg-white after:border-[#ece8de] after:border'
                : 'bg-[#ece8de] border-primary border-2 after:bg-primary after:border-[#ece8de] after:border-2'
            }`}
          ></div>
          <span className="text-primary font-bold font-raleway text-sm">
            I'm not sure or my dates are flexible
          </span>
        </label>
      </div>

      {/* Flexible Dates Dropdown */}
      {isFlexibleDatesEnabled && (
        <div className="mt-4 transition-all duration-300 ease-in-out">
          <label className="block text-primary mb-2 font-bold font-raleway text-base">
            How many days should we plan?
          </label>
          <div className="relative">
            <select
              value={formData.plannedDays || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  onFormChange({ plannedDays: parseInt(value) });
                } else {
                  // Omit the property when clearing
                  const { plannedDays, ...rest } = formData;
                  onFormChange(rest);
                }
              }}
              className="w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-base appearance-none"
              aria-label="Number of planned days"
            >
              <option value="" className="font-bold font-raleway">
                Select number of days
              </option>
              {Array.from({ length: MAX_PLANNED_DAYS }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day} className="font-bold font-raleway">
                  {day} {day === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
          </div>
        </div>
      )}

      {/* Date Range Picker Modal */}
      <DateRangePicker
        isOpen={isDateRangePickerOpen}
        onClose={handleCloseDateRangePicker}
        departDate={formData.departDate || ''}
        returnDate={formData.returnDate || ''}
        onDatesChange={handleDateRangeChange}
        disabled={isFlexibleDatesEnabled}
      />
    </div>
  );
};

export default DatesForm;
