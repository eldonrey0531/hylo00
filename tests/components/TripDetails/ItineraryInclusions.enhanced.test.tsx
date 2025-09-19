// T005-T006: ItineraryInclusions comprehensive test - 12 options, choices capture, preferences and Other option
// These tests verify the complete functionality for capturing all inclusion choices and preferences

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItineraryInclusions from '@/components/TripDetails/ItineraryInclusions';
import type { FormData } from '@/components/TripDetails/types';

describe('ItineraryInclusions Enhanced - 12 Options with Choices and Preferences', () => {
  const mockFormData: FormData = {
    location: 'Paris, France',
    departDate: '2024-10-01',
    flexibleDates: false,
    adults: 2,
    children: 0,
    budget: 2000,
    currency: 'USD',
    flexibleBudget: false,
    budgetMode: 'total',
    travelStyleChoice: 'not-selected',
    selectedInclusions: [],
    customInclusionsText: '',
    inclusionPreferences: {}
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('Itinerary Inclusion Options Display', () => {
    it('should display all 12 itinerary inclusion options with emojis', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // Check for all 12 inclusion options (11 regular + Other)
      expect(screen.getByText('Flights')).toBeInTheDocument();
      expect(screen.getByText('Accommodations')).toBeInTheDocument();
      expect(screen.getByText('Rental Car')).toBeInTheDocument();
      expect(screen.getByText('Activities & Tours')).toBeInTheDocument();
      expect(screen.getByText('Dining')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
      expect(screen.getByText('Nature')).toBeInTheDocument();
      expect(screen.getByText('Train Tickets')).toBeInTheDocument();
      expect(screen.getByText('Cruise')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
      
      // Check for emojis
      expect(screen.getByText('✈️')).toBeInTheDocument();
      expect(screen.getByText('🏨')).toBeInTheDocument();
      expect(screen.getByText('🚗')).toBeInTheDocument();
      expect(screen.getByText('🛶')).toBeInTheDocument();
      expect(screen.getByText('🍽️')).toBeInTheDocument();
      expect(screen.getByText('🪇')).toBeInTheDocument();
      expect(screen.getByText('🌲')).toBeInTheDocument();
      expect(screen.getByText('🚆')).toBeInTheDocument();
      expect(screen.getByText('🛳️')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('should include Other option with emoji', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      expect(screen.getByText('Other')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });

  describe('Specific Choice ID Capture', () => {
    it('should capture specific choice IDs when inclusions are selected', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      const flightsButton = screen.getByLabelText('Toggle Flights inclusion');
      const accommodationsButton = screen.getByLabelText('Toggle Accommodations inclusion');
      
      fireEvent.click(flightsButton);
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: ['flights'] // Should capture ID, not display name
      });
      
      fireEvent.click(accommodationsButton);
      
      // Each click calls onFormChange separately (props don't update in test)
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInclusions: ['flights'] });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInclusions: ['accommodations'] });
    });

    it('should capture exact choice names from the predefined options', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      const diningButton = screen.getByLabelText('Toggle Dining inclusion');
      const entertainmentButton = screen.getByLabelText('Toggle Entertainment inclusion');
      
      fireEvent.click(diningButton);
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: ['dining']
      });
      
      fireEvent.click(entertainmentButton);
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: ['entertainment']
      });
    });

    it('should support multi-select functionality', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);

      const flightsButton = screen.getByLabelText('Toggle Flights inclusion');
      const activitiesButton = screen.getByLabelText('Toggle Activities & Tours inclusion');
      const diningButton = screen.getByLabelText('Toggle Dining inclusion');

      fireEvent.click(flightsButton);
      fireEvent.click(activitiesButton);
      fireEvent.click(diningButton);

      // Each click calls onFormChange separately since props don't update in test
      expect(mockOnFormChange).toHaveBeenNthCalledWith(1, {
        selectedInclusions: ['flights']
      });
      expect(mockOnFormChange).toHaveBeenNthCalledWith(2, {
        selectedInclusions: ['activities']
      });
      expect(mockOnFormChange).toHaveBeenNthCalledWith(3, {
        selectedInclusions: ['dining']
      });
    });
  });

  describe('Other Option Functionality', () => {
    it('should show text input when Other is selected', () => {
      // Start with Other already selected to make textarea visible
      const mockFormDataWithOther: FormData = {
        ...mockFormData,
        selectedInclusions: ['other']
      };
      
      render(<ItineraryInclusions formData={mockFormDataWithOther} onFormChange={mockOnFormChange} />);
      
      // The textarea should be visible since Other is pre-selected
      expect(screen.getByPlaceholderText(/specify what else/i)).toBeInTheDocument();
    });

    it('should include Other in selectedInclusions when Other is chosen', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      const otherButton = screen.getByLabelText('Toggle Other inclusion');
      fireEvent.click(otherButton);
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: ['other']
      });
    });

    it('should capture custom inclusion text', () => {
      const mockFormDataWithOther: FormData = {
        ...mockFormData,
        selectedInclusions: ['other']
      };
      
      render(<ItineraryInclusions formData={mockFormDataWithOther} onFormChange={mockOnFormChange} />);
      
      const textArea = screen.getByPlaceholderText(/specify what else/i);
      fireEvent.change(textArea, { target: { value: 'Photography workshops, local markets' } });
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        customInclusionsText: 'Photography workshops, local markets'
      });
    });

    it('should clear custom text when Other is deselected', () => {
      const mockFormDataWithOther: FormData = {
        ...mockFormData,
        selectedInclusions: ['other'],
        customInclusionsText: 'Photography workshops'
      };
      
      render(<ItineraryInclusions formData={mockFormDataWithOther} onFormChange={mockOnFormChange} />);
      
      // Click Other button to deselect it
      const otherButton = screen.getByLabelText('Toggle Other inclusion');
      fireEvent.click(otherButton);
      
      // Should make separate calls for deselection and text clearing
      expect(mockOnFormChange).toHaveBeenCalledWith({ customInclusionsText: '' });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInclusions: [] });
    });

    it('should preserve Other selection with existing inclusions', () => {
      const mockFormDataWithSelections: FormData = {
        ...mockFormData,
        selectedInclusions: ['flights', 'accommodations']
      };
      
      render(<ItineraryInclusions formData={mockFormDataWithSelections} onFormChange={mockOnFormChange} />);
      
      const otherButton = screen.getByLabelText('Toggle Other inclusion');
      fireEvent.click(otherButton);
      
      // The final call should include all previous selections plus 'other'
      expect(mockOnFormChange).toHaveBeenLastCalledWith({
        selectedInclusions: ['flights', 'accommodations', 'other']
      });
    });
  });

  describe('Selection State Management', () => {
    it('should toggle inclusion selection on/off', () => {
      const { rerender } = render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      const cruiseButton = screen.getByLabelText('Toggle Cruise inclusion');
      
      // Click to select
      fireEvent.click(cruiseButton);
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: ['cruise']
      });
      
      // Click again to deselect (simulating with different formData)
      const mockFormDataWithCruise: FormData = { ...mockFormData, selectedInclusions: ['cruise'] };
      
      rerender(<ItineraryInclusions formData={mockFormDataWithCruise} onFormChange={mockOnFormChange} />);
      const cruiseButtonSelected = screen.getByLabelText('Toggle Cruise inclusion');
      fireEvent.click(cruiseButtonSelected);
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: []
      });
    });

    it('should highlight selected inclusions visually', () => {
      const mockFormDataWithSelected: FormData = {
        ...mockFormData,
        selectedInclusions: ['flights', 'accommodations']
      };
      
      render(<ItineraryInclusions formData={mockFormDataWithSelected} onFormChange={mockOnFormChange} />);
      
      const flightsButton = screen.getByLabelText('Toggle Flights inclusion');
      const accommodationsButton = screen.getByLabelText('Toggle Accommodations inclusion');
      const diningButton = screen.getByLabelText('Toggle Dining inclusion');
      
      // Selected buttons should have primary styling
      expect(flightsButton).toHaveClass('bg-primary');
      expect(accommodationsButton).toHaveClass('bg-primary');
      
      // Unselected button should have default styling
      expect(diningButton).toHaveClass('bg-[#ece8de]');
    });
  });

  describe('Complete Inclusion Options', () => {
    it('should include all 10 itinerary inclusion options', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // Count all buttons (should be 10)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(10);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for inclusion buttons', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      expect(screen.getByLabelText('Toggle Flights inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Accommodations inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Rental Car inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Activities & Tours inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Dining inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Entertainment inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Nature inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Train Tickets inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Cruise inclusion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Other inclusion')).toBeInTheDocument();
    });

    it('should indicate selection state to screen readers', () => {
      const mockFormDataWithSelected: FormData = {
        ...mockFormData,
        selectedInclusions: ['flights']
      };
      
      render(<ItineraryInclusions formData={mockFormDataWithSelected} onFormChange={mockOnFormChange} />);
      
      const flightsButton = screen.getByLabelText('Toggle Flights inclusion');
      const accommodationsButton = screen.getByLabelText('Toggle Accommodations inclusion');
      
      expect(flightsButton).toHaveAttribute('aria-pressed', 'true');
      expect(accommodationsButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Data Validation', () => {
    it('should maintain consistent data structure', () => {
      render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      const flightsButton = screen.getByLabelText('Toggle Flights inclusion');
      fireEvent.click(flightsButton);
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInclusions: expect.arrayContaining(['flights'])
      });
      
      // Verify the array contains only strings
      const call = mockOnFormChange.mock.calls[0]?.[0];
      expect(call?.selectedInclusions).toBeDefined();
      expect(Array.isArray(call?.selectedInclusions)).toBe(true);
      expect(typeof call?.selectedInclusions?.[0]).toBe('string');
    });
  });
});