import React from 'react';

interface GenerateItineraryButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const GenerateItineraryButton: React.FC<GenerateItineraryButtonProps> = ({
  isSubmitting,
  onClick,
  disabled = false,
  className = '',
}) => {
  const handleClick = React.useCallback(() => {
    if (!isSubmitting && !disabled) {
      onClick();
    }
  }, [isSubmitting, disabled, onClick]);

  return (
    <div className={`pt-6 ${className}`}>
      <button
        onClick={handleClick}
        disabled={isSubmitting || disabled}
        className={`w-full px-8 py-4 rounded-[36px] font-raleway font-bold text-xl shadow-lg transition-all duration-300 flex items-center justify-center ${
          isSubmitting || disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#f68854] hover:bg-[#e57743] hover:shadow-xl transform hover:scale-105'
        } text-[#406170]`}
        aria-label="Generate personalized itinerary"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#406170] mr-3"></div>
            GENERATING YOUR ITINERARY...
          </>
        ) : (
          'GENERATE MY PERSONALIZED ITINERARY ✨'
        )}
      </button>
    </div>
  );
};
