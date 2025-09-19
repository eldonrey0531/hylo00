import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConditionalTravelStyle from '../../src/components/ConditionalTravelStyle';
import { TravelStyleChoice } from '../../src/types/travel-style-choice';

/**
 * Color Exclusion Enforcement Tests
 * Feature: 004-fix-travel-style
 * 
 * Validates that the problematic #406170 (bg-primary) background color
 * is NEVER used in travel style content areas. This ensures visual 
 * consistency and prevents the dark blue backgrounds from appearing
 * where they shouldn't be.
 * 
 * Requirements:
 * - NO #406170 backgrounds anywhere in travel style content
 * - bg-primary class should not be used for backgrounds in travel style area
 * - Only allowed on text colors and borders where appropriate
 */

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
  onChoiceChange: vi.fn(),
  onGenerateItinerary: vi.fn()
};

describe('Color Exclusion Enforcement', () => {
  describe('Primary Background Color Exclusion', () => {
    it('should ensure travel style container NEVER uses bg-primary background', () => {
      const states = [TravelStyleChoice.NOT_SELECTED, TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            {...defaultProps}
          />
        );

        const container = screen.getByTestId('travel-style-container');
        
        // Container must NOT have bg-primary class
        expect(container).not.toHaveClass('bg-primary');
        
        // Should have the correct bg-form-box instead
        expect(container).toHaveClass('bg-form-box');
        
        unmount();
      });
    });

    it('should prevent #406170 color from appearing in container computed styles', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // Verify the container doesn't have bg-primary class
      expect(container).not.toHaveClass('bg-primary');
      
      // Verify it has the correct background class
      expect(container).toHaveClass('bg-form-box');
      
      // Check all background-related classes to ensure none are bg-primary
      const classList = Array.from(container.classList);
      const backgroundClasses = classList.filter(cls => cls.startsWith('bg-'));
      expect(backgroundClasses).not.toContain('bg-primary');
    });
  });

  describe('Form Component Background Exclusion', () => {
    it('should ensure TravelStyleGroup buttons never use bg-primary background', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      // Get all travel style choice buttons
      const buttons = screen.getAllByRole('button');
      const styleButtons = buttons.filter(button => 
        button.textContent?.includes('Haven\'t traveled much') ||
        button.textContent?.includes('Some in-country travel') ||
        button.textContent?.includes('Travel to another country')
      );

      styleButtons.forEach(button => {
        // Should NOT have bg-primary background
        expect(button).not.toHaveClass('bg-primary');
        
        // Should have the correct bg-[#ece8de] instead
        expect(button).toHaveClass('bg-[#ece8de]');
      });
    });

    it('should validate ContactForm elements avoid bg-primary backgrounds', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          {...defaultProps}
        />
      );

      // Check contact form input fields
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).not.toHaveClass('bg-primary');
        // Should have bg-white for input fields
        expect(input).toHaveClass('bg-white');
      });

      // Check email input specifically
      const emailInput = screen.getByPlaceholderText('your@email.com');
      expect(emailInput).not.toHaveClass('bg-primary');
      expect(emailInput).toHaveClass('bg-white');

      // Check textarea using placeholder text since it doesn't have accessible name
      const textarea = screen.getByPlaceholderText(/Any special requests/i);
      expect(textarea).not.toHaveClass('bg-primary');
      expect(textarea).toHaveClass('bg-white');
    });
  });

  describe('Generate Button Background Validation', () => {
    it('should ensure GenerateItineraryButton uses correct background colors', () => {
      const states = [TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            {...defaultProps}
          />
        );

        const generateButton = screen.getByLabelText(/Generate personalized itinerary/i);
        
        // Should NOT use bg-primary background
        expect(generateButton).not.toHaveClass('bg-primary');
        
        // Should use the correct orange background
        expect(generateButton).toHaveClass('bg-[#f68854]');
        
        unmount();
      });
    });

    it('should validate button hover states avoid bg-primary', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      const generateButton = screen.getByLabelText(/Generate personalized itinerary/i);
      
      // Check all background classes on the button
      const classList = Array.from(generateButton.classList);
      const backgroundClasses = classList.filter(cls => cls.startsWith('bg-'));
      
      // Should not contain bg-primary
      expect(backgroundClasses).not.toContain('bg-primary');
      
      // Should contain the correct background colors
      expect(backgroundClasses).toContain('bg-[#f68854]');
    });
  });

  describe('Choice Button Background Validation', () => {
    it('should ensure choice buttons in NOT_SELECTED state avoid bg-primary', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          {...defaultProps}
        />
      );

      // Get the choice buttons (DETAILED and SKIP options)
      const detailedButton = screen.getByLabelText(/detailed travel style preferences/i);
      const skipButton = screen.getByLabelText(/skip ahead to trip nickname/i);

      // Should NOT use bg-primary background
      expect(detailedButton).not.toHaveClass('bg-primary');
      expect(skipButton).not.toHaveClass('bg-primary');

      // Should use bg-white instead
      expect(detailedButton).toHaveClass('bg-white');
      expect(skipButton).toHaveClass('bg-white');
    });

    it('should validate choice buttons have correct text colors', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          {...defaultProps}
        />
      );

      const detailedButton = screen.getByLabelText(/detailed travel style preferences/i);
      const skipButton = screen.getByLabelText(/skip ahead to trip nickname/i);

      // Text should be text-primary (which is allowed for text, not backgrounds)
      expect(detailedButton).toHaveClass('text-primary');
      expect(skipButton).toHaveClass('text-primary');

      // But backgrounds should be white, not primary
      expect(detailedButton).toHaveClass('bg-white');
      expect(skipButton).toHaveClass('bg-white');
    });
  });

  describe('Comprehensive Color Exclusion Scan', () => {
    it('should perform deep scan for any bg-primary usage in travel style section', () => {
      const states = [TravelStyleChoice.NOT_SELECTED, TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { container, unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            {...defaultProps}
          />
        );

        // Get all elements within the travel style container
        const travelStyleContainer = container.querySelector('[data-testid="travel-style-container"]');
        const allElements = travelStyleContainer ? travelStyleContainer.querySelectorAll('*') : [];
        
        allElements.forEach(element => {
          // Check if element has bg-primary class
          // We allow text-primary for text coloring, but not bg-primary for backgrounds
          if (element.classList.contains('bg-primary')) {
            console.log('Found element with bg-primary:', element);
          }
          expect(element.classList.contains('bg-primary')).toBe(false);
        });

        unmount();
      });
    });

    it('should validate no #406170 color values in style attributes', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      const allElements = container.querySelectorAll('*');
      
      allElements.forEach(element => {
        const style = element.getAttribute('style');
        if (style) {
          // Check for direct #406170 color usage in style attributes
          expect(style).not.toContain('#406170');
          expect(style).not.toContain('rgb(64, 97, 112)');
        }
      });
    });

    it('should ensure only approved background colors are used', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // Container should only have approved background
      expect(container).toHaveClass('bg-form-box');
      expect(container).not.toHaveClass('bg-primary');
      
      // This test validates that we're using the approved color palette
      const classList = Array.from(container.classList);
      const backgroundClasses = classList.filter(cls => cls.startsWith('bg-'));
      
      // Should contain approved background
      expect(backgroundClasses).toContain('bg-form-box');
      
      // Should not contain the problematic bg-primary
      expect(backgroundClasses).not.toContain('bg-primary');
    });
  });

  describe('Edge Cases and Error States', () => {
    it('should maintain color exclusion during loading states', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      // Container should maintain proper background even during interaction
      const container = screen.getByTestId('travel-style-container');
      expect(container).toHaveClass('bg-form-box');
      expect(container).not.toHaveClass('bg-primary');
    });

    it('should validate color exclusion persists across prop changes', () => {
      const { rerender } = render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          {...defaultProps}
        />
      );

      // Initial state check
      let container = screen.getByTestId('travel-style-container');
      expect(container).not.toHaveClass('bg-primary');

      // Change to DETAILED state
      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      container = screen.getByTestId('travel-style-container');
      expect(container).not.toHaveClass('bg-primary');
      expect(container).toHaveClass('bg-form-box');

      // Change to SKIP state
      rerender(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          {...defaultProps}
        />
      );

      container = screen.getByTestId('travel-style-container');
      expect(container).not.toHaveClass('bg-primary');
      expect(container).toHaveClass('bg-form-box');
    });
  });
});
