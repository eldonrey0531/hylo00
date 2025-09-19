// T006: TravelInterests enhanced test - choice name capture and Other option
// These tests MUST FAIL until TravelInterests is enhanced

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TravelInterests from '../../src/components/TripDetails/TravelInterests';
import type { FormData } from '../../src/components/TripDetails/types';

describe('TravelInterests Enhanced - Choice Name Capture and Other Option', () => {
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
    selectedInterests: [],
    customInterestsText: '',
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('Travel Interest Options Display', () => {
    it('should display all travel interest options with emojis', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until all interest options are displayed
      expect(screen.getByText(/Beach/)).toBeInTheDocument();
      expect(screen.getByText(/🏖️/)).toBeInTheDocument();
      
      expect(screen.getByText(/Culture/)).toBeInTheDocument();
      expect(screen.getByText(/🛕/)).toBeInTheDocument();
      
      expect(screen.getByText(/History/)).toBeInTheDocument();
      expect(screen.getByText(/📜/)).toBeInTheDocument();
      
      expect(screen.getByText(/Food/)).toBeInTheDocument();
      expect(screen.getByText(/🍜/)).toBeInTheDocument();
      
      expect(screen.getByText(/Nature/)).toBeInTheDocument();
      expect(screen.getByText(/🌲/)).toBeInTheDocument();
      
      expect(screen.getByText(/Arts & Entertainment/)).toBeInTheDocument();
      expect(screen.getByText(/🎭/)).toBeInTheDocument();
    });

    it('should include Other option with emoji', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until Other option is included
      expect(screen.getByText(/Other/)).toBeInTheDocument();
      expect(screen.getByText(/✨/)).toBeInTheDocument();
    });
  });

  describe('Specific Choice Name Capture', () => {
    it('should capture specific choice IDs when interests are selected', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until specific ID capture is implemented
      const beachButton = screen.getByRole('button', { name: /Beach/i });
      const cultureButton = screen.getByRole('button', { name: /Culture/i });
      
      fireEvent.click(beachButton);
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInterests: ['beach'] // Should capture ID, not display name
      });
      
      fireEvent.click(cultureButton);
      
      // Each click calls onFormChange separately (props don't update in test)
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInterests: ['beach'] });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInterests: ['culture'] });
    });

    it('should capture exact choice names from the predefined options', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until exact name capture is implemented
      const foodButton = screen.getByRole('button', { name: /Food/i });
      const natureButton = screen.getByRole('button', { name: /Nature/i });
      
      fireEvent.click(foodButton);
      fireEvent.click(natureButton);

      // Each click calls onFormChange separately (props don't update in test)
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInterests: ['food'] });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInterests: ['nature'] });
    });

    it('should support multi-select functionality', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until multi-select is implemented
      const beachButton = screen.getByRole('button', { name: 'Select Beach interest' });
      const historyButton = screen.getByRole('button', { name: 'Select History interest' });
      const artsButton = screen.getByRole('button', { name: 'Select Arts & Entertainment interest' });
      
      fireEvent.click(beachButton);
      fireEvent.click(historyButton);
      fireEvent.click(artsButton);
      
      // Each click calls onFormChange separately since props don't update in test
      expect(mockOnFormChange).toHaveBeenNthCalledWith(1, {
        selectedInterests: ['beach']
      });
      expect(mockOnFormChange).toHaveBeenNthCalledWith(2, {
        selectedInterests: ['history']
      });
      expect(mockOnFormChange).toHaveBeenNthCalledWith(3, {
        selectedInterests: ['arts']
      });
    });
  });

  describe('Other Option Functionality', () => {
    it('should show text input when Other is selected', async () => {
      // Start with Other already selected to make textarea visible
      const mockFormDataWithOther: FormData = {
        ...mockFormData,
        selectedInterests: ['other']
      };
      
      render(<TravelInterests formData={mockFormDataWithOther} onFormChange={mockOnFormChange} />);
      
      // The textarea should be visible since Other is pre-selected
      expect(screen.getByPlaceholderText(/specify your interests/i)).toBeInTheDocument();
    });

    it('should include Other in selectedInterests when Other is chosen', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until Other ID inclusion is implemented
      const otherButton = screen.getByRole('button', { name: /Other/i });
      fireEvent.click(otherButton);
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInterests: ['other']
      });
    });

    it('should capture custom interest text', () => {
      const formDataWithOther = {
        ...mockFormData,
        selectedInterests: ['other']
      };
      render(<TravelInterests formData={formDataWithOther} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until custom text capture is implemented
      const textInput = screen.getByPlaceholderText(/specify your interests/i);
      fireEvent.change(textInput, { target: { value: 'Birdwatching and Wildlife Photography' } });
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        customInterestsText: 'Birdwatching and Wildlife Photography'
      });
    });

    it('should clear custom text when Other is deselected', () => {
      const formDataWithOther = {
        ...mockFormData,
        selectedInterests: ['beach', 'other'],
        customInterestsText: 'Wildlife Photography'
      };
      render(<TravelInterests formData={formDataWithOther} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until text clearing is implemented
      const otherButton = screen.getByRole('button', { name: /Other/i });
      fireEvent.click(otherButton);
      
      // Should call onFormChange twice: once to clear customInterestsText, once to update selectedInterests
      expect(mockOnFormChange).toHaveBeenCalledWith({ customInterestsText: '' });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInterests: ['beach'] });
    });

    it('should preserve Other selection with existing interests', () => {
      const formDataWithMixed = {
        ...mockFormData,
        selectedInterests: ['beach', 'culture', 'other'],
        customInterestsText: 'Astronomy and Stargazing'
      };
      render(<TravelInterests formData={formDataWithMixed} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until mixed selection preservation is implemented
      expect(screen.getByDisplayValue('Astronomy and Stargazing')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Beach/i })).toHaveClass('bg-primary');
      expect(screen.getByRole('button', { name: /Culture/i })).toHaveClass('bg-primary');
      expect(screen.getByRole('button', { name: /Other/i })).toHaveClass('bg-primary');
    });
  });

  describe('Selection State Management', () => {
    it('should toggle interest selection on/off', () => {
      const formDataWithSelection = {
        ...mockFormData,
        selectedInterests: ['beach', 'food']
      };
      render(<TravelInterests formData={formDataWithSelection} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until toggle functionality is implemented
      const beachButton = screen.getByRole('button', { name: /Beach/i });
      fireEvent.click(beachButton);
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        selectedInterests: ['food'] // Beach should be removed
      });
    });

    it('should highlight selected interests visually', () => {
      const formDataWithSelection = {
        ...mockFormData,
        selectedInterests: ['beach', 'culture']
      };
      render(<TravelInterests formData={formDataWithSelection} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until visual highlighting is implemented
      const beachButton = screen.getByRole('button', { name: /Beach/i });
      const cultureButton = screen.getByRole('button', { name: /Culture/i });
      const foodButton = screen.getByRole('button', { name: /Food/i });
      
      expect(beachButton).toHaveClass('bg-primary', 'text-white');
      expect(cultureButton).toHaveClass('bg-primary', 'text-white');
      expect(foodButton).not.toHaveClass('bg-primary', 'text-white');
    });
  });

  describe('Complete Interest Options', () => {
    it('should include all 20 travel interest options', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until all options are included
      const expectedInterests = [
        'Beach', 'Culture', 'History', 'Food', 'Drinks', 'Nature', 'Relaxation',
        'Shopping', 'Nightlife', 'Arts & Entertainment', 'Museums & Exhibitions',
        'Zoos & Aquariums', 'Kid-friendly', 'Theme Parks', 'Sporting Events',
        'Health & Wellness', 'Classes', 'Digital detox', 'Volunteering', 'Other'
      ];
      
      expectedInterests.forEach(interest => {
        expect(screen.getByText(new RegExp(interest, 'i'))).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interest buttons', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until accessibility is implemented
      const beachButton = screen.getByRole('button', { name: /Beach/i });
      expect(beachButton).toHaveAttribute('aria-label', 'Select Beach interest');
    });

    it('should indicate selection state to screen readers', () => {
      const formDataWithSelection = {
        ...mockFormData,
        selectedInterests: ['beach']
      };
      render(<TravelInterests formData={formDataWithSelection} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until screen reader support is implemented
      const beachButton = screen.getByRole('button', { name: /Beach/i });
      expect(beachButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Data Validation', () => {
    it('should maintain consistent data structure', () => {
      render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      
      // This will FAIL until data structure validation is implemented
      const beachButton = screen.getByRole('button', { name: /Beach/i });
      const otherButton = screen.getByRole('button', { name: /Other/i });
      
      fireEvent.click(beachButton);
      fireEvent.click(otherButton);

      // Each click calls onFormChange separately (props don't update in test)
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInterests: ['beach'] });
      expect(mockOnFormChange).toHaveBeenCalledWith({ selectedInterests: ['other'] });
    });
  });
});