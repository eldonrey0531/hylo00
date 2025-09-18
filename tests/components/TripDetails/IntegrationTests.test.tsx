import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ItineraryInclusions from '../../../src/components/TripDetails/ItineraryInclusions';
import AccommodationPreferences from '../../../src/components/TripDetails/PreferenceModals/AccommodationPreferences';
import RentalCarPreferences from '../../../src/components/TripDetails/PreferenceModals/RentalCarPreferences';
import FlightPreferences from '../../../src/components/TripDetails/PreferenceModals/FlightPreferences';
import type { FormData } from '../../../src/components/TripDetails/types';

const mockFormData: FormData = {
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

const mockPreferencesProps = {
  preferences: {},
  onSave: vi.fn()
};

describe('Integration Tests - Header Display and Styling Consistency', () => {
  it('should display correct header text in ItineraryInclusions component', () => {
    render(
      <ItineraryInclusions 
        formData={mockFormData} 
        onFormChange={vi.fn()} 
      />
    );

    // This MUST FAIL - looking for new header text before implementation
    const newHeaderText = screen.getByRole('heading', { 
      name: /What Should We Include in Your Itinerary\?/i 
    });
    expect(newHeaderText).toBeInTheDocument();
  });

  it('should have consistent header styling across all preference components', () => {
    const { rerender } = render(<AccommodationPreferences {...mockPreferencesProps} />);
    
    // Check AccommodationPreferences header styling
    const accommodationHeader = screen.getByText('Accommodation Preferences').closest('div');
    expect(accommodationHeader).toHaveClass('w-full'); // MUST FAIL
    expect(accommodationHeader).toHaveClass('flex');
    expect(accommodationHeader).toHaveClass('items-center');

    // Check RentalCarPreferences header styling
    rerender(<RentalCarPreferences {...mockPreferencesProps} />);
    const rentalHeader = screen.getByText('Rental Car Preferences').closest('div');
    expect(rentalHeader).toHaveClass('w-full'); // MUST FAIL
    expect(rentalHeader).toHaveClass('flex');
    expect(rentalHeader).toHaveClass('items-center');

    // Check FlightPreferences header styling
    rerender(<FlightPreferences {...mockPreferencesProps} />);
    const flightHeader = screen.getByText('Flight Preferences').closest('div');
    expect(flightHeader).toHaveClass('w-full'); // MUST FAIL
    expect(flightHeader).toHaveClass('flex');
    expect(flightHeader).toHaveClass('items-center');
  });

  it('should have responsive 2x2 grid layouts in preference components', () => {
    const { rerender } = render(<AccommodationPreferences {...mockPreferencesProps} />);
    
    // Check AccommodationPreferences grid
    const accommodationGrid = screen.getByText('Traditional hotel').closest('.grid');
    expect(accommodationGrid).toHaveClass('grid-cols-2'); // MUST FAIL (currently grid-cols-4)

    // Check RentalCarPreferences grid
    rerender(<RentalCarPreferences {...mockPreferencesProps} />);
    const rentalGrid = screen.getByText('Economy').closest('.grid');
    expect(rentalGrid).toHaveClass('grid-cols-2'); // MUST FAIL (currently grid-cols-4)
  });
});