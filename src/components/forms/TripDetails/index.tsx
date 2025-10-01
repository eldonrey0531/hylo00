// src/components/TripDetails/index.tsx
import React, { useCallback, useRef, useEffect } from 'react';
import LocationForm from './LocationForm';
import DatesForm from './DatesForm';
import TravelersForm from './TravelersForm';
import BudgetForm from './BudgetForm';
import TravelGroupSelector from './TravelGroupSelector';
import TravelInterests from './TravelInterests';
import ItineraryInclusions from './ItineraryInclusions';
import { FormData } from './types';

interface TripDetailsProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  showAdditionalForms?: boolean;
  validationErrors?: { [key: string]: string[] };
}

const TripDetails: React.FC<TripDetailsProps> = ({
  formData,
  onFormChange,
  showAdditionalForms = false,
  validationErrors = {},
}) => {
  const formDataRef = useRef(formData);
  
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleFormUpdate = useCallback(
    (updates: Partial<FormData>) => {
      onFormChange({ ...formDataRef.current, ...updates });
    },
    [onFormChange]
  );

  const baseProps = {
    formData,
    onFormChange: handleFormUpdate,
    validationErrors: [],
  };

  return (
    <div className="space-y-6">
      {/* Location Box */}
      <LocationForm {...baseProps} validationErrors={validationErrors.location || []} />

      {/* Dates and Travelers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatesForm {...baseProps} validationErrors={validationErrors.dates || []} />
        <TravelersForm {...baseProps} validationErrors={validationErrors.travelers || []} />
      </div>

      {/* Budget Box */}
      <BudgetForm {...baseProps} />

      {/* Additional Forms - Can be conditionally rendered */}
      {showAdditionalForms && (
        <>
          {/* Travel Group Selector */}
          <TravelGroupSelector {...baseProps} validationErrors={validationErrors.travelGroups || []} />

          {/* Travel Interests */}
          <TravelInterests {...baseProps} validationErrors={validationErrors.travelInterests || []} />

          {/* Itinerary Inclusions */}
          <ItineraryInclusions {...baseProps} validationErrors={validationErrors} />
        </>
      )}
    </div>
  );
};

export default TripDetails;