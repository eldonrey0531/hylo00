// tests/components/TripDetails/ItineraryInclusions.test.tsx
import { render, screen } from '@testing-library/react';
import { expect, describe, it, vi } from 'vitest';
import ItineraryInclusions from '@/components/TripDetails/ItineraryInclusions';
import type { FormData } from '@/components/TripDetails/types';

describe('ItineraryInclusions - Header Text Contract Tests', () => {
  const mockOnFormChange = vi.fn();
  
  const defaultFormData: FormData = {
    location: 'Paris, France',
    departDate: '2024-10-01',
    flexibleDates: false,
    adults: 2,
    children: 0,
    budget: 2000,
    currency: 'USD',
    flexibleBudget: false,
    travelStyleChoice: 'not-selected',
    selectedInclusions: [],
    inclusionPreferences: {},
    customInclusionsText: ''
  };

  it('should display the updated header text "What Should We Include in Your Itinerary?"', () => {
    render(
      <ItineraryInclusions 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // This test MUST FAIL initially - looking for the new header text
    const newHeaderText = screen.getByRole('heading', { 
      name: /What Should We Include in Your Itinerary\?/i 
    });
    expect(newHeaderText).toBeInTheDocument();
  });

  it('should NOT display the old header text "ITINERARY INCLUSIONS"', () => {
    render(
      <ItineraryInclusions 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // This test MUST FAIL initially - the old text should still be there
    const oldHeaderText = screen.queryByRole('heading', { 
      name: /ITINERARY INCLUSIONS/i 
    });
    expect(oldHeaderText).not.toBeInTheDocument();
  });

  it('should maintain existing header styling classes', () => {
    render(
      <ItineraryInclusions 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    const headerElement = screen.getByRole('heading', { 
      name: /What Should We Include in Your Itinerary\?/i 
    });
    
    // Verify styling classes are preserved
    expect(headerElement).toHaveClass('text-xl');
    expect(headerElement).toHaveClass('font-bold');
    expect(headerElement).toHaveClass('text-primary');
    expect(headerElement).toHaveClass('uppercase');
    expect(headerElement).toHaveClass('tracking-wide');
    expect(headerElement).toHaveClass('font-raleway');
  });
});