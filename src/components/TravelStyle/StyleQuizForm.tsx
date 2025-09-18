// StyleQuizForm.tsx - Quiz-style wrapper for TravelStyle components
import React, { useState, useCallback } from 'react';
import { TravelStyleData } from './types';

interface StyleQuizFormProps {
  initialData?: TravelStyleData;
  onComplete: (data: TravelStyleData) => void;
  onCancel?: () => void;
}

export const StyleQuizForm: React.FC<StyleQuizFormProps> = ({
  initialData = {},
  onComplete,
  onCancel,
}) => {
  const [styleData, setStyleData] = useState<TravelStyleData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStyleChange = useCallback((updates: Partial<TravelStyleData>) => {
    setStyleData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleComplete = useCallback(() => {
    onComplete(styleData);
  }, [styleData, onComplete]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  return (
    <div className="bg-form-box rounded-[36px] p-6 border-3 border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary uppercase tracking-wide mb-2 font-raleway">
          Travel Style Quiz
        </h2>
        <p className="text-primary font-raleway text-sm">
          Help us create your perfect itinerary by sharing your travel preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Quiz content will be integrated with TravelStyle components */}
        <div className="text-center">
          <p className="text-primary font-raleway text-sm mb-4">
            Step {currentStep + 1} of 5 - Tell us about your travel style
          </p>

          <div className="flex justify-center space-x-4">
            {onCancel && (
              <button
                onClick={handleCancel}
                className="px-6 py-2 border-2 border-primary text-primary rounded-[10px] font-raleway font-bold hover:bg-primary hover:text-white transition-colors"
              >
                Skip for Now
              </button>
            )}

            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-primary text-white rounded-[10px] font-raleway font-bold hover:bg-primary/90 transition-colors"
            >
              Complete Style Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleQuizForm;
