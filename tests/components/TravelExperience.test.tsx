// T009: TravelExperience Enhanced Test Suite
// THIS TEST WILL FAIL UNTIL COMPONENT IS ENHANCED
// Test verifies comprehensive experience data capture with Other option

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TravelExperience from '../../src/components/TripDetails/TravelExperience';
import type { FormData } from '../../src/components/TripDetails/types';

describe('TravelExperience Enhanced - Comprehensive Data Capture', () => {
  const mockFormData: FormData = {
    location: 'Paris, France',
    departDate: '2024-06-15',
    flexibleDates: false,
    adults: 2,
    children: 1,
    budget: 5000,
    currency: 'USD',
    flexibleBudget: false,
    budgetMode: 'total',
    travelStyleChoice: 'not-selected',
    // Enhanced fields for testing (these will FAIL until implemented)
    travelExperience: [],
    customTravelExperienceText: ''
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('Experience Options Display', () => {
    it('should display all travel experience options', () => {
      render(
        <TravelExperience 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until all options are displayed
      expect(screen.getByText(/first time visiting/i)).toBeInTheDocument();
      expect(screen.getByText(/returning visitor/i)).toBeInTheDocument();
      expect(screen.getByText(/local connections/i)).toBeInTheDocument();
      expect(screen.getByText(/business.*work/i)).toBeInTheDocument();
      expect(screen.getByText(/organizing travel/i)).toBeInTheDocument();
      expect(screen.getByText(/other/i)).toBeInTheDocument();
    });

    it('should capture specific experience IDs for data gathering', () => {
      render(
        <TravelExperience 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const firstTimeOption = screen.getByLabelText(/first time visiting/i);
      fireEvent.click(firstTimeOption);

      // This will FAIL until ID-based selection is implemented
      expect(mockOnFormChange).toHaveBeenCalledWith({
        travelExperience: ['first-time-visiting']
      });
    });

    it('should handle Other option with text input', () => {
      // Start with formData that already has 'other' selected to show the input
      const formDataWithOther = {
        ...mockFormData,
        travelExperience: ['other']
      };
      
      render(
        <TravelExperience 
          formData={formDataWithOther} 
          onFormChange={mockOnFormChange} 
        />
      );

      // Should see the text input already visible
      const otherInput = screen.getByPlaceholderText('Describe your travel experience level or any specific background relevant to this trip...');
      fireEvent.change(otherInput, { target: { value: 'Honeymoon trip' } });

      expect(mockOnFormChange).toHaveBeenCalledWith({
        customTravelExperienceText: 'Honeymoon trip'
      });
    });
  });

  describe('Multi-Selection Functionality', () => {
    it('should allow multiple experience selections', () => {
      render(
        <TravelExperience 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const firstTimeOption = screen.getByLabelText(/first time visiting/i);
      const businessOption = screen.getByLabelText(/business.*work/i);

      fireEvent.click(firstTimeOption);
      fireEvent.click(businessOption);

      // Each click triggers separate calls with correct state management
      expect(mockOnFormChange).toHaveBeenCalledTimes(2);
      expect(mockOnFormChange).toHaveBeenNthCalledWith(1, {
        travelExperience: ['first-time-visiting']
      });
      // Second call adds to the selection - but uses current state at click time
      expect(mockOnFormChange).toHaveBeenNthCalledWith(2, {
        travelExperience: ['business-travel']
      });
    });
  });
});