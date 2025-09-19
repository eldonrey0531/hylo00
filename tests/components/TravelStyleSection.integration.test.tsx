/**
 * Travel Style Section Visual Integration Tests
 * Feature: 004-fix-travel-style
 * 
 * Visual integration tests ensuring the complete travel style section
 * works correctly across all states with proper styling and behavior.
 * 
 * Tests the integration between ConditionalTravelStyle and its child components
 * to validate the complete user experience and visual consistency.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConditionalTravelStyle from '../../src/components/ConditionalTravelStyle';
import { TravelStyleChoice } from '../../src/types/travel-style-choice';

// Mock form data for testing
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

const defaultProps = {
  formData: mockFormData,
  onFormChange: vi.fn(),
  selectedExperience: [],
  onExperienceChange: vi.fn(),
  selectedVibes: [],
  onVibeChange: vi.fn(),
  customVibesText: '',
  onCustomVibesChange: vi.fn(),
  selectedSampleDays: [],
  onSampleDaysChange: vi.fn(),
  dinnerChoices: [],
  onDinnerChoicesChange: vi.fn(),
  tripNickname: '',
  onTripNicknameChange: vi.fn(),
  contactInfo: {},
  onContactChange: vi.fn(),
  disabled: false,
};

describe('Travel Style Section Visual Integration', () => {
  describe('Container Visual Hierarchy', () => {
    it('should display travel style header with proper visual hierarchy in all states', () => {
      const states = [
        TravelStyleChoice.NOT_SELECTED,
        TravelStyleChoice.DETAILED,
        TravelStyleChoice.SKIP
      ];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            onChoiceChange={vi.fn()}
            {...defaultProps}
          />
        );

        // Travel style container should always be present with consistent styling
        const container = screen.getByTestId('travel-style-container');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('bg-trip-details');
        expect(container).toHaveClass('text-primary');
        expect(container).toHaveClass('rounded-[36px]');

        // Header should be consistently styled across all states
        // Use getByRole to find the main heading specifically
        const header = screen.getByRole('heading', { name: /\?\? TRAVEL STYLE/i });
        expect(header).toBeInTheDocument();

        unmount();
      });
    });

    it('should maintain consistent spacing and layout structure', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          onChoiceChange={vi.fn()}
          {...defaultProps}
        />
      );

      // Main container should have space-y-8 for consistent spacing
      const mainContainer = screen.getByTestId('travel-style-container').parentElement;
      expect(mainContainer).toHaveClass('space-y-8');

      // Container should use consistent margin classes
      const styledContainer = screen.getByTestId('travel-style-container');
      expect(styledContainer).toHaveClass('-mx-4', 'sm:-mx-6', 'lg:-mx-8', '2xl:-mx-16');
    });
  });

  describe('State Transition Visual Behavior', () => {
    it('should smoothly transition between NOT_SELECTED and DETAILED states', () => {
      const onChoiceChange = vi.fn();
      const { rerender } = render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          onChoiceChange={onChoiceChange}
          {...defaultProps}
        />
      );

      // Should show choice buttons in NOT_SELECTED state
      expect(screen.getByText(/I want to add answer more forms/i)).toBeInTheDocument();
      expect(screen.getByText(/Skip ahead/i)).toBeInTheDocument();

      // Transition to DETAILED state
      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={onChoiceChange}
          onGenerateItinerary={vi.fn()}
          isGenerating={false}
          {...defaultProps}
        />
      );

      // Should now show travel style forms
      expect(screen.getByText(/Travel Style Preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/GENERATE MY PERSONALIZED ITINERARY/i)).toBeInTheDocument();
    });

    it('should smoothly transition between NOT_SELECTED and SKIP states', () => {
      const onChoiceChange = vi.fn();
      const { rerender } = render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          onChoiceChange={onChoiceChange}
          {...defaultProps}
        />
      );

      // Should show choice buttons in NOT_SELECTED state
      expect(screen.getByText(/I want to add answer more forms/i)).toBeInTheDocument();

      // Transition to SKIP state
      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          onChoiceChange={onChoiceChange}
          onGenerateItinerary={vi.fn()}
          isGenerating={false}
          {...defaultProps}
        />
      );

      // Should show contact form and generate button
      expect(screen.getByText(/GENERATE MY PERSONALIZED ITINERARY/i)).toBeInTheDocument();
    });
  });

  describe('Background Color Consistency', () => {
    it('should maintain bg-trip-details background across all states', () => {
      const states = [
        TravelStyleChoice.NOT_SELECTED,
        TravelStyleChoice.DETAILED,
        TravelStyleChoice.SKIP
      ];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            onChoiceChange={vi.fn()}
            onGenerateItinerary={vi.fn()}
            {...defaultProps}
          />
        );

        const container = screen.getByTestId('travel-style-container');
        expect(container).toHaveClass('bg-trip-details');
        expect(container).not.toHaveClass('bg-primary');

        unmount();
      });
    });

    it('should ensure form components use correct background colors', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={vi.fn()}
          onGenerateItinerary={vi.fn()}
          {...defaultProps}
        />
      );

      // Check that form buttons have the correct background
      const formButtons = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('Haven\'t traveled much') ||
        button.textContent?.includes('Some in-country travel')
      );

      formButtons.forEach(button => {
        expect(button).toHaveClass('bg-[#ece8de]');
        expect(button).not.toHaveClass('bg-primary');
      });
    });
  });

  describe('Button Integration Visual Tests', () => {
    it('should display generation button with consistent styling in DETAILED state', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={vi.fn()}
          onGenerateItinerary={vi.fn()}
          isGenerating={false}
          {...defaultProps}
        />
      );

      const generateButton = screen.getByText(/GENERATE MY PERSONALIZED ITINERARY/i);
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).toHaveClass('font-bold', 'font-raleway');
    });

    it('should display generation button with consistent styling in SKIP state', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          onChoiceChange={vi.fn()}
          onGenerateItinerary={vi.fn()}
          isGenerating={false}
          {...defaultProps}
        />
      );

      const generateButton = screen.getByText(/GENERATE MY PERSONALIZED ITINERARY/i);
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).toHaveClass('font-bold', 'font-raleway');
    });

    it('should handle loading state visual feedback correctly', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={vi.fn()}
          onGenerateItinerary={vi.fn()}
          isGenerating={true}
          {...defaultProps}
        />
      );

      // Should maintain proper visual structure during loading
      const container = screen.getByTestId('travel-style-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('bg-trip-details');
    });
  });

  describe('Responsive Design Integration', () => {
    it('should apply responsive margin classes correctly', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          onChoiceChange={vi.fn()}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // Should have responsive margin classes for full-width styling
      expect(container).toHaveClass('-mx-4');
      expect(container).toHaveClass('sm:-mx-6');
      expect(container).toHaveClass('lg:-mx-8');
      expect(container).toHaveClass('2xl:-mx-16');
    });

    it('should maintain proper padding and shadow classes', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={vi.fn()}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      expect(container).toHaveClass('p-6');
      expect(container).toHaveClass('shadow-lg');
      expect(container).toHaveClass('rounded-[36px]');
    });
  });

  describe('Content Integration', () => {
    it('should display proper descriptive text for each state', () => {
      // NOT_SELECTED state
      const { rerender } = render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          onChoiceChange={vi.fn()}
          {...defaultProps}
        />
      );

      expect(screen.getByText(/Help us create the perfect itinerary by sharing your travel preferences/i)).toBeInTheDocument();

      // DETAILED state
      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={vi.fn()}
          onGenerateItinerary={vi.fn()}
          {...defaultProps}
        />
      );

      expect(screen.getByText(/Help us create the perfect itinerary by sharing your travel preferences/i)).toBeInTheDocument();

      // SKIP state
      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          onChoiceChange={vi.fn()}
          onGenerateItinerary={vi.fn()}
          {...defaultProps}
        />
      );

      expect(screen.getByText(/Help us create the perfect itinerary by sharing your travel preferences/i)).toBeInTheDocument();
    });

    it('should properly integrate with child components', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          onChoiceChange={vi.fn()}
          onGenerateItinerary={vi.fn()}
          {...defaultProps}
        />
      );

      // Should contain travel style group content
      expect(screen.getByText(/Travel Style Preferences/i)).toBeInTheDocument();
      
      // Should contain contact form elements
      expect(screen.getByText(/Contact Information/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain proper ARIA structure across states', () => {
      const states = [TravelStyleChoice.NOT_SELECTED, TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            onChoiceChange={vi.fn()}
            onGenerateItinerary={vi.fn()}
            {...defaultProps}
          />
        );

        // Main container should have proper test ID for accessibility
        expect(screen.getByTestId('travel-style-container')).toBeInTheDocument();

        // Header should be properly structured
        const header = screen.getByRole('heading', { name: /\?\? TRAVEL STYLE/i });
        expect(header.tagName).toBe('H2');

        unmount();
      });
    });
  });
});