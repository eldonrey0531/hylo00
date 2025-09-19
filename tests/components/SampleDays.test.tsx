// T010: SampleDays Enhanced Test Suite  
// THIS TEST WILL FAIL UNTIL COMPONENT IS ENHANCED
// Test verifies comprehensive sample days data capture with Other option

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SampleDays from '../../src/components/TripDetails/SampleDays';
import type { FormData } from '../../src/components/TripDetails/types';

describe('SampleDays Enhanced - Comprehensive Data Capture', () => {
  const mockFormData: FormData = {
    adults: 2,
    children: 1,
    budget: 5000,
    currency: 'USD',
    // Enhanced fields for testing (these will FAIL until implemented)
    selectedSampleDays: [],
    otherSampleDaysText: ''
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('Sample Days Options Display', () => {
    it('should display all sample day options with specific IDs', () => {
      render(
        <SampleDays 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until comprehensive options are displayed
      expect(screen.getByLabelText(/guided tour/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/wander.*own pace/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pool.*beach/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adventure.*activities/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cultural.*immersion/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/active.*hiking/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/winery.*tasting/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/easy day.*party/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
    });

    it('should capture specific sample day IDs for data gathering', () => {
      render(
        <SampleDays 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const guidedTourOption = screen.getByLabelText(/guided tour/i);
      fireEvent.click(guidedTourOption);

      // This will FAIL until ID-based selection is implemented
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedSampleDays: ['guided-tour']
      });
    });

    it('should handle Other option with text input and 200 char limit', () => {
      // Start with formData that already has 'other' selected to show the input
      const formDataWithOther = {
        ...mockFormData,
        selectedSampleDays: ['other']
      };
      
      render(
        <SampleDays 
          formData={formDataWithOther} 
          onFormChange={mockOnFormChange} 
        />
      );

      // Should see the text input already visible
      const otherInput = screen.getByPlaceholderText(/describe your ideal travel day/i);
      expect(otherInput).toHaveAttribute('maxLength', '200');
      
      fireEvent.change(otherInput, { target: { value: 'Museum hopping and coffee shops' } });

      expect(mockOnFormChange).toHaveBeenCalledWith({
        otherSampleDaysText: 'Museum hopping and coffee shops'
      });
    });
  });

  describe('Multi-Selection and Data Visibility', () => {
    it('should allow multiple sample day selections', () => {
      render(
        <SampleDays 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const guidedTourOption = screen.getByLabelText(/guided tour/i);
      const culturalOption = screen.getByLabelText(/cultural.*immersion/i);

      fireEvent.click(guidedTourOption);
      fireEvent.click(culturalOption);

      // Each click triggers separate calls with correct state management
      expect(mockOnFormChange).toHaveBeenCalledTimes(2);
      expect(mockOnFormChange).toHaveBeenNthCalledWith(1, {
        selectedSampleDays: ['guided-tour']
      });
      // Second call adds to the selection - but uses current state at click time
      expect(mockOnFormChange).toHaveBeenNthCalledWith(2, {
        selectedSampleDays: ['cultural-immersion']
      });
    });

    it('should maintain comprehensive data for AI integration', () => {
      const dataWithSelections = {
        ...mockFormData,
        selectedSampleDays: ['guided-tour', 'cultural-immersion'],
        otherSampleDaysText: 'Cooking classes'
      };

      render(
        <SampleDays 
          formData={dataWithSelections} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until comprehensive data display is implemented
      // Component should show all selected states correctly
      const guidedTourOption = screen.getByLabelText(/guided tour/i);
      const culturalOption = screen.getByLabelText(/cultural.*immersion/i);

      expect(guidedTourOption).toHaveAttribute('aria-pressed', 'true');
      expect(culturalOption).toHaveAttribute('aria-pressed', 'true');
    });
  });
});