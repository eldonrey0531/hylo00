I'll refine the implementation based on your requirements. The generate button will appear after choosing the first button (detailed style), and I'll update the button styling to match with white inner border lines.

## Refined Implementation with Updated Styling

## 1. Updated TravelStyleChoice Component (Matching Button Style)

````typescript
import React from 'react';
import { Sparkles, FastForward } from 'lucide-react';

interface TravelStyleChoiceProps {
  onChooseDetailedStyle: () => void;
  onSkipToGenerate: () => void;
}

const TravelStyleChoice: React.FC<TravelStyleChoiceProps> = ({
  onChooseDetailedStyle,
  onSkipToGenerate
}) => {
  return (
    <div className="bg-gradient-to-br from-[#406170] to-[#2a4552] rounded-[36px] p-8 text-white">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-raleway uppercase tracking-wide mb-3">
          PERSONALIZE YOUR EXPERIENCE
        </h2>
        <p className="text-base font-raleway opacity-90 max-w-2xl mx-auto">
          Choose how you'd like us to customize your itinerary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Button 1: Detailed Preferences - Same style as Generate button */}
        <button
          onClick={onChooseDetailedStyle}
          className="
            relative group px-12 py-6 rounded-[20px] font-bold font-raleway text-xl
            transition-all duration-300 transform hover:scale-105
            bg-white text-primary hover:shadow-2xl hover:shadow-white/30
            border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]
          "
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <span className="uppercase tracking-wide">Answer Travel Style Questions</span>
            </div>
            <div className="text-sm font-normal opacity-80 max-w-xs">
              Get a highly personalized itinerary
            </div>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Recommended
            </span>
          </div>

          {/* Animated background effect on hover */}
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </button>

        {/* Button 2: Skip to Generate - Same style as Generate button */}
        <button
          onClick={onSkipToGenerate}
          className="
            relative group px-12 py-6 rounded-[20px] font-bold font-raleway text-xl
            transition-all duration-300 transform hover:scale-105
            bg-white text-primary hover:shadow-2xl hover:shadow-white/30
            border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]
          "
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-3">
              <FastForward className="h-6 w-6" />
              <span className="uppercase tracking-wide">Skip to Inclusions</span>
            </div>
            <div className="text-sm font-normal opacity-80 max-w-xs">
              Use my current selections only
            </div>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Quick Start
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TravelStyleChoice;
````

## 2. Updated GenerateItineraryButton with Consistent Styling

````typescript
import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { TravelStyleData } from './types';

interface GenerateItineraryButtonProps {
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  styleData: TravelStyleData;
  showRequirements?: boolean;
}

const GenerateItineraryButton: React.FC<GenerateItineraryButtonProps> = ({
  canGenerate,
  isGenerating,
  onGenerate,
  styleData,
  showRequirements = true
}) => {
  const getMissingFields = () => {
    const missing = [];
    if (!styleData.pace) missing.push('Travel Pace');
    if (!styleData.accommodationType?.length) missing.push('Accommodation Type');
    if (!styleData.activityLevel) missing.push('Activity Level');
    if (!styleData.culturalInterest) missing.push('Cultural Interest');
    if (!styleData.planningStyle) missing.push('Planning Style');
    return missing;
  };

  const missingFields = getMissingFields();

  return (
    <div className="bg-gradient-to-r from-primary to-[#2a4552] rounded-[36px] p-8 text-white">
      <div className="text-center space-y-4">
        {/* Status Indicators - Only show if requirements should be shown */}
        {showRequirements && !canGenerate && missingFields.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-[20px] p-4 mb-6">
            <p className="text-sm font-raleway mb-2">Complete these preferences to generate:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {missingFields.map((field) => (
                <span key={field} className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main Generate Button with white inner border */}
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`
            relative group px-12 py-5 rounded-[20px] font-bold font-raleway text-xl
            transition-all duration-300 transform hover:scale-105
            ${canGenerate 
              ? 'bg-white text-primary hover:shadow-2xl hover:shadow-white/30 border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]' 
              : 'bg-white/20 text-white/60 cursor-not-allowed border-4 border-white/20'
            }
          `}
        >
          <div className="flex items-center justify-center space-x-3">
            {isGenerating ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>GENERATING YOUR PERFECT ITINERARY...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                <span>GENERATE MY PERSONALIZED ITINERARY</span>
                <Sparkles className="h-6 w-6" />
              </>
            )}
          </div>

          {/* Animated background effect when ready */}
          {canGenerate && !isGenerating && (
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />
          )}
        </button>

        {/* Helper Text */}
        {showRequirements && (
          <div className="space-y-2">
            {canGenerate ? (
              <p className="text-sm font-raleway opacity-90">
                ✨ Your preferences are set! Click to create your custom itinerary
              </p>
            ) : (
              <p className="text-sm font-raleway opacity-75">
                Answer a few quick questions above to unlock AI-powered trip planning
              </p>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        {showRequirements && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            {['pace', 'accommodationType', 'activityLevel', 'culturalInterest', 'planningStyle'].map((field) => (
              <div
                key={field}
                className={`h-2 w-12 rounded-full transition-all duration-300 ${
                  styleData[field as keyof TravelStyleData] ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateItineraryButton;
````

## 3. Updated Main Flow Component (Generate Button Shows Earlier)

````typescript
import React, { useState } from 'react';
import TripDetails from '@/components/TripDetails';
import TravelStyleChoice from '@/components/TravelStyleChoice';
import TravelStyle from '@/components/TravelStyle';
import TripNickname from '@/components/TripNickname';
import { Sparkles, Loader2 } from 'lucide-react';

const TripPlanning = () => {
  const [tripData, setTripData] = useState({
    location: '',
    // ... other trip details
  });
  
  const [styleData, setStyleData] = useState({});
  const [tripNickname, setTripNickname] = useState('');
  
  // Flow control states
  const [showStyleChoice, setShowStyleChoice] = useState(false);
  const [userChoice, setUserChoice] = useState<'detailed' | 'skip' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if trip details are complete enough to proceed
  const isTripDetailsComplete = !!(
    tripData.location &&
    (tripData.departDate || tripData.flexibleDates) &&
    tripData.budget
  );

  const handleChooseDetailedStyle = () => {
    setUserChoice('detailed');
    setShowStyleChoice(false);
  };

  const handleSkipToGenerate = () => {
    setUserChoice('skip');
    setShowStyleChoice(false);
  };

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        tripDetails: tripData,
        travelStyle: userChoice === 'detailed' ? styleData : null,
        tripNickname: tripNickname,
        skipDetailedStyle: userChoice === 'skip'
      };

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Generated itinerary:', result);
      // Navigate to itinerary display
    } finally {
      setIsGenerating(false);
    }
  };

  // Different conditions for generate button based on path
  const canGenerateDetailed = !!(
    userChoice === 'detailed' && 
    styleData.isComplete && 
    tripNickname
  );

  const canGenerateSkip = !!(
    userChoice === 'skip' && 
    tripNickname
  );

  const canGenerate = canGenerateDetailed || canGenerateSkip;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Step 1: Trip Details */}
        <div>
          <TripDetails 
            formData={tripData}
            onFormChange={setTripData}
          />
        </div>

        {/* Show choice buttons after trip details are complete */}
        {isTripDetailsComplete && !userChoice && (
          <div className="animate-fade-in">
            <TravelStyleChoice
              onChooseDetailedStyle={handleChooseDetailedStyle}
              onSkipToGenerate={handleSkipToGenerate}
            />
          </div>
        )}

        {/* Step 2A: Detailed Travel Style (if chosen) */}
        {userChoice === 'detailed' && (
          <div className="animate-fade-in space-y-8">
            <TravelStyle
              styleData={styleData}
              onStyleChange={setStyleData}
              tripData={tripData}
              showGenerateButton={false} // We handle generate button separately
              showIntroMessage={true}
            />

            {/* Trip Nickname */}
            <TripNickname
              value={tripNickname}
              onChange={setTripNickname}
              destination={tripData.location}
            />

            {/* Generate Button for Detailed Path */}
            <div className="bg-gradient-to-r from-primary to-[#2a4552] rounded-[36px] p-8 text-white">
              <div className="text-center space-y-4">
                <button
                  onClick={handleGenerateItinerary}
                  disabled={!canGenerateDetailed || isGenerating}
                  className={`
                    relative group px-12 py-5 rounded-[20px] font-bold font-raleway text-xl
                    transition-all duration-300 transform hover:scale-105
                    ${canGenerateDetailed && !isGenerating
                      ? 'bg-white text-primary hover:shadow-2xl hover:shadow-white/30 border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]' 
                      : 'bg-white/20 text-white/60 cursor-not-allowed border-4 border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>GENERATING YOUR PERFECT ITINERARY...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6" />
                        <span>GENERATE MY PERSONALIZED ITINERARY</span>
                        <Sparkles className="h-6 w-6" />
                      </>
                    )}
                  </div>

                  {/* Animated background effect when ready */}
                  {canGenerateDetailed && !isGenerating && (
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />
                  )}
                </button>

                {/* Requirements Check */}
                {!canGenerateDetailed && (
                  <div className="mt-4 bg-white/10 backdrop-blur rounded-[20px] p-4">
                    <p className="text-sm font-raleway">Complete these to generate:</p>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      {!styleData.isComplete && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                          ⏳ Travel Style Questions
                        </span>
                      )}
                      {!tripNickname && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                          ⏳ Trip Nickname
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2B: Skip path - Nickname only */}
        {userChoice === 'skip' && (
          <div className="animate-fade-in space-y-8">
            <TripNickname
              value={tripNickname}
              onChange={setTripNickname}
              destination={tripData.location}
            />

            {/* Generate Button for Skip Path */}
            <div className="bg-gradient-to-r from-primary to-[#2a4552] rounded-[36px] p-8 text-white">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold font-raleway uppercase tracking-wide mb-4">
                  Ready to Generate Your Itinerary!
                </h3>
                
                <button
                  onClick={handleGenerateItinerary}
                  disabled={!canGenerateSkip || isGenerating}
                  className={`
                    relative group px-12 py-5 rounded-[20px] font-bold font-raleway text-xl
                    transition-all duration-300 transform hover:scale-105
                    ${canGenerateSkip && !isGenerating
                      ? 'bg-white text-primary hover:shadow-2xl hover:shadow-white/30 border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]' 
                      : 'bg-white/20 text-white/60 cursor-not-allowed border-4 border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>GENERATING YOUR ITINERARY...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6" />
                        <span>GENERATE MY PERSONALIZED ITINERARY</span>
                        <Sparkles className="h-6 w-6" />
                      </>
                    )}
                  </div>
                </button>

                {!tripNickname && (
                  <p className="text-sm font-raleway opacity-75 mt-4">
                    Please enter a trip nickname above to generate your itinerary
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanning;
````

## Key Changes Made:

### TODO: Button Styling Updates - Rapid Implementation

### Implementation Sprint

- [x] Add white inner border to all main action buttons
- [x] Use `shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]` for inner border effect
- [x] Apply `border-4 border-white` for outer border
- [x] Match Generate button style to choice buttons
- [x] Show Generate button when first option chosen

### Polish Phase (After Working)

- [ ] Fine-tune border thickness if needed
- [ ] Add hover animations
- [ ] Optimize for mobile view
- [ ] Add transition effects

The refined implementation:

1. **White inner border styling** - All buttons now have `border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]` for the double border effect
2. **Consistent button format** - The two choice buttons match the Generate button's style exactly
3. **Generate button appears earlier** - Shows immediately after choosing "detailed style" option, not waiting for nickname
4. **Clear visual hierarchy** - All main action buttons have the same prominent styling
5. **Hover effects maintained** - Animated gradient overlay on hover for visual feedback

The inner white border is achieved using a combination of regular border and inset box-shadow, creating the double-line effect you requested.