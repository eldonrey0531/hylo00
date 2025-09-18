// tests/components/TripDetails/TravelersForm.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, describe, it, vi } from 'vitest';
import TravelersForm from '@/components/TripDetails/TravelersForm';

describe('TravelersForm - UI Improvements', () => {
  const mockOnFormChange = vi.fn();
  
  const defaultFormData = {
    adults: 2,
    children: 1,
    childrenAges: [5]
  };

  it('should display total travelers count in centered format', () => {
    render(
      <TravelersForm 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Look for the total travelers display
    const totalTravelersText = screen.getByText(/Total travelers: 3/i);
    expect(totalTravelersText).toBeInTheDocument();
    
    // Check if text is centered - this will fail initially
    const totalTravelersContainer = totalTravelersText.closest('div');
    expect(totalTravelersContainer).toHaveClass('text-center');
  });

  it('should have thick border around total travelers display', () => {
    render(
      <TravelersForm 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    const totalTravelersText = screen.getByText(/Total travelers: 3/i);
    const totalTravelersContainer = totalTravelersText.closest('div');
    
    // Check for thick border - this will fail initially
    expect(totalTravelersContainer).toHaveClass('border-4');
    expect(totalTravelersContainer).toHaveClass('border-primary');
  });

  it('should update total travelers count when adults change', () => {
    const { rerender } = render(
      <TravelersForm 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Initial count
    expect(screen.getByText(/Total travelers: 3/i)).toBeInTheDocument();

    // Update adults count
    const updatedFormData = { ...defaultFormData, adults: 3 };
    rerender(
      <TravelersForm 
        formData={updatedFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Should show updated count
    expect(screen.getByText(/Total travelers: 4/i)).toBeInTheDocument();
  });

  it('should update total travelers count when children change', () => {
    const { rerender } = render(
      <TravelersForm 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Initial count
    expect(screen.getByText(/Total travelers: 3/i)).toBeInTheDocument();

    // Update children count
    const updatedFormData = { ...defaultFormData, children: 2, childrenAges: [5, 8] };
    rerender(
      <TravelersForm 
        formData={updatedFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Should show updated count
    expect(screen.getByText(/Total travelers: 4/i)).toBeInTheDocument();
  });

  it('should maintain existing styling classes', () => {
    render(
      <TravelersForm 
        formData={defaultFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    const totalTravelersText = screen.getByText(/Total travelers: 3/i);
    const container = totalTravelersText.closest('div');
    
    // Should maintain existing font styling
    expect(container).toHaveClass('font-raleway');
    expect(container).toHaveClass('font-bold');
  });
});