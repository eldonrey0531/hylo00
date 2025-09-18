import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RentalCarPreferences from '../../../../src/components/TripDetails/PreferenceModals/RentalCarPreferences';

// Mock props for the component
const mockProps = {
  preferences: {
    carType: '',
    features: [],
    additionalRequests: ''
  },
  onSave: vi.fn()
};

describe('RentalCarPreferences - UI Improvements', () => {
  it('should have full-width background without border interruptions', () => {
    render(<RentalCarPreferences {...mockProps} />);
    
    // Find the main container
    const container = screen.getByText('Rental Car Preferences').closest('div');
    expect(container).toBeInTheDocument();
    
    // Check for full-width styling (w-full class)
    // This should be applied to prevent border interruptions
    expect(container).toHaveClass('w-full');
  });

  it('should have consistent background without border breaks', () => {
    render(<RentalCarPreferences {...mockProps} />);
    
    // The main container should have consistent background styling
    const headerContainer = screen.getByText('Rental Car Preferences').closest('div');
    expect(headerContainer).toBeInTheDocument();
    
    // Should maintain background styling without border interruptions
    const classList = Array.from(headerContainer?.classList || []);
    const hasConsistentBackground = classList.some(className => 
      className.includes('bg-[#406170]')
    );
    expect(hasConsistentBackground).toBe(true);
  });

  it('should maintain proper spacing without border disruptions', () => {
    render(<RentalCarPreferences {...mockProps} />);
    
    const container = screen.getByText('Rental Car Preferences').closest('div');
    
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
    render(<RentalCarPreferences {...mockProps} />);
    
    // Find a car type option to click (assuming there are buttons for car types)
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 0 && buttons[0]) {
      fireEvent.click(buttons[0]);
      // The onSave should be called when preferences change
      expect(mockProps.onSave).toHaveBeenCalled();
    }
  });

  it('should maintain existing functionality while improving styling', () => {
    render(<RentalCarPreferences {...mockProps} />);
    
    // Verify key elements are still present and functional
    expect(screen.getByText('Rental Car Preferences')).toBeInTheDocument();
    
    // Check for interactive elements
    const inputs = screen.getAllByRole('textbox');
    const buttons = screen.getAllByRole('button');
    
    // Should have some interactive elements for car preferences
    expect(inputs.length + buttons.length).toBeGreaterThan(0);
  });
});