// T011: DinnerChoice Enhanced Test Suite  
// THIS TEST WILL FAIL UNTIL COMPONENT IS ENHANCED
// Test verifies comprehensive dinner choice data capture with Other option

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DinnerChoice from '../../src/components/TripDetails/DinnerChoice';
import type { FormData } from '../../src/components/TripDetails/types';

describe('DinnerChoice Enhanced - Comprehensive Data Capture', () => {
  const mockFormData: FormData = {
    adults: 2,
    children: 1,
    budget: 5000,
    currency: 'USD',
    // Enhanced fields for testing (these will FAIL until implemented)
    selectedDinnerChoices: [],
    otherDinnerChoiceText: ''
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('Dinner Choice Options Display', () => {
    it('should display all dinner choice options with specific IDs', () => {
      render(
        <DinnerChoice 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until comprehensive options are displayed
      expect(screen.getByLabelText(/michelin.*starred/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/street food/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hotel.*restaurant/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/wander.*explore/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/not.*food.*person/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/food truck/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fast food/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cook.*own/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
    });

    it('should capture specific dinner choice IDs for data gathering', () => {
      render(
        <DinnerChoice 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const michelinOption = screen.getByLabelText(/michelin.*starred/i);
      fireEvent.click(michelinOption);

      // This will FAIL until ID-based selection is implemented
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedDinnerChoices: ['michelin-starred']
      });
    });

    it('should handle Other option with text input and 150 char limit', () => {
      // Start with formData that already has 'other' selected to show the input
      const formDataWithOther = {
        ...mockFormData,
        selectedDinnerChoices: ['other']
      };
      
      render(
        <DinnerChoice 
          formData={formDataWithOther} 
          onFormChange={mockOnFormChange} 
        />
      );

      // Should see the text input already visible
      const otherInput = screen.getByPlaceholderText(/describe your dinner preference/i);
      expect(otherInput).toHaveAttribute('maxLength', '150');
      
      fireEvent.change(otherInput, { target: { value: 'Vegetarian fine dining' } });

      expect(mockOnFormChange).toHaveBeenCalledWith({
        otherDinnerChoiceText: 'Vegetarian fine dining'
      });
    });
  });

  describe('Multi-Selection and Data Visibility', () => {
    it('should allow multiple dinner choice selections', () => {
      render(
        <DinnerChoice 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const michelinOption = screen.getByLabelText(/michelin.*starred/i);
      const streetFoodOption = screen.getByLabelText(/street food/i);

      fireEvent.click(michelinOption);
      fireEvent.click(streetFoodOption);

      // Each click triggers separate calls with correct state management
      expect(mockOnFormChange).toHaveBeenCalledTimes(2);
      expect(mockOnFormChange).toHaveBeenNthCalledWith(1, {
        selectedDinnerChoices: ['michelin-starred']
      });
      // Second call adds to the selection - but uses current state at click time
      expect(mockOnFormChange).toHaveBeenNthCalledWith(2, {
        selectedDinnerChoices: ['street-food']
      });
    });

    it('should maintain comprehensive data for AI integration', () => {
      const dataWithSelections = {
        ...mockFormData,
        selectedDinnerChoices: ['michelin-starred', 'street-food'],
        otherDinnerChoiceText: 'Farm to table restaurants'
      };

      render(
        <DinnerChoice 
          formData={dataWithSelections} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until comprehensive data display is implemented
      // Component should show all selected states correctly
      const michelinOption = screen.getByLabelText(/michelin.*starred/i);
      const streetFoodOption = screen.getByLabelText(/street food/i);

      expect(michelinOption).toHaveAttribute('aria-pressed', 'true');
      expect(streetFoodOption).toHaveAttribute('aria-pressed', 'true');
    });
  });
});