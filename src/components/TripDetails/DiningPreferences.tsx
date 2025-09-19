// src/components/TripDetails/DiningPreferences.tsx
import React from 'react';

const DiningPreferences: React.FC = () => {
  return (
    <div className="w-full bg-[#b0c29b] rounded-[36px] py-6 border-3 border-gray-200">
      <div className="w-full flex items-center space-x-3 bg-[#406170] px-6 py-4 rounded-b-[20px]">
        <span className="text-2xl">🍽️</span>
        <h3 className="text-xl font-bold text-white uppercase tracking-wide font-raleway">
          DINING PREFERENCES
        </h3>
      </div>
      <div className="px-6 bg-[#b0c29b]">
        {/* ...existing content... */}
      </div>
    </div>
  );
};

export default DiningPreferences;