/**
 * GenerateItineraryButton Duplication Prevention Tests
 * Feature: 004-fix-travel-style
 * 
 * Contract tests ensuring exactly one GenerateItineraryButton per page.
 * Tests the architecture refactor where ConditionalTravelStyle manages
 * its own button instead of having duplicates.
 * 
 * Architecture: App.tsx no longer has GenerateItineraryButton.
 * Only ConditionalTravelStyle shows buttons in DETAILED and SKIP states
 * when onGenerateItinerary prop is provided.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConditionalTravelStyle from '../../src/components/ConditionalTravelStyle';
import { TravelStyleChoice } from '../../src/types/travel-style-choice';

// Mock dependencies
const mockFormData = {
  location: 'Paris',
  departDate: '2024-06-01',
  returnDate: '2024-06-10',
  adults: 2,
  children: 0,
  budget: 5000,
  selectedGroups: [],
  selectedInterests: [],
  selectedInclusions: [],
  customGroupText: '',
  customInterestsText: '',
  customInclusionsText: '',
  inclusionPreferences: {}
};

const mockProps = {
  formData: mockFormData,
  onFormChange: () => {},
  selectedExperience: [],
  onExperienceChange: () => {},
  selectedVibes: [],
  onVibeChange: () => {},
  customVibesText: '',
  onCustomVibesChange: () => {},
  selectedSampleDays: [],
  onSampleDaysChange: () => {},
  dinnerChoices: [],
  onDinnerChoicesChange: () => {},
  tripNickname: '',
  onTripNicknameChange: () => {},
  contactInfo: {},
  onContactChange: () => {},
};

// Utility to count GenerateItineraryButton instances
const countGenerateButtons = () => {
  const buttons = screen.queryAllByText(/generate.*itinerary/i);
  return buttons.length;
};

describe('GenerateItineraryButton Duplication Prevention', () => {
  describe('Contract: Exactly one button per state', () => {
    it('should show NO buttons in NOT_SELECTED state', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      const buttonCount = countGenerateButtons();
      expect(buttonCount).toBe(0);
    });

    it('should show EXACTLY ONE button in DETAILED state when onGenerateItinerary provided', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      const buttonCount = countGenerateButtons();
      expect(buttonCount).toBe(1);
    });

    it('should show EXACTLY ONE button in SKIP state when onGenerateItinerary provided', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      const buttonCount = countGenerateButtons();
      expect(buttonCount).toBe(1);
    });

    it('should show NO buttons when onGenerateItinerary prop is not provided', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      const buttonCount = countGenerateButtons();
      expect(buttonCount).toBe(0);
    });
  });

  describe('Architecture Validation', () => {
    it('should ensure ConditionalTravelStyle handles its own button lifecycle', () => {
      const mockGenerate = () => {};

      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={() => {}}
          onGenerateItinerary={mockGenerate}
          isGenerating={false}
          {...mockProps}
        />
      );

      const button = screen.queryByText(/generate.*itinerary/i);
      expect(button).toBeInTheDocument();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should pass through isGenerating state to button', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={true}
          {...mockProps}
        />
      );

      const button = screen.queryByText(/generating/i);
      expect(button).toBeInTheDocument();
    });
  });

  describe('Page-Level Duplication Prevention', () => {
    it('should never render multiple GenerateItineraryButtons simultaneously', () => {
      // Test rendering multiple states in different containers
      const { rerender } = render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      let buttonCount = countGenerateButtons();
      expect(buttonCount).toBe(1);

      // Rerender in SKIP state
      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      buttonCount = countGenerateButtons();
      expect(buttonCount).toBe(1);
    });

    it('should not create button duplication when switching states', () => {
      const { rerender } = render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      expect(countGenerateButtons()).toBe(0);

      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      expect(countGenerateButtons()).toBe(1);

      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          onChoiceChange={() => {}}
          onGenerateItinerary={() => {}}
          isGenerating={false}
          {...mockProps}
        />
      );

      expect(countGenerateButtons()).toBe(1);
    });
  });

  describe('Integration Contract', () => {
    it('should maintain consistent button behavior across all states', () => {
      const states = [TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(state => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={state}
            onChoiceChange={() => {}}
            onGenerateItinerary={() => {}}
            isGenerating={false}
            {...mockProps}
          />
        );

        const button = screen.queryByText(/generate.*itinerary/i);
        expect(button).toBeInTheDocument();
        expect(countGenerateButtons()).toBe(1);

        unmount();
      });
    });
  });
});
