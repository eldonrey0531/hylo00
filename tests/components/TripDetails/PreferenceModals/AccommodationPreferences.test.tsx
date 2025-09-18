import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccommodationPreferences from '../../../../src/components/TripDetails/PreferenceModals/AccommodationPreferences';

// Mock props for the component
const mockProps = {
  preferences: {
    selectedTypes: ['Traditional hotel'],
    otherType: '',
    specialRequests: ''
  },
  onSave: vi.fn()
};

describe('AccommodationPreferences - UI Improvements', () => {
  it('should have full-width background without border interruptions', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Find the main container
    const container = screen.getByText('Accommodation Preferences').closest('div');
    expect(container).toBeInTheDocument();
    
    // Check for full-width styling (w-full class)
    // This should be applied to prevent border interruptions
    expect(container).toHaveClass('w-full');
  });

  it('should have consistent background without border breaks', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // The main container should have consistent background styling
    const headerContainer = screen.getByText('Accommodation Preferences').closest('div');
    expect(headerContainer).toBeInTheDocument();
    
    // Should maintain background styling without border interruptions
    const classList = Array.from(headerContainer?.classList || []);
    const hasConsistentBackground = classList.some(className => 
      className.includes('bg-[#406170]')
    );
    expect(hasConsistentBackground).toBe(true);
  });

  it('should maintain proper spacing without border disruptions', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    const container = screen.getByText('Accommodation Preferences').closest('div');
    
    // Should have proper padding/margin classes for spacing
    const classList = Array.from(container?.classList || []);
    const hasSpacingClasses = classList.some(className => 
      className.startsWith('p-') || className.startsWith('m-') || 
      className.startsWith('px-') || className.startsWith('py-') ||
      className.startsWith('mx-') || className.startsWith('my-')
    );
    expect(hasSpacingClasses).toBe(true);
  });

  it('should handle preference saving functionality', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Find a preference option to click
    const hotelOption = screen.getByText('Traditional hotel');
    fireEvent.click(hotelOption);
    
    // The onSave should be called when preferences change
    expect(mockProps.onSave).toHaveBeenCalled();
  });

  it('should maintain existing functionality while improving styling', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Verify key elements are still present and functional
    expect(screen.getByText('Accommodation Preferences')).toBeInTheDocument();
    expect(screen.getByText('Preferred accommodation type(s)')).toBeInTheDocument();
    
    // Check for accommodation type options
    const accommodationButtons = screen.getAllByRole('button');
    expect(accommodationButtons.length).toBeGreaterThan(0);
    
    // Should have the types we expect
    expect(screen.getByText('Traditional hotel')).toBeInTheDocument();
    expect(screen.getByText('Boutique hotel')).toBeInTheDocument();
  });
});