/**
 * Container Styling Contract Tests
 *  it('should have bg-trip-details backgrou  it('should maintain bg  it('should maintain bg-trip-details ba      const container     const container =    const header     // Initia    container = screen.ge    const travelSt    const container = screen.getByText(/TRAVEL STYLE/i).closest('div');
    const header = screen.getByText(/TRAVEL STYLE/i);eSection = screen.getByText(/TRAVEL STYLE/i).closest('div');ByText(/TRAVEL STYLE/i).closest('div');   container = screen.getByText(/TRAVEL STYLE/i).closest('div'); state
    let container = screen.getByText(/TRAVEL STYLE/i).closest('div');screen.getByText(/TRAVEL STYLE/i);screen.getByText(/TRAVEL STYLE/i).closest('div');
    
    // Should have the required styling classes
    expect(container).toHaveClass('bg-trip-details');reen.getByText(/TRAVEL STYLE/i).closest('div');
      expect(container).not.toHaveClass('bg-primary');ground in SKIP state', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.SKIP}
        {...mockProps}
      />
    );

    const container = screen.getByText(/TRAVEL STYLE/i).closest('div');
    expect(container).toHaveClass('bg-trip-details');
    expect(container).not.toHaveClass('bg-primary');
  });s background in DETAILED state', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.DETAILED}
        {...mockProps}
      />
    );

    const container = screen.getByText(/TRAVEL STYLE/i).closest('div');
    expect(container).toHaveClass('bg-trip-details');
    expect(container).not.toHaveClass('bg-primary');
  });LECTED state', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.NOT_SELECTED}
        {...mockProps}
      />
    );

    const container = screen.getByText(/TRAVEL STYLE/i).closest('div');
    expect(container).toHaveClass('bg-trip-details');
    
    // Should NOT have the forbidden background color
    expect(container).not.toHaveClass('bg-primary');
  });fix-travel-style
 * 
 * Tests for ConditionalTravelStyle container background styling
 * Validates bg-trip-details background usage and #406170 exclusion
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConditionalTravelStyle from '../../src/components/ConditionalTravelStyle';
import { TravelStyleChoice } from '../../src/types/travel-style-choice';

// Mock form data for testing
const mockFormData = {
  location: 'Test Location',
  departDate: '2025-09-25',
  returnDate: '2025-10-02',
  flexibleDates: false,
  adults: 2,
  children: 0,
  childrenAges: [],
  budget: 5000,
  currency: 'USD',
  flexibleBudget: false,
  travelStyleChoice: 'not-selected',
  travelStyleAnswers: {},
  selectedGroups: [],
  selectedInterests: [],
  selectedInclusions: [],
  customGroupText: '',
  customInterestsText: '',
  customInclusionsText: '',
  inclusionPreferences: {},
};

const mockProps = {
  formData: mockFormData,
  onFormChange: () => {},
  onChoiceChange: () => {},
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
  disabled: false,
};

describe('ConditionalTravelStyle Container Styling', () => {
  it('should have bg-trip-details background in NOT_SELECTED state', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.NOT_SELECTED}
        {...mockProps}
      />
    );

    const container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    expect(container).toHaveClass('bg-trip-details');
    
    // Should NOT have the forbidden background color
    expect(container).not.toHaveClass('bg-primary');
  });

  it('should maintain bg-trip-details background in DETAILED state', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.DETAILED}
        {...mockProps}
      />
    );

    const container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    expect(container).toHaveClass('bg-trip-details');
    expect(container).not.toHaveClass('bg-primary');
  });

  it('should maintain bg-trip-details background in SKIP state', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.SKIP}
        {...mockProps}
      />
    );

    const container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    expect(container).toHaveClass('bg-trip-details');
    expect(container).not.toHaveClass('bg-primary');
  });

  it('should NEVER have bg-primary (#406170) background', () => {
    // Test all states to ensure no #406170 background usage
    const states = [
      TravelStyleChoice.NOT_SELECTED,
      TravelStyleChoice.DETAILED,
      TravelStyleChoice.SKIP
    ];

    states.forEach(choice => {
      const { unmount } = render(
        <ConditionalTravelStyle
          choice={choice}
          {...mockProps}
        />
      );

      const container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
      expect(container).not.toHaveClass('bg-primary');
      
      // Test computed styles if available
      if (container) {
        const computedStyle = getComputedStyle(container);
        expect(computedStyle.backgroundColor).not.toBe('rgb(64, 97, 112)'); // #406170 converted
      }
      
      unmount();
    });
  });

  it('should have proper container styling structure', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.NOT_SELECTED}
        {...mockProps}
      />
    );

    const container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    
    // Should have the required styling classes
    expect(container).toHaveClass('bg-trip-details');
    
    // Should have proper border radius and padding (from design specs)
    expect(container).toHaveClass('rounded-[36px]');
    expect(container).toHaveClass('p-6');
  });

  it('should have travel style header with proper text styling', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.NOT_SELECTED}
        {...mockProps}
      />
    );

    const header = screen.getByText('ðŸŒ TRAVEL STYLE');
    
    // Should use primary text color
    expect(header).toHaveClass('text-primary');
    expect(header).toHaveClass('font-raleway');
    expect(header).toHaveClass('font-bold');
  });

  it('should maintain background styling across state transitions', () => {
    // This test simulates state changes to ensure background persists
    const { rerender } = render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.NOT_SELECTED}
        {...mockProps}
      />
    );

    // Initial state
    let container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    expect(container).toHaveClass('bg-trip-details');

    // Change to DETAILED
    rerender(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.DETAILED}
        {...mockProps}
      />
    );
    
    container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    expect(container).toHaveClass('bg-trip-details');

    // Change to SKIP
    rerender(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.SKIP}
        {...mockProps}
      />
    );
    
    container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    expect(container).toHaveClass('bg-trip-details');
  });
});

describe('Travel Style Section Visual Integration', () => {
  it('should match trip details section background styling pattern', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.NOT_SELECTED}
        {...mockProps}
      />
    );

    const travelStyleSection = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    
    // Should use the same background class as trip details
    expect(travelStyleSection).toHaveClass('bg-trip-details');
    
    // Should follow the same styling pattern
    expect(travelStyleSection).toHaveClass('rounded-[36px]');
    expect(travelStyleSection).toHaveClass('p-6');
  });

  it('should have proper visual hierarchy with readable text contrast', () => {
    render(
      <ConditionalTravelStyle
        choice={TravelStyleChoice.NOT_SELECTED}
        {...mockProps}
      />
    );

    const container = screen.getByText('ðŸŒ TRAVEL STYLE').closest('.bg-trip-details');
    const header = screen.getByText('ðŸŒ TRAVEL STYLE');
    
    // Container should have yellow background
    expect(container).toHaveClass('bg-trip-details');
    
    // Text should have proper contrast color
    expect(header).toHaveClass('text-primary');
  });
});

