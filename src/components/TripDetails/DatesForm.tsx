// src/components/TripDetails/DatesForm.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { BaseFormProps, MAX_PLANNED_DAYS } from './types';
import { dateUtils } from './utils';

const DatesForm: React.FC<BaseFormProps> = ({ formData, onFormChange }) => {
  const [localFlexibleDates, setLocalFlexibleDates] = useState(Boolean(formData.flexibleDates));
  const departDateRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalFlexibleDates(Boolean(formData.flexibleDates));
  }, [formData.flexibleDates]);

  const handleDateChange = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      if (value) {
        const date = new Date(value);
        const formattedDate = dateUtils.formatToMMDDYY(date);

        if (field === 'returnDate') {
          if (
            formData.departDate &&
            !dateUtils.isReturnDateValid(formData.departDate, formattedDate)
          ) {
            console.warn('Return date must be at least one day after departure date');
            onFormChange({ returnDate: '' });
            return;
          }
        }

        if (field === 'departDate' && formData.returnDate) {
          if (!dateUtils.isReturnDateValid(formattedDate, formData.returnDate)) {
            onFormChange({ [field]: formattedDate, returnDate: '' });
            return;
          }
        }

        onFormChange({ [field]: formattedDate });
      }
    },
    [formData, onFormChange]
  );

  const handleManualDateInput = useCallback(
    (field: 'departDate' | 'returnDate', value: string) => {
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 6) cleaned = cleaned.substring(0, 6);

      let formatted = '';
      if (cleaned.length >= 1) {
        let month = cleaned.substring(0, 2);
        if (cleaned.length >= 2) {
          let monthNum = parseInt(month);
          if (monthNum > 12) month = '12';
          else if (monthNum === 0 && month.length === 2) month = '01';
        }
        formatted = month;
      }

      if (cleaned.length >= 3) {
        let day = cleaned.substring(2, 4);
        if (cleaned.length >= 4) {
          let dayNum = parseInt(day);
          if (dayNum > 31) day = '31';
          else if (dayNum === 0 && day.length === 2) day = '01';
        }
        formatted += '/' + day;
      }

      if (cleaned.length >= 5) {
        let year = cleaned.substring(4, 6);
        formatted += '/' + year;
      }

      if (formatted.length === 8) {
        if (
          field === 'returnDate' &&
          formData.departDate &&
          !dateUtils.isReturnDateValid(formData.departDate, formatted)
        ) {
          console.warn('Return date must be at least one day after departure date');
          return;
        }

        if (
          field === 'departDate' &&
          formData.returnDate &&
          !dateUtils.isReturnDateValid(formatted, formData.returnDate)
        ) {
          onFormChange({ [field]: formatted, returnDate: '' });
          return;
        }
      }

      onFormChange({ [field]: formatted });
    },
    [formData, onFormChange]
  );

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

  const getMinReturnDate = useCallback(() => {
    if (formData.departDate) {
      const departDate = dateUtils.parseMMDDYY(formData.departDate);
      if (departDate) {
        departDate.setDate(departDate.getDate() + 1);
        return departDate.toISOString().split('T')[0];
      }
    }
    return dateUtils.getTodayString();
  }, [formData.departDate]);

  const totalDays = dateUtils.calculateDaysBetween(formData.departDate, formData.returnDate);
  const isFlexibleDatesEnabled = localFlexibleDates;

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <h3 className="text-xl font-bold text-primary uppercase tracking-wide mb-4 font-raleway">
        DATES
      </h3>
      <div className="space-y-4">
        {/* Departure Date */}
        <div>
          <label className="block text-primary mb-2 font-bold font-raleway text-base">
            {isFlexibleDatesEnabled ? 'Trip Start (flexible)' : 'Depart'}
          </label>
          <div
            className={`relative cursor-pointer ${isFlexibleDatesEnabled ? 'hidden' : ''}`}
            onClick={() => !isFlexibleDatesEnabled && departDateRef.current?.showPicker()}
          >
            <input
              type="text"
              placeholder="mm/dd/yy"
              value={formData.departDate || ''}
              onChange={(e) => handleManualDateInput('departDate', e.target.value)}
              onFocus={(e) => e.target.select()}
              maxLength={8}
              className="w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary placeholder-gray-400 font-bold font-raleway text-base bg-white cursor-pointer"
              aria-label="Departure date"
              disabled={isFlexibleDatesEnabled}
            />
            <input
              ref={departDateRef}
              type="date"
              min={dateUtils.getTodayString()}
              value={dateUtils.convertToInputFormat(formData.departDate || '')}
              onChange={(e) => handleDateChange('departDate', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                !isFlexibleDatesEnabled && departDateRef.current?.showPicker();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors z-10 hover:bg-gray-100 cursor-pointer text-primary"
              aria-label="Open departure date picker"
              disabled={isFlexibleDatesEnabled}
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-primary mb-2 font-bold font-raleway text-base">
            {isFlexibleDatesEnabled ? 'Duration' : 'Return'}
          </label>
          <div
            className={`relative ${
              isFlexibleDatesEnabled ? 'hidden cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={() => !isFlexibleDatesEnabled && returnDateRef.current?.showPicker()}
          >
            <input
              type="text"
              placeholder="mm/dd/yy"
              value={formData.returnDate || ''}
              onChange={(e) => handleManualDateInput('returnDate', e.target.value)}
              onFocus={(e) => e.target.select()}
              maxLength={8}
              disabled={isFlexibleDatesEnabled}
              className={`w-full px-4 py-3 pr-12 border-3 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary placeholder-gray-400 font-bold font-raleway text-base ${
                isFlexibleDatesEnabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white cursor-pointer'
              }`}
              aria-label="Return date"
              aria-disabled={isFlexibleDatesEnabled}
            />
            <input
              ref={returnDateRef}
              type="date"
              min={getMinReturnDate()}
              value={dateUtils.convertToInputFormat(formData.returnDate || '')}
              onChange={(e) => handleDateChange('returnDate', e.target.value)}
              disabled={isFlexibleDatesEnabled}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                !isFlexibleDatesEnabled && returnDateRef.current?.showPicker();
              }}
              disabled={isFlexibleDatesEnabled}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors z-10 ${
                isFlexibleDatesEnabled
                  ? 'cursor-not-allowed text-gray-400'
                  : 'hover:bg-gray-100 cursor-pointer text-primary'
              }`}
              aria-label="Open return date picker"
              aria-disabled={isFlexibleDatesEnabled}
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Total Days Display */}
      {totalDays && !isFlexibleDatesEnabled && (
        <div className="bg-[#ece8de] border-3 border-primary rounded-[10px] p-4 text-center mt-4">
          <span className="text-primary font-bold font-raleway text-base">Total days: </span>
          <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border-3 border-primary ml-2">
            <span className="font-bold text-primary font-raleway text-xl">{totalDays}</span>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default DatesForm;
