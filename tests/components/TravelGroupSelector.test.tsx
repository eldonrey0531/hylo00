// T005: TravelGroupSelector enhanced test - specific group names and Other option
// These tests MUST FAIL until TravelGroupSelector is enhanced

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TravelGroupSelector from '../../src/components/TripDetails/TravelGroupSelector';
import type { FormData } from '../../src/components/TripDetails/types';

describe('TravelGroupSelector Enhanced - Specific Group Names and Other Option', () => {
  const mockFormData: FormData = {
    location: 'Paris, France',
    departDate: '2025-10-01',
    flexibleDates: false,
    adults: 2,
    children: 0,
    budget: 5000,
    currency: 'USD',
    flexibleBudget: false,
    budgetMode: 'total',
    travelStyleChoice: 'not-selected',
    selectedGroups: [],
    customGroupText: '',
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('Specific Travel Group Names Display', () => {
    it('should display all specific travel group names with emojis', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until specific group names are implemented
      expect(screen.getByText('Family', { exact: true })).toBeInTheDocument();
      expect(screen.getByText(/🧑‍🧑‍🧒‍🧒/)).toBeInTheDocument();
      
      expect(screen.getByText(/Couple/)).toBeInTheDocument();
      expect(screen.getByText(/👩‍❤️‍👨/)).toBeInTheDocument();
      
      expect(screen.getByText(/Solo/)).toBeInTheDocument();
      expect(screen.getByText(/🥾/)).toBeInTheDocument();
      
      expect(screen.getByText(/Friends/)).toBeInTheDocument();
      expect(screen.getByText(/👯/)).toBeInTheDocument();
      
      expect(screen.getByText(/Large Group/)).toBeInTheDocument();
      expect(screen.getByText(/🚌/)).toBeInTheDocument();
      
      expect(screen.getByText(/Family with Relatives/)).toBeInTheDocument();
      expect(screen.getByText(/🏘️/)).toBeInTheDocument();
      
      expect(screen.getByText(/Business Associates/)).toBeInTheDocument();
      expect(screen.getByText(/💼/)).toBeInTheDocument();
    });

    it('should display Other option with emoji', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until Other option is implemented
      expect(screen.getByText(/Other/)).toBeInTheDocument();
      expect(screen.getByText(/✨/)).toBeInTheDocument();
    });
  });

  describe('Group Selection Functionality', () => {
    it('should allow multiple group selections', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until multi-selection is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      const friendsButton = screen.getByRole('button', { name: 'Select Friends group' });
      
      fireEvent.click(familyButton);
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedGroups: ['family']
      });
      
      fireEvent.click(friendsButton);
      
      // Each click should call onFormChange with the individual selection
      // (Since props don't update in this test, accumulation doesn't happen)
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedGroups: ['family'] });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedGroups: ['friends'] });
    });

    it('should toggle group selection on/off', () => {
      const formDataWithSelection = {
        ...mockFormData,
        selectedGroups: ['family']
      };
      render(<TravelGroupSelector formData={formDataWithSelection} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until toggle functionality is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      fireEvent.click(familyButton);
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedGroups: []
      });
    });

    it('should highlight selected groups', () => {
      const formDataWithSelection = {
        ...mockFormData,
        selectedGroups: ['family', 'friends']
      };
      render(<TravelGroupSelector formData={formDataWithSelection} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until visual selection state is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      const friendsButton = screen.getByRole('button', { name: 'Select Friends group' });
      const soloButton = screen.getByRole('button', { name: 'Select Solo group' });
      
      expect(familyButton).toHaveClass('bg-primary', 'text-white');
      expect(friendsButton).toHaveClass('bg-primary', 'text-white');
      expect(soloButton).not.toHaveClass('bg-primary', 'text-white');
    });
  });

  describe('Other Option Functionality', () => {
    it('should show text input when Other is selected', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until Other text input is implemented
      const otherButton = screen.getByRole('button', { name: /Other/i });
      fireEvent.click(otherButton);
      
      expect(screen.getByPlaceholderText(/specify your travel group/i)).toBeInTheDocument();
    });

    it('should hide text input when Other is deselected', () => {
      const formDataWithOther = {
        ...mockFormData,
        selectedGroups: ['other'],
        customGroupText: 'College Reunion'
      };
      render(<TravelGroupSelector formData={formDataWithOther} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until conditional text input is implemented
      const otherButton = screen.getByRole('button', { name: /Other/i });
      fireEvent.click(otherButton);
      
      // Should be called twice: once to clear customGroupText, once to update selectedGroups
      expect(mockOnFormChange).toHaveBeenCalledWith({ customGroupText: '' });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedGroups: [] });
      
      expect(screen.queryByPlaceholderText(/specify your travel group/i)).not.toBeInTheDocument();
    });

    it('should capture custom text for Other option', () => {
      const formDataWithOther = {
        ...mockFormData,
        selectedGroups: ['other']
      };
      render(<TravelGroupSelector formData={formDataWithOther} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until custom text capture is implemented
      const textInput = screen.getByPlaceholderText(/specify your travel group/i);
      fireEvent.change(textInput, { target: { value: 'Yoga Retreat Group' } });
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        customGroupText: 'Yoga Retreat Group'
      });
    });

    it('should preserve Other selection with custom text', () => {
      const formDataWithOther = {
        ...mockFormData,
        selectedGroups: ['family', 'other'],
        customGroupText: 'College Reunion'
      };
      render(<TravelGroupSelector formData={formDataWithOther} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until Other state preservation is implemented
      expect(screen.getByDisplayValue('College Reunion')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Other/i })).toHaveClass('bg-primary', 'text-white');
    });
  });

  describe('Data Capture', () => {
    it('should capture specific group IDs, not display names', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until ID-based selection is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      const coupleButton = screen.getByRole('button', { name: 'Select Couple group' });
      
      fireEvent.click(familyButton);
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedGroups: ['family'] // Should be ID, not display name
      });
      
      fireEvent.click(coupleButton);
      
      // Each click should call onFormChange with the individual selection  
      // (Since props don't update in this test, accumulation doesn't happen)
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedGroups: ['family'] });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedGroups: ['couple'] });
    });

    it('should include Other in selectedGroups when Other is chosen', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until Other ID inclusion is implemented
      const otherButton = screen.getByRole('button', { name: /Other/i });
      fireEvent.click(otherButton);
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedGroups: ['other']
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for group buttons', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until accessibility is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      expect(familyButton).toHaveAttribute('aria-label', 'Select Family group');
    });

    it('should indicate selected state to screen readers', () => {
      const formDataWithSelection = {
        ...mockFormData,
        selectedGroups: ['family']
      };
      render(<TravelGroupSelector formData={formDataWithSelection} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until screen reader support is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      expect(familyButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have proper label for Other text input', () => {
      const formDataWithOther = {
        ...mockFormData,
        selectedGroups: ['other']
      };
      render(<TravelGroupSelector formData={formDataWithOther} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until input labeling is implemented
      const textInput = screen.getByPlaceholderText(/specify your travel group/i);
      expect(textInput).toHaveAttribute('aria-label', 'Specify custom travel group');
    });
  });

  describe('Visual Styling', () => {
    it('should follow established design patterns', () => {
      render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until styling is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      expect(familyButton).toHaveClass('border-primary', 'bg-[#ece8de]', 'hover:border-primary');
    });

    it('should show selection state with proper styling', () => {
      const formDataWithSelection = {
        ...mockFormData,
        selectedGroups: ['family']
      };
      render(<TravelGroupSelector formData={formDataWithSelection} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until selection styling is implemented
      const familyButton = screen.getByRole('button', { name: 'Select Family group' });
      expect(familyButton).toHaveClass('border-primary', 'bg-primary', 'text-white');
    });
  });
});