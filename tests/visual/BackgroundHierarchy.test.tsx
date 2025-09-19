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
    it('should use bg-form-box for travel style container across all states', () => {
      const states = [TravelStyleChoice.NOT_SELECTED, TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            {...defaultProps}
          />
        );

        const container = screen.getByTestId('travel-style-container');
        
        // Container must have bg-form-box class (#ece8de)
        expect(container).toHaveClass('bg-form-box');
        
        // Should not have other background classes
        expect(container).not.toHaveClass('bg-primary', 'bg-form-box', 'bg-white');
        
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
      
      // Verify complete styling hierarchy
      expect(container).toHaveClass(
        'bg-form-box',     // Background color
        'text-primary',        // Text color
        'rounded-[36px]',      // Border radius
        'p-6',                 // Padding
        'shadow-lg'            // Shadow
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

    it('should validate ContactForm maintains proper form background', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.SKIP}
          {...defaultProps}
        />
      );

      // Contact form should be present in SKIP state
      const contactSection = screen.getByText(/Contact Information/i).closest('div');
      expect(contactSection).toBeInTheDocument();
      
      // Contact form container should have proper styling
      // Note: ContactForm uses its own internal styling, we validate it doesn't break hierarchy
      const container = screen.getByTestId('travel-style-container');
      expect(container).toHaveClass('bg-form-box');
    });
  });

  describe('Background Color Validation', () => {
    it('should verify exact background color values are applied', () => {
      render(
        <ConditionalTravelStyle
          choice={TravelStyleChoice.DETAILED}
          {...defaultProps}
        />
      );

      const container = screen.getByTestId('travel-style-container');
      
      // bg-form-box should resolve to #b0c29b (olive green)
      // Note: This test validates the CSS class is applied - actual color resolution
      // depends on Tailwind config, which we assume is correctly configured
      expect(container).toHaveClass('bg-form-box');
    });

    it('should ensure no conflicting background classes', () => {
      const states = [TravelStyleChoice.NOT_SELECTED, TravelStyleChoice.DETAILED, TravelStyleChoice.SKIP];

      states.forEach(choice => {
        const { unmount } = render(
          <ConditionalTravelStyle
            choice={choice}
            {...defaultProps}
          />
        );

        const container = screen.getByTestId('travel-style-container');
        
        // Should only have bg-form-box, not multiple background classes
        const classList = Array.from(container.classList);
        const backgroundClasses = classList.filter(cls => cls.startsWith('bg-'));
        
        expect(backgroundClasses).toContain('bg-form-box');
        expect(backgroundClasses).not.toContain('bg-primary');
        expect(backgroundClasses).not.toContain('bg-white');
        
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
      
      // Container should maintain bg-form-box regardless of responsive modifiers
      expect(container).toHaveClass('bg-form-box');
      
      // Should have responsive margin classes that don't interfere with background
      expect(container).toHaveClass('-mx-4', 'sm:-mx-6', 'lg:-mx-8', '2xl:-mx-16');
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
      expect(container).toHaveClass('bg-form-box');
      
      // Text should be properly colored for the background
      expect(container).toHaveClass('text-primary');
      
      // Header within container should inherit proper styling
      const header = screen.getByRole('heading', { name: /🌏 TRAVEL STYLE/i });
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
      
      // Main container has correct background
      expect(container).toHaveClass('bg-form-box');
      
      // Choice buttons inside should have their own distinct backgrounds
      const detailedButton = screen.getByLabelText(/detailed travel style preferences/i);
      const skipButton = screen.getByLabelText(/skip ahead to trip nickname/i);
      
      // These buttons have white backgrounds, not inheriting container background
      expect(detailedButton).toHaveClass('bg-white');
      expect(skipButton).toHaveClass('bg-white');
      
      // They should not inherit the container's bg-form-box
      expect(detailedButton).not.toHaveClass('bg-form-box');
      expect(skipButton).not.toHaveClass('bg-form-box');
    });
  });
});
