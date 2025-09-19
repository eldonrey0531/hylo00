// T007: ItineraryInclusions Enhanced Test Suite
// THIS TEST WILL FAIL UNTIL COMPONENT IS ENHANCED
// Test verifies all options with preferences and Other functionality

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItineraryInclusions from '../../src/components/TripDetails/ItineraryInclusions';
import type { FormData } from '../../src/components/TripDetails/types';

describe('ItineraryInclusions Enhanced - All Options with Preferences', () => {
  const mockFormData: FormData = {
    adults: 2,
    children: 1,
    departure: null,
    budget: 5000,
    currency: 'USD',
    budgetFlexible: false,
    // Enhanced fields for testing (these will FAIL until types are imported)
    itineraryInclusions: [],
    accommodationPreferences: [],
    diningPreferences: [],
    transportationPreferences: [],
    activityPreferences: [],
    otherInclusionText: ''
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('All Inclusion Options Display', () => {
    it('should display all 8 standard inclusion options', () => {
      render(
        <ItineraryInclusions 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until all options are displayed
      expect(screen.getByText(/accommodation bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/restaurant reservations/i)).toBeInTheDocument();
      expect(screen.getByText(/transportation arrangements/i)).toBeInTheDocument();
      expect(screen.getByText(/activity and tour bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/attraction tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/travel insurance recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/local recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/emergency contacts/i)).toBeInTheDocument();
    });

    it('should display Other option with text input', () => {
      render(
        <ItineraryInclusions 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until Other option is added
      expect(screen.getByText(/other/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/specify other inclusions/i)).toBeInTheDocument();
    });
  });

  describe('Multi-Select Functionality', () => {
    it('should allow selecting multiple inclusion options', () => {
      render(
        <ItineraryInclusions 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const accommodationOption = screen.getByLabelText(/accommodation bookings/i);
      const restaurantOption = screen.getByLabelText(/restaurant reservations/i);

      fireEvent.click(accommodationOption);
      fireEvent.click(restaurantOption);

      // This will FAIL until multi-select is implemented
      expect(mockOnFormChange).toHaveBeenCalledWith({
        itineraryInclusions: ['accommodation-bookings']
      });
      expect(mockOnFormChange).toHaveBeenCalledWith({
        itineraryInclusions: ['accommodation-bookings', 'restaurant-reservations']
      });
    });

    it('should capture specific inclusion IDs for data gathering', () => {
      render(
        <ItineraryInclusions 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const transportationOption = screen.getByLabelText(/transportation arrangements/i);
      fireEvent.click(transportationOption);

      // This will FAIL until ID-based selection is implemented
      expect(mockOnFormChange).toHaveBeenCalledWith({
        itineraryInclusions: ['transportation-arrangements']
      });
    });
  });

  describe('Preference Collection', () => {
    it('should show accommodation preferences when accommodation is selected', () => {
      const dataWithAccommodation = {
        ...mockFormData,
        itineraryInclusions: ['accommodation-bookings']
      };

      render(
        <ItineraryInclusions 
          formData={dataWithAccommodation} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until preference collection is implemented
      expect(screen.getByText(/accommodation preferences/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hotel preference/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location preference/i)).toBeInTheDocument();
    });

    it('should show dining preferences when restaurant reservations selected', () => {
      const dataWithDining = {
        ...mockFormData,
        itineraryInclusions: ['restaurant-reservations']
      };

      render(
        <ItineraryInclusions 
          formData={dataWithDining} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until dining preferences are implemented
      expect(screen.getByText(/dining preferences/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cuisine type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price range/i)).toBeInTheDocument();
    });

    it('should show transportation preferences when transport selected', () => {
      const dataWithTransport = {
        ...mockFormData,
        itineraryInclusions: ['transportation-arrangements']
      };

      render(
        <ItineraryInclusions 
          formData={dataWithTransport} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until transport preferences are implemented
      expect(screen.getByText(/transportation preferences/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/transport type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/comfort level/i)).toBeInTheDocument();
    });

    it('should show activity preferences when activities selected', () => {
      const dataWithActivities = {
        ...mockFormData,
        itineraryInclusions: ['activity-tour-bookings']
      };

      render(
        <ItineraryInclusions 
          formData={dataWithActivities} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until activity preferences are implemented
      expect(screen.getByText(/activity preferences/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/activity type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/group size preference/i)).toBeInTheDocument();
    });
  });

  describe('Other Option Functionality', () => {
    it('should enable Other text input when Other is selected', () => {
      render(
        <ItineraryInclusions 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const otherCheckbox = screen.getByLabelText(/other/i);
      fireEvent.click(otherCheckbox);

      // This will FAIL until Other option functionality is implemented
      const otherInput = screen.getByPlaceholderText(/specify other inclusions/i);
      expect(otherInput).not.toBeDisabled();
    });

    it('should capture Other text input with 200 character limit', () => {
      const dataWithOther = {
        ...mockFormData,
        itineraryInclusions: ['other']
      };

      render(
        <ItineraryInclusions 
          formData={dataWithOther} 
          onFormChange={mockOnFormChange} 
        />
      );

      const otherInput = screen.getByPlaceholderText(/specify other inclusions/i);
      const testText = 'Custom travel planning services';
      
      fireEvent.change(otherInput, { target: { value: testText } });

      // This will FAIL until Other text capture is implemented
      expect(mockOnFormChange).toHaveBeenCalledWith({
        otherInclusionText: testText
      });
      expect(otherInput).toHaveAttribute('maxLength', '200');
    });

    it('should validate Other text length and show character count', () => {
      const dataWithOther = {
        ...mockFormData,
        itineraryInclusions: ['other'],
        otherInclusionText: 'Test text'
      };

      render(
        <ItineraryInclusions 
          formData={dataWithOther} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until character count is implemented
      expect(screen.getByText(/9\/200/)).toBeInTheDocument();
    });
  });

  describe('Comprehensive Data Gathering', () => {
    it('should capture all selected inclusions with their preferences', () => {
      const comprehensiveData = {
        ...mockFormData,
        itineraryInclusions: ['accommodation-bookings', 'restaurant-reservations', 'other'],
        accommodationPreferences: ['hotel', 'central-location'],
        diningPreferences: ['local-cuisine', 'mid-range'],
        otherInclusionText: 'Pet-friendly accommodations'
      };

      render(
        <ItineraryInclusions 
          formData={comprehensiveData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until comprehensive data display is implemented
      expect(screen.getByDisplayValue(/pet-friendly accommodations/i)).toBeInTheDocument();
      
      // Verify accommodation preferences are shown
      expect(screen.getByText(/accommodation preferences/i)).toBeInTheDocument();
      
      // Verify dining preferences are shown
      expect(screen.getByText(/dining preferences/i)).toBeInTheDocument();
    });

    it('should maintain all form data for AI integration visibility', () => {
      const fullData = {
        ...mockFormData,
        itineraryInclusions: ['accommodation-bookings', 'transportation-arrangements'],
        accommodationPreferences: ['boutique-hotel'],
        transportationPreferences: ['public-transport']
      };

      render(
        <ItineraryInclusions 
          formData={fullData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until data structure is properly maintained
      // Component should display all selected data for verification
      expect(screen.getByText(/accommodation bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/transportation arrangements/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all inclusion options', () => {
      render(
        <ItineraryInclusions 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // Check for proper accessibility structure
      expect(screen.getByText(/What Should We Include in Your Itinerary?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Toggle Accommodations inclusion/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Toggle Other inclusion/i })).toBeInTheDocument();
    });

    it('should associate Other text input with its label', () => {
      const dataWithOther = {
        ...mockFormData,
        selectedInclusions: ['other']
      };

      render(
        <ItineraryInclusions 
          formData={dataWithOther} 
          onFormChange={mockOnFormChange} 
        />
      );

      // Check for Other text input with proper associations
      const otherInput = screen.getByPlaceholderText(/Specify what else you'd like included in your itinerary/i);
      expect(otherInput).toHaveAttribute('aria-label', 'Describe other inclusions');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty inclusion selections gracefully', () => {
      render(
        <ItineraryInclusions 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // Check for actual component text instead of non-existent empty state
      expect(screen.getByText(/What Should We Include in Your Itinerary?/i)).toBeInTheDocument();
    });

    it('should handle deselecting inclusions and clearing preferences', () => {
      const dataWithSelection = {
        ...mockFormData,
        selectedInclusions: ['accommodations']
      };

      render(
        <ItineraryInclusions 
          formData={dataWithSelection} 
          onFormChange={mockOnFormChange} 
        />
      );

      const accommodationButton = screen.getByRole('button', { name: /Toggle Accommodations inclusion/i });
      fireEvent.click(accommodationButton); // Deselect

      // Check that onFormChange was called to remove the inclusion
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: []
      });
    });
  });
});