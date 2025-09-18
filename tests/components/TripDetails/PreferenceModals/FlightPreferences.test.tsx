import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlightPreferences from '../../../../src/components/TripDetails/PreferenceModals/FlightPreferences';

// Mock props for the component
const mockProps = {
  preferences: {
    departureAirports: '',
    cabinClasses: [],
    flightPreferences: ''
  },
  onSave: vi.fn()
};

describe('FlightPreferences - Full-Width Header Contract Tests', () => {
  it('should have header container that occupies full width of first row', () => {
    render(<FlightPreferences {...mockProps} />);
    
    // Find the header container - it should span full width
    const headerContainer = screen.getByText('Flight Preferences').closest('div');
    expect(headerContainer).toBeInTheDocument();
    
    // Header container MUST have w-full class for full width
    expect(headerContainer).toHaveClass('w-full');
    
    // Header should NOT have rounded corners to occupy full width
    const classList = Array.from(headerContainer?.classList || []);
    const hasRoundedCorners = classList.some(className => 
      className.includes('rounded-[') && !className.includes('rounded-[0')
    );
    expect(hasRoundedCorners).toBe(false);
  });

  it('should have proper flex layout for header elements', () => {
    render(<FlightPreferences {...mockProps} />);
    
    const headerContainer = screen.getByText('Flight Preferences').closest('div');
    
    // Header should use flex layout
    expect(headerContainer).toHaveClass('flex');
    expect(headerContainer).toHaveClass('items-center');
    
    // Should have proper spacing between elements
    expect(headerContainer).toHaveClass('space-x-3');
  });

  it('should maintain background styling without border interruptions', () => {
    render(<FlightPreferences {...mockProps} />);
    
    const headerContainer = screen.getByText('Flight Preferences').closest('div');
    
    // Header should have consistent dark background
    const classList = Array.from(headerContainer?.classList || []);
    const hasCorrectBackground = classList.some(className => 
      className.includes('bg-[#406170]')
    );
    expect(hasCorrectBackground).toBe(true);
  });

  it('should maintain existing functionality', () => {
    render(<FlightPreferences {...mockProps} />);
    
    // Verify key elements are still present and functional
    expect(screen.getByText('Flight Preferences')).toBeInTheDocument();
  });
});