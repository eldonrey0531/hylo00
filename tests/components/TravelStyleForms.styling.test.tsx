/**
 * Form Background Preservation Contract Tests
 * Feature: 004-fix-travel-style
 * 
 * Tests for travel style form components to validate #ece8de background preservation
 * These forms render as button collections with individual styling rather than container wrappers
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TravelExperience from '../../src/components/travel-style/TravelExperience';
import TripVibe from '../../src/components/travel-style/TripVibe';
import SampleDays from '../../src/components/travel-style/SampleDays';
import DinnerChoice from '../../src/components/travel-style/DinnerChoice';
import TripNickname from '../../src/components/travel-style/TripNickname';
import { DESIGN_TOKENS } from '../utils/styling-helpers';

// Mock props for each form component with correct interfaces
const travelExperienceProps = {
  selectedExperience: [],
  onSelectionChange: () => {},
};

const tripVibeProps = {
  selectedVibes: [],
  onSelectionChange: () => {},
  otherText: '',
  onOtherTextChange: () => {},
};

const sampleDaysProps = {
  selectedDays: [],
  onSelectionChange: () => {},
};

const dinnerChoiceProps = {
  selectedChoice: [],
  onSelectionChange: () => {},
};

const tripNicknameProps = {
  tripNickname: '',
  onNicknameChange: () => {},
  contactInfo: {},
  onContactChange: () => {},
};

describe('T005: Travel Style Form Background Preservation', () => {
  describe('TravelExperience Form', () => {
    it('should use #ece8de background for unselected buttons', () => {
      render(<TravelExperience {...travelExperienceProps} />);
      
      // Find buttons with the form background color
      const unselectedButtons = document.querySelectorAll('button');
      expect(unselectedButtons.length).toBeGreaterThan(0);
      
      // All buttons should be unselected and have the correct background
      unselectedButtons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });

    it('should NEVER use problematic backgrounds when unselected', () => {
      render(<TravelExperience {...travelExperienceProps} />);
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        // When unselected, should use form background, not primary
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });

    it('should maintain form background inside bg-trip-details container', () => {
      const { container } = render(
        <div className="bg-trip-details">
          <TravelExperience {...travelExperienceProps} />
        </div>
      );

      const parentContainer = container.querySelector('.bg-trip-details');
      const buttons = container.querySelectorAll('button');
      
      expect(parentContainer).toHaveClass('bg-trip-details');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
      });
    });
  });

  describe('TripVibe Form', () => {
    it('should use #ece8de background for unselected buttons', () => {
      render(<TripVibe {...tripVibeProps} />);
      
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });

    it('should NEVER use bg-primary when unselected', () => {
      render(<TripVibe {...tripVibeProps} />);
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });

    it('should preserve form styling in trip details context', () => {
      const { container } = render(
        <div className="bg-trip-details">
          <TripVibe {...tripVibeProps} />
        </div>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
      });
    });
  });

  describe('SampleDays Form', () => {
    it('should use #ece8de background for unselected buttons', () => {
      render(<SampleDays {...sampleDaysProps} />);
      
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });

    it('should NEVER use bg-primary when unselected', () => {
      render(<SampleDays {...sampleDaysProps} />);
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });
  });

  describe('DinnerChoice Form', () => {
    it('should use #ece8de background for unselected buttons', () => {
      render(<DinnerChoice {...dinnerChoiceProps} />);
      
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });

    it('should NEVER use bg-primary when unselected', () => {
      render(<DinnerChoice {...dinnerChoiceProps} />);
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
    });
  });

  describe('TripNickname Form', () => {
    it('should use proper form background colors', () => {
      render(<TripNickname {...tripNicknameProps} />);
      
      // Trip nickname input should have white background
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      expect(inputs.length).toBeGreaterThan(0);
      
      inputs.forEach(input => {
        expect(input.className).toContain('bg-white');
      });
    });

    it('should use #ece8de background for form elements when appropriate', () => {
      render(<TripNickname {...tripNicknameProps} />);
      
      // Toggle switch should use #ece8de in unselected state (default)
      // Look for elements with the specific background color class
      const container = document.body;
      const htmlContent = container.innerHTML;
      
      // Check that the component contains the #ece8de color reference
      expect(htmlContent).toContain('#ece8de');
    });

    it('should NEVER use problematic backgrounds inappropriately', () => {
      render(<TripNickname {...tripNicknameProps} />);
      
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      inputs.forEach(input => {
        expect(input.className).not.toContain('bg-primary');
      });
    });
  });

  describe('Cross-Form Background Consistency', () => {
    it('should have consistent #ece8de usage across button-based forms', () => {
      // Test TravelExperience
      const { container: container1, unmount: unmount1 } = render(<TravelExperience {...travelExperienceProps} />);
      let buttons = container1.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
      unmount1();

      // Test TripVibe
      const { container: container2, unmount: unmount2 } = render(<TripVibe {...tripVibeProps} />);
      buttons = container2.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
      unmount2();

      // Test SampleDays
      const { container: container3, unmount: unmount3 } = render(<SampleDays {...sampleDaysProps} />);
      buttons = container3.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
      unmount3();

      // Test DinnerChoice
      const { container: container4, unmount: unmount4 } = render(<DinnerChoice {...dinnerChoiceProps} />);
      buttons = container4.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
      unmount4();
    });

    it('should maintain color hierarchy: section bg → form bg', () => {
      // Test the proper nesting of bg-trip-details → form elements with correct colors
      const { container } = render(
        <div className="bg-trip-details">
          <TravelExperience {...travelExperienceProps} />
        </div>
      );

      const sectionContainer = container.querySelector('.bg-trip-details');
      const buttons = container.querySelectorAll('button');
      
      expect(sectionContainer).toHaveClass('bg-trip-details');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Verify buttons use correct form background color
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
      });
      
      // Verify no problematic backgrounds in the tree
      const primaryBgElements = container.querySelectorAll('.bg-primary');
      // Note: bg-primary is allowed for selected states, but we're testing unselected here
      expect(primaryBgElements.length).toBe(0);
    });

    it('should validate design token color values', () => {
      // Ensure our design tokens match the requirement colors
      expect(DESIGN_TOKENS['bg-trip-details']).toBe('#b0c29b');
      expect(DESIGN_TOKENS['bg-form-box']).toBe('#ece8de');
      expect(DESIGN_TOKENS['forbidden-bg']).toBe('#406170'); // Forbidden color for containers
    });
  });

  describe('Form Background Visual Integration', () => {
    it('should have proper contrast between section and form backgrounds', () => {
      const { container } = render(
        <div className="bg-trip-details p-4">
          <TravelExperience {...travelExperienceProps} />
        </div>
      );

      const sectionBg = container.querySelector('.bg-trip-details');
      const buttons = container.querySelectorAll('button');
      
      expect(sectionBg).toHaveClass('bg-trip-details');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Form elements should have distinct background from section
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-trip-details');
      });
    });

    it('should follow the required styling pattern from specifications', () => {
      // From specs: Travel style section MUST have bg-trip-details
      // All forms MUST maintain #ece8de backgrounds
      // NO #406170 backgrounds anywhere in travel style content when unselected

      const { container } = render(
        <div className="bg-trip-details">
          <TravelExperience {...travelExperienceProps} />
          <TripVibe {...tripVibeProps} />
          <SampleDays {...sampleDaysProps} />
        </div>
      );

      // Validate section background
      const section = container.querySelector('.bg-trip-details');
      expect(section).toHaveClass('bg-trip-details');
      
      // Validate form backgrounds
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.className).toContain('bg-[#ece8de]');
        expect(button.className).not.toContain('bg-primary');
      });
      
      // Validate no forbidden backgrounds (all buttons should be unselected)
      const primaryElements = container.querySelectorAll('button.bg-primary');
      expect(primaryElements.length).toBe(0);
    });
  });
});