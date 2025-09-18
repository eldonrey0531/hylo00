// src/components/TripDetails/FlightPreferences.tsx
import React from 'react';

const FlightPreferences: React.FC = () => {
  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="-mx-6 -mt-6 mb-6 bg-primary px-6 py-4 rounded-t-[33px]">
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          FLIGHT PREFERENCES
        </h3>
      </div>
      {/* Flight preferences form content goes here */}
    </div>
  );
};

export default FlightPreferences;