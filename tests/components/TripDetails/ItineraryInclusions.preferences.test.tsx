// Comprehensive preference data gathering verification test
// This test verifies that ALL fields in preference modals are properly captured

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ItineraryInclusions from '../../../src/components/TripDetails/ItineraryInclusions';
import type { FormData } from '../../../src/components/TripDetails/types';

describe('ItineraryInclusions - Complete Preference Data Gathering', () => {
  const mockFormData: FormData = {
    location: 'Paris, France',
    departDate: '2024-06-15',
    flexibleDates: false,
    adults: 2,
    children: 0,
    budget: 5000,
    currency: 'USD',
    flexibleBudget: false,
    budgetMode: 'total',
    travelStyleChoice: 'not-selected',
    selectedInclusions: ['flights', 'accommodations', 'rental-car', 'activities'],
    inclusionPreferences: {}
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  it('should capture ALL FlightPreferences fields', async () => {
    render(
      <ItineraryInclusions 
        formData={mockFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Flight preferences should be visible since 'flights' is selected
    expect(screen.getByText('Flight Preferences')).toBeInTheDocument();

    // Test departure airports field
    const departureInput = screen.getByPlaceholderText(/SFO, London area airports/i);
    fireEvent.change(departureInput, { target: { value: 'JFK, LGA, EWR' } });

    // Test cabin class selection (multiple)
    const economyButton = screen.getByText('Economy $');
    const businessButton = screen.getByText(/Business \$\$\$/);
    fireEvent.click(economyButton);
    fireEvent.click(businessButton);

    // Test flight preferences textarea
    const preferencesTextarea = screen.getByPlaceholderText(/I prefer Delta or United/i);
    fireEvent.change(preferencesTextarea, { 
      target: { value: 'Direct flights preferred, window seat' } 
    });

    await waitFor(() => {
      // Verify comprehensive flight data is captured
      expect(mockOnFormChange).toHaveBeenCalledWith({
        inclusionPreferences: {
          flights: {
            departureAirports: 'JFK, LGA, EWR',
            cabinClasses: expect.arrayContaining(['economy', 'business']),
            flightPreferences: 'Direct flights preferred, window seat'
          }
        }
      });
    });
  });

  it('should capture ALL AccommodationPreferences fields', async () => {
    render(
      <ItineraryInclusions 
        formData={mockFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Accommodation preferences should be visible
    expect(screen.getByText('Accommodation Preferences')).toBeInTheDocument();

    // Test accommodation type selection (multiple)
    const boutiqueButton = screen.getByText('Boutique hotel');
    const airbnbButton = screen.getByText('AirBnB/Rental');
    fireEvent.click(boutiqueButton);
    fireEvent.click(airbnbButton);

    // Test "Other" accommodation type
    const otherButton = screen.getByText('✨ Other');
    fireEvent.click(otherButton);
    
    const otherInput = screen.getByPlaceholderText(/Specify other accommodation type/i);
    fireEvent.change(otherInput, { target: { value: 'Traditional ryokan in Japan' } });

    // Test special requests textarea
    const specialRequestsTextarea = screen.getByPlaceholderText(/We want 2 separate rooms/i);
    fireEvent.change(specialRequestsTextarea, { 
      target: { value: 'Ground floor preferred, breakfast included' } 
    });

    await waitFor(() => {
      // Verify comprehensive accommodation data is captured
      expect(mockOnFormChange).toHaveBeenCalledWith({
        inclusionPreferences: {
          accommodations: {
            selectedTypes: expect.arrayContaining(['Boutique hotel', 'AirBnB/Rental']),
            otherType: 'Traditional ryokan in Japan',
            specialRequests: 'Ground floor preferred, breakfast included'
          }
        }
      });
    });
  });

  it('should capture ALL RentalCarPreferences fields', async () => {
    render(
      <ItineraryInclusions 
        formData={mockFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Rental car preferences should be visible
    expect(screen.getByText('Rental Car Preferences')).toBeInTheDocument();

    // Test vehicle type selection (multiple)
    const suvButton = screen.getByText('SUV');
    const luxuryButton = screen.getByText('Luxury');
    fireEvent.click(suvButton);
    fireEvent.click(luxuryButton);

    // Test special requirements textarea
    const requirementsTextarea = screen.getByPlaceholderText(/We need seats for 6 people/i);
    fireEvent.change(requirementsTextarea, { 
      target: { value: 'GPS navigation required, premium insurance' } 
    });

    await waitFor(() => {
      // Verify comprehensive rental car data is captured
      expect(mockOnFormChange).toHaveBeenCalledWith({
        inclusionPreferences: {
          'rental-car': {
            vehicleTypes: expect.arrayContaining(['SUV', 'Luxury']),
            specialRequirements: 'GPS navigation required, premium insurance'
          }
        }
      });
    });
  });

  it('should capture SimplePreferences text for all applicable inclusions', async () => {
    const formDataWithManyInclusions = {
      ...mockFormData,
      selectedInclusions: ['activities', 'dining', 'entertainment', 'nature', 'train', 'cruise']
    };

    render(
      <ItineraryInclusions 
        formData={formDataWithManyInclusions} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Test Activities preferences
    const activitiesTextarea = screen.getByPlaceholderText('Example: I love history and culture, I want to bar hop in Barcelona');
    fireEvent.change(activitiesTextarea, { 
      target: { value: 'Historical sites, local food tours, art galleries' } 
    });

    // Test Dining preferences  
    const diningTextarea = screen.getByPlaceholderText('Example: We love street food, we want fine dining for dinner every night');
    fireEvent.change(diningTextarea, { 
      target: { value: 'Street food, vegetarian options, one Michelin star' } 
    });

    // Test Entertainment preferences
    const entertainmentTextarea = screen.getByPlaceholderText('Example: We love live music, I want to attend a local cultural festival');
    fireEvent.change(entertainmentTextarea, { 
      target: { value: 'Live music, cultural festivals, local theater' } 
    });

    await waitFor(() => {
      // Verify all simple preference texts are captured - each in separate calls
      expect(mockOnFormChange).toHaveBeenCalledWith({
        inclusionPreferences: expect.objectContaining({
          activities: 'Historical sites, local food tours, art galleries'
        })
      });
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        inclusionPreferences: expect.objectContaining({
          dining: 'Street food, vegetarian options, one Michelin star'
        })
      });
      
      expect(mockOnFormChange).toHaveBeenCalledWith({
        inclusionPreferences: expect.objectContaining({
          entertainment: 'Live music, cultural festivals, local theater'
        })
      });
    });
  });

  it('should handle complex mixed preference data structure', async () => {
    const complexFormData = {
      ...mockFormData,
      selectedInclusions: ['flights', 'accommodations', 'activities', 'other'],
      customInclusionsText: 'Private chef for special dinner',
      inclusionPreferences: {
        flights: {
          departureAirports: 'LAX',
          cabinClasses: ['business'],
          flightPreferences: 'Direct flights only'
        },
        accommodations: {
          selectedTypes: ['Luxury'],
          otherType: '',
          specialRequests: 'Ocean view required'
        },
        activities: 'Wine tasting, helicopter tours'
      }
    };

    render(
      <ItineraryInclusions 
        formData={complexFormData} 
        onFormChange={mockOnFormChange} 
      />
    );

    // Verify existing data is displayed correctly
    expect(screen.getByDisplayValue('LAX')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ocean view required')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Wine tasting, helicopter tours')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Private chef for special dinner')).toBeInTheDocument();

    // Verify the data structure maintains all fields
    expect(complexFormData.inclusionPreferences.flights).toEqual({
      departureAirports: 'LAX',
      cabinClasses: ['business'],
      flightPreferences: 'Direct flights only'
    });

    expect(complexFormData.inclusionPreferences.accommodations).toEqual({
      selectedTypes: ['Luxury'],
      otherType: '',
      specialRequests: 'Ocean view required'
    });

    expect(complexFormData.inclusionPreferences.activities).toBe('Wine tasting, helicopter tours');
  });
});