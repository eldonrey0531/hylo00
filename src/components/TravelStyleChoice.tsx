/**
 * TravelStyleChoice Component
 * Feature: 003-group-travel-style
 * 
 * Provides two choice buttons for users to select between detailed travel style
 * preferences or skipping to nickname entry. Uses GenerateItineraryButton styling
 * template for visual consistency.
 */

import React from 'react';
import { Sparkles, FastForward } from 'lucide-react';
import { TravelStyleChoice as TravelStyleChoiceEnum, TravelStyleChoiceProps } from '../types/travel-style-choice';

const TravelStyleChoice: React.FC<TravelStyleChoiceProps> = ({
  onChoiceSelect,
  disabled = false,
  className = '',
}) => {
  const handleDetailedChoice = () => {
    if (!disabled) {
      onChoiceSelect(TravelStyleChoiceEnum.DETAILED);
    }
  };

  const handleSkipChoice = () => {
    if (!disabled) {
      onChoiceSelect(TravelStyleChoiceEnum.SKIP);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-[#406170] to-[#2a4552] rounded-[36px] p-8 text-white ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-raleway uppercase tracking-wide mb-3">
          NOW YOU HAVE A CHOICE:
        </h2>
        <p className="text-base font-raleway opacity-90 max-w-2xl mx-auto">
          Choose how you'd like us to customize your itinerary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Button 1: Detailed Style - Same style as GenerateItineraryButton */}
        <button
          onClick={handleDetailedChoice}
          disabled={disabled}
          role="button"
          aria-label="Choose detailed travel style preferences for personalized itinerary"
          className={`
            relative group px-12 py-6 rounded-[20px] font-bold font-raleway text-xl
            transition-all duration-300 transform hover:scale-105
            ${disabled 
              ? 'bg-white/20 text-white/60 cursor-not-allowed border-4 border-white/20' 
              : 'bg-[#b0c29b] text-white hover:shadow-2xl hover:shadow-white/30 border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]'
            }
          `}
        >
          <div className="flex flex-col items-center space-y-3">
            <Sparkles className="h-6 w-6" />
            <span className="text-center leading-tight">
              Answer 4 more questions
            </span>
            <div className="text-sm font-normal opacity-80 max-w-xs">
              to get the most personalized itinerary possible
            </div>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Recommended
            </span>
          </div>

          {/* Animated background effect on hover */}
          {!disabled && (
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          )}
        </button>

        {/* Button 2: Skip to Generate - Same style as Generate button */}
        <button
          onClick={handleSkipChoice}
          disabled={disabled}
          role="button"
          aria-label="Skip ahead to trip nickname and generate itinerary quickly"
          className={`
            relative group px-12 py-6 rounded-[20px] font-bold font-raleway text-xl
            transition-all duration-300 transform hover:scale-105
            ${disabled 
              ? 'bg-white/20 text-white/60 cursor-not-allowed border-4 border-white/20' 
              : 'bg-white text-primary hover:shadow-2xl hover:shadow-white/30 border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)]'
            }
          `}
        >
          <div className="flex flex-col items-center space-y-3">
            <FastForward className="h-6 w-6" />
            <span className="text-center leading-tight">
              Skip ahead
            </span>
            <div className="text-sm font-normal opacity-80 max-w-xs">
              to an itinerary based on what I've already answered
            </div>
          </div>

          {/* Animated background effect on hover */}
          {!disabled && (
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-cyan-600/20 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          )}
        </button>
      </div>
    </div>
  );
};

export default TravelStyleChoice;