// src/components/TripDetails/DatesForm.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { BaseFormProps, MAX_PLANNED_DAYS } from './types';
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
        // Clear specific dates when switching to flexible
        updates.departDate = '';
        updates.returnDate = '';
      } else {
        // Clear planned days when switching to specific dates
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

  // Calculate total days if both dates are provided
  const totalDays = formData.departDate && formData.returnDate 
    ? (() => {
        try {
          // Parse MM/DD/YY format
          const departParts = formData.departDate.split('/');
          const returnParts = formData.returnDate.split('/');
          
          if (departParts.length !== 3 || returnParts.length !== 3) return null;
          
          const departMonth = parseInt(departParts[0] || '');
          const departDay = parseInt(departParts[1] || '');
          const departYear = parseInt(departParts[2] || '');
          const returnMonth = parseInt(returnParts[0] || '');
          const returnDay = parseInt(returnParts[1] || '');
          const returnYear = parseInt(returnParts[2] || '');
          
          // Validate parsed numbers
          if (isNaN(departMonth) || isNaN(departDay) || isNaN(departYear) ||
              isNaN(returnMonth) || isNaN(returnDay) || isNaN(returnYear)) {
            return null;
          }
          
          // Convert 2-digit year to 4-digit year (assuming 20xx)
          const fullDepartYear = departYear < 50 ? 2000 + departYear : 1900 + departYear;
          const fullReturnYear = returnYear < 50 ? 2000 + returnYear : 1900 + returnYear;
          
          const departDateObj = new Date(fullDepartYear, departMonth - 1, departDay);
          const returnDateObj = new Date(fullReturnYear, returnMonth - 1, returnDay);
          
          const diffTime = returnDateObj.getTime() - departDateObj.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include departure day
          
          return diffDays > 0 ? diffDays : null;
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        DATES
      </h3>
      
      {/* Original Individual Date Inputs */}
      {!localFlexibleDates && (
        <div className="space-y-4 mb-6">
          {/* Departure Date */}
          <div>
            <label className="block text-primary mb-2 font-bold font-raleway text-base">
              Departure Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="MM/DD/YY"
                value={formData.departDate || ''}
                onClick={handleOpenDateRangePicker}
                readOnly
                className="w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-base cursor-pointer"
                aria-label="Departure date"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
            </div>
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-primary mb-2 font-bold font-raleway text-base">
              Return Date <span className="text-sm font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="MM/DD/YY"
                value={formData.returnDate || ''}
                onClick={handleOpenDateRangePicker}
                readOnly
                className="w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white font-bold font-raleway text-base cursor-pointer"
                aria-label="Return date (optional)"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
            </div>
          </div>

          {/* Total Days Display */}
          {totalDays && (
            <div className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-4 text-center">
              <span className="text-primary font-bold font-raleway text-base">Total days: </span>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border-3 border-primary ml-2">
                <span className="font-bold text-primary font-raleway text-xl">{totalDays}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flexible Dates Switch */}
      <div className="flex items-center mb-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localFlexibleDates}
            onChange={(e) => handleFlexibleDatesChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 mr-3 ${
              localFlexibleDates
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
      {localFlexibleDates && (
        <div className="transition-all duration-300 ease-in-out">
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

      {/* Enhanced Date Range Picker Modal - Flight booking style */}
      <DateRangePicker
        isOpen={isDateRangePickerOpen}
        onClose={handleCloseDateRangePicker}
        departDate={formData.departDate || ''}
        returnDate={formData.returnDate || ''}
        onDatesChange={handleDateRangeChange}
        disabled={localFlexibleDates}
      />
    </div>
  );
};

export default DatesForm;
