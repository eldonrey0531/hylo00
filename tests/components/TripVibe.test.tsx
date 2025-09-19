// T010: TripVibe Enhanced Test Suite  
// THIS TEST WILL FAIL UNTIL COMPONENT IS ENHANCED
// Test verifies comprehensive vibe data capture with Other option

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TripVibe from '../../src/components/TripDetails/TripVibe';
import type { FormData } from '../../src/components/TripDetails/types';

describe('TripVibe Enhanced - Comprehensive Data Capture', () => {
  const mockFormData: FormData = {
    adults: 2,
    children: 1,
    budget: 5000,
    currency: 'USD',
    // Enhanced fields for testing (these will FAIL until implemented)
    selectedTripVibes: [],
    otherTripVibeText: ''
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('Vibe Options Display', () => {
    it('should display all trip vibe options with specific IDs', () => {
      render(
        <TripVibe 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until comprehensive options are displayed
      expect(screen.getByLabelText(/adventure/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relaxation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cultural/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/romantic/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/family fun/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/luxury/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/budget conscious/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
    });

    it('should capture specific vibe IDs for data gathering', () => {
      render(
        <TripVibe 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const adventureOption = screen.getByLabelText(/adventure/i);
      fireEvent.click(adventureOption);

      // This will FAIL until ID-based selection is implemented
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedTripVibes: ['adventure']
      });
    });

    it('should handle Other option with text input and 150 char limit', () => {
      // Start with formData that already has 'other' selected to show the input
      const formDataWithOther = {
        ...mockFormData,
        selectedTripVibes: ['other']
      };
      
      render(
        <TripVibe 
          formData={formDataWithOther} 
          onFormChange={mockOnFormChange} 
        />
      );

      // Should see the text input already visible
      const otherInput = screen.getByPlaceholderText(/describe your ideal trip vibe/i);
      expect(otherInput).toHaveAttribute('maxLength', '150');
      
      fireEvent.change(otherInput, { target: { value: 'Spiritual journey' } });

      expect(mockOnFormChange).toHaveBeenCalledWith({
        otherTripVibeText: 'Spiritual journey'
      });
    });
  });

  describe('Multi-Selection and Data Visibility', () => {
    it('should allow multiple vibe selections', () => {
      render(
        <TripVibe 
          formData={mockFormData} 
          onFormChange={mockOnFormChange} 
        />
      );

      const adventureOption = screen.getByLabelText(/adventure/i);
      const culturalOption = screen.getByLabelText(/cultural/i);

      fireEvent.click(adventureOption);
      fireEvent.click(culturalOption);

      // Each click triggers separate calls with correct state management
      expect(mockOnFormChange).toHaveBeenCalledTimes(2);
      expect(mockOnFormChange).toHaveBeenNthCalledWith(1, {
        selectedTripVibes: ['adventure']
      });
      // Second call adds to the selection - but uses current state at click time
      expect(mockOnFormChange).toHaveBeenNthCalledWith(2, {
        selectedTripVibes: ['cultural']
      });
    });

    it('should maintain comprehensive data for AI integration', () => {
      const dataWithSelections = {
        ...mockFormData,
        selectedTripVibes: ['adventure', 'cultural', 'other'],
        otherTripVibeText: 'Wellness retreat'
      };

      render(
        <TripVibe 
          formData={dataWithSelections} 
          onFormChange={mockOnFormChange} 
        />
      );

      // This will FAIL until data visibility is implemented
      expect(screen.getByDisplayValue('Wellness retreat')).toBeInTheDocument();
    });
  });
});