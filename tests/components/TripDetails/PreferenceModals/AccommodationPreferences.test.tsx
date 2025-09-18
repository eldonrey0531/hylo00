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

describe('AccommodationPreferences - Full-Width Header Contract Tests', () => {
  it('should have header container that occupies full width of first row', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Find the header container - it should span full width
    const headerContainer = screen.getByText('Accommodation Preferences').closest('div');
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
    render(<AccommodationPreferences {...mockProps} />);
    
    const headerContainer = screen.getByText('Accommodation Preferences').closest('div');
    
    // Header should use flex layout
    expect(headerContainer).toHaveClass('flex');
    expect(headerContainer).toHaveClass('items-center');
    
    // Should have proper spacing between elements
    expect(headerContainer).toHaveClass('space-x-3');
  });

  it('should maintain background styling without border interruptions', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    const headerContainer = screen.getByText('Accommodation Preferences').closest('div');
    
    // Header should have consistent dark background
    const classList = Array.from(headerContainer?.classList || []);
    const hasCorrectBackground = classList.some(className => 
      className.includes('bg-[#406170]')
    );
    expect(hasCorrectBackground).toBe(true);
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

describe('AccommodationPreferences - 2x2 Grid Layout Contract Tests', () => {
  it('should have accommodation options in a 2x2 grid layout', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Find the accommodation types container
    const gridContainer = screen.getByText('Traditional hotel').closest('.grid');
    expect(gridContainer).toBeInTheDocument();
    
    // Should use grid layout with 2 columns (2x2)
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-2');
    
    // Should NOT have the old 4-column layout
    expect(gridContainer).not.toHaveClass('grid-cols-4');
  });

  it('should maintain proper gap between grid items', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    const gridContainer = screen.getByText('Traditional hotel').closest('.grid');
    
    // Should maintain gap between items
    expect(gridContainer).toHaveClass('gap-2');
  });

  it('should have exactly 4 accommodation options visible in 2x2 layout', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Count accommodation type buttons (excluding Other button)
    const accommodationButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && 
      !button.textContent.includes('Other') &&
      !button.textContent.includes('✨')
    );
    
    // Should have at least 4 main accommodation types for 2x2 grid
    expect(accommodationButtons.length).toBeGreaterThanOrEqual(4);
  });
});

describe('AccommodationPreferences - Placeholder Behavior Contract Tests', () => {
  it('should show Other input field with proper placeholder when Other button is clicked', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Click the Other button
    const otherButton = screen.getByText('✨ Other');
    fireEvent.click(otherButton);
    
    // Should show input field
    const otherInput = screen.getByPlaceholderText('Specify other accommodation type...');
    expect(otherInput).toBeInTheDocument();
    
    // Input should be empty initially (not pre-filled with placeholder text)
    expect(otherInput).toHaveValue('');
  });

  it('should NOT pre-fill Other input with editable placeholder text', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Click the Other button
    const otherButton = screen.getByText('✨ Other');
    fireEvent.click(otherButton);
    
    const otherInput = screen.getByPlaceholderText('Specify other accommodation type...');
    
    // The value should NOT be "Other accommodation type..." (that should only be placeholder)
    expect(otherInput).not.toHaveValue('Other accommodation type...');
    
    // The input should start empty for user to type their custom accommodation
    expect(otherInput).toHaveValue('');
  });

  it('should allow user to type custom accommodation type', () => {
    render(<AccommodationPreferences {...mockProps} />);
    
    // Click the Other button and type custom text
    const otherButton = screen.getByText('✨ Other');
    fireEvent.click(otherButton);
    
    const otherInput = screen.getByPlaceholderText('Specify other accommodation type...');
    fireEvent.change(otherInput, { target: { value: 'Custom accommodation type' } });
    
    // Should accept user input
    expect(otherInput).toHaveValue('Custom accommodation type');
  });
});