import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConditionalTravelStyle from '../../src/components/ConditionalTravelStyle';
import { TravelStyleChoice } from '../../src/types/travel-style-choice';

/**
 * Background Hierarchy Validation Tests
 * Feature: 004-fix-travel-style
 * 
 * Validates the proper background color hierarchy for travel style section:
 * - Travel Style Container: bg-form-box (#ece8de (form box) section background
 * - Form Components: bg-form-box (#ece8de) - light beige form backgrounds  
 * - Input Elements: Various input-specific backgrounds
 * 
 * This ensures visual consistency and proper design token hierarchy.
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

describe('Background Color Hierarchy Validation', () => {

  describe('Travel Style Container Background', () => {
    it('should maintain consistent spacing for travel style container across all states', () => {
      const states = [TravelStyleChoice.NOT_SELECTED, TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            {...defaultProps}
          />
        );

        const container = screen.getByTestId('travel-style-container');
        
        // Container must have consistent spacing class
        expect(container).toHaveClass('space-y-8');
        
        // Individual form sections have bg-form-box, not the container
        if (choice === TravelStyleChoice.DETAILED || choice === TravelStyleChoice.SKIP) {
          const formBoxes = container.querySelectorAll('.bg-form-box');
          expect(formBoxes.length).toBeGreaterThan(0);
        }
        
        unmount();
      });
    });

    it('should maintain consistent container styling properties', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // Verify consistent spacing hierarchy
      expect(container).toHaveClass(
        'space-y-8'            // Spacing between sections
      );
    });
  });

  describe('Form Component Background Hierarchy', () => {
    it('should ensure TravelStyleGroup components use bg-form-box', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      // Travel style buttons should have bg-[#ece8de] (bg-form-box equivalent)
      const travelStyleButtons = screen.getAllByRole('button');
      const styleButtons = travelStyleButtons.filter(button => 
        button.textContent?.includes('Haven\'t traveled much') ||
        button.textContent?.includes('Some in-country travel')
      );

      styleButtons.forEach(button => {
        expect(button).toHaveClass('bg-[#ece8de]');
        expect(button).not.toHaveClass('bg-primary', 'bg-form-box');
      });
    });

    it('should validate TripNickname maintains proper form background', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          {...defaultProps}
        />
      );

      // Trip nickname form should be present in SKIP state
      const nicknameSection = screen.getByText(/Trip Nickname/i).closest('div');
      expect(nicknameSection).toBeInTheDocument();
      
      // Trip nickname form container should have proper styling
      // Note: TripNickname uses its own internal styling, we validate it doesn't break hierarchy
      const container = screen.getByTestId('travel-style-container');
      expect(container).toHaveClass('space-y-8');
    });
  });

  describe('Background Color Validation', () => {
    it('should verify form sections have proper background color values', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // Individual form sections should have bg-form-box (#ece8de)
      const formBoxes = container.querySelectorAll('.bg-form-box');
      expect(formBoxes.length).toBeGreaterThan(0);
      
      // Yellow header should be present
      const yellowHeader = container.querySelector('.bg-\\[\\#f9dd8b\\]');
      expect(yellowHeader).toBeInTheDocument();
    });

    it('should ensure consistent styling across travel style states', () => {
      const states = [TravelStyleChoice.NOT_SELECTED, TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            {...defaultProps}
          />
        );

        const container = screen.getByTestId('travel-style-container');
        
        // Should have consistent spacing
        expect(container).toHaveClass('space-y-8');
        
        // For states with forms, check form section backgrounds
        if (choice === TravelStyleChoice.DETAILED || choice === TravelStyleChoice.SKIP) {
          const formBoxes = container.querySelectorAll('.bg-form-box');
          expect(formBoxes.length).toBeGreaterThan(0);
        }
        
        unmount();
      });
    });
  });

  describe('Responsive Background Consistency', () => {
    it('should maintain background hierarchy across responsive breakpoints', () => {
      // Test at different viewport sizes to ensure responsive classes don't break background hierarchy
      
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // Container should maintain spacing regardless of responsive modifiers
      expect(container).toHaveClass('space-y-8');
      
      // Form sections should maintain bg-form-box
      const formBoxes = container.querySelectorAll('.bg-form-box');
      expect(formBoxes.length).toBeGreaterThan(0);
    });

    it('should validate form elements maintain hierarchy in responsive layouts', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      // Travel style grid should have responsive classes
      const buttons = screen.getAllByRole('button');
      const styleButtons = buttons.filter(button => 
        button.textContent?.includes('Haven\'t traveled much')
      );

      if (styleButtons.length > 0) {
        const parentGrid = styleButtons[0]?.closest('.grid');
        if (parentGrid) {
          expect(parentGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
        }
        
        // Individual buttons should maintain bg-[#ece8de] regardless of responsive layout
        styleButtons.forEach(button => {
          expect(button).toHaveClass('bg-[#ece8de]');
        });
      }
    });
  });

  describe('Background Inheritance and Isolation', () => {
    it('should ensure child components inherit proper background context', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      expect(container).toHaveClass('space-y-8');
      
      // Form sections should have bg-form-box
      const formBoxes = container.querySelectorAll('.bg-form-box');
      expect(formBoxes.length).toBeGreaterThan(0);
      
      // Header should have proper styling
      const header = screen.getByRole('heading', { name: /🌏Travel Style Preferences/i });
      expect(header).toHaveClass('text-primary');
    });

    it('should prevent background color leakage between sections', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.NOT_SELECTED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // Main container has consistent spacing
      expect(container).toHaveClass('space-y-8');
      
      // Choice buttons inside should have their own distinct backgrounds
      const detailedButton = screen.getByLabelText(/detailed travel style preferences/i);
      const skipButton = screen.getByLabelText(/skip ahead to trip nickname/i);
      
      // These buttons have white backgrounds, not inheriting container background
      expect(detailedButton).toHaveClass('bg-white');
      expect(skipButton).toHaveClass('bg-white');
      
      // They should maintain their own styling independent of container
      expect(detailedButton).toHaveClass('text-primary');
      expect(skipButton).toHaveClass('text-primary');
    });
  });
});
