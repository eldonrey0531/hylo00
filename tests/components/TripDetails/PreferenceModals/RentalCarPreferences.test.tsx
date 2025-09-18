import { describe, it, expect, vi } from 'vitest';import { describe, it, expect, vi, beforeEach } from 'vitest';import { describe, it, expect, vi } from 'vitest';import { describe, it, expect, vi } from 'vitest';

import { render, screen, fireEvent } from '@testing-library/react';

import RentalCarPreferences from '../../../../src/components/TripDetails/PreferenceModals/RentalCarPreferences';import { render, screen, fireEvent } from '@testing-library/react';



// Mock props for the componentimport RentalCarPreferences from '../../../../src/components/TripDetails/PreferenceModals/RentalCarPreferences';import { render, screen, fireEvent } from '@testing-library/react';import { render, screen, fireEvent } from '@testing-library/react';

const mockProps = {

  preferences: {

    vehicleTypes: [],

    carType: '',// Mock props for the componentimport RentalCarPreferences from '../../../../src/components/TripDetails/PreferenceModals/RentalCarPreferences';import RentalCarPreferences from '../../../../src/components/TripDetails/PreferenceModals/RentalCarPreferences';

    features: [],

    additionalRequests: ''const mockProps = {

  },

  onSave: vi.fn()  preferences: {

};

    vehicleTypes: [],

describe('RentalCarPreferences - Full-Width Header Contract Tests', () => {

  it('should have header container that occupies full width of first row', () => {    carType: '',// Mock props for the component

    render(<RentalCarPreferences {...mockProps} />);

        features: [],

    // Find the header container - it should span full width

    const headerContainer = screen.getByText('Vehicle Type').closest('div');    additionalRequests: ''const mockProps = {

    expect(headerContainer).toBeInTheDocument();

      },  preferences: {

    // Header container MUST have w-full class for full width

    expect(headerContainer).toHaveClass('w-full');  onSave: vi.fn()    vehicleTypes: [],

    

    // Header should NOT have rounded corners to occupy full width};    carType: '',

    const classList = Array.from(headerContainer?.classList || []);

    const hasRoundedCorners = classList.some(className => 

      className.includes('rounded-[') && !className.includes('rounded-[0')

    );describe('RentalCarPreferences - Full-Width Header Contract Tests', () => {    specialRequirements: ''    features: [],

    expect(hasRoundedCorners).toBe(false);

  });  beforeEach(() => {



  it('should have proper flex layout for header elements', () => {    vi.clearAllMocks();  },    additionalRequests: ''

    render(<RentalCarPreferences {...mockProps} />);

      });

    const headerContainer = screen.getByText('Vehicle Type').closest('div');

      onSave: vi.fn()  },

    // Header should use flex layout

    expect(headerContainer).toHaveClass('flex');  it('should have header container that occupies full width of first row', () => {

    expect(headerContainer).toHaveClass('items-center');

        render(<RentalCarPreferences {...mockProps} />);};  onSave: vi.fn()

    // Should have proper spacing between elements

    expect(headerContainer).toHaveClass('space-x-3');    

  });

    // Find the header container};

  it('should maintain background styling without border interruptions', () => {

    render(<RentalCarPreferences {...mockProps} />);    const headerContainer = screen.getByText('Vehicle Type').closest('div');

    

    const headerContainer = screen.getByText('Vehicle Type').closest('div');    describe('RentalCarPreferences - Full-Width Header Contract Tests', () => {

    

    // Header should have consistent dark background    // Should have full width class

    const classList = Array.from(headerContainer?.classList || []);

    const hasCorrectBackground = classList.some(className =>    expect(headerContainer).toHaveClass('w-full');  it('should have header container that occupies full width of first row', () => {describe('RentalCarPreferences - UI Improvements', () => {

      className.includes('bg-[#406170]')

    );    

    expect(hasCorrectBackground).toBe(true);

  });    // Should be a flex container    render(<RentalCarPreferences {...mockProps} />);  it('should have full-width background without border interruptions', () => {



  it('should maintain existing functionality', () => {    expect(headerContainer).toHaveClass('flex');

    render(<RentalCarPreferences {...mockProps} />);

      });        render(<RentalCarPreferences {...mockProps} />);

    // Verify key elements are still present and functional

    expect(screen.getByText('Vehicle Type')).toBeInTheDocument();

  });

});  it('should have proper flex layout for header elements', () => {    // Find the header container - it should span full width    



describe('RentalCarPreferences - 2x2 Grid Layout Contract Tests', () => {    render(<RentalCarPreferences {...mockProps} />);

  it('should have vehicle type options in a 2x2 grid layout', () => {

    render(<RentalCarPreferences {...mockProps} />);        const headerContainer = screen.getByText('Rental Car Preferences').closest('div');    // Find the main container

    

    // Find the grid container for vehicle types    // Find the header container

    const gridContainer = screen.getByText('Economy').closest('div').parentElement;

        const headerContainer = screen.getByText('Vehicle Type').closest('div');    expect(headerContainer).toBeInTheDocument();    const container = screen.getByText('Rental Car Preferences').closest('div');

    // Should use grid layout with 2 columns (2x2)

    expect(gridContainer).toHaveClass('grid');    

    expect(gridContainer).toHaveClass('grid-cols-2');

        // Should have proper flex classes        expect(container).toBeInTheDocument();

    // Should NOT have the old 4-column layout

    expect(gridContainer).not.toHaveClass('grid-cols-4');    expect(headerContainer).toHaveClass('items-center');

  });

    expect(headerContainer).toHaveClass('space-x-3');    // Header container MUST have w-full class for full width    

  it('should maintain proper gap between grid items', () => {

    render(<RentalCarPreferences {...mockProps} />);  });

    

    // Find the grid container    expect(headerContainer).toHaveClass('w-full');    // Check for full-width styling (w-full class)

    const gridContainer = screen.getByText('Economy').closest('div').parentElement;

      it('should maintain background styling without border interruptions', () => {

    // Should have proper gap

    expect(gridContainer).toHaveClass('gap-2');    render(<RentalCarPreferences {...mockProps} />);        // This should be applied to prevent border interruptions

  });

    

  it('should have exactly 4 vehicle type options visible in 2x2 layout', () => {

    render(<RentalCarPreferences {...mockProps} />);    // Find the header container    // Header should NOT have rounded corners to occupy full width    expect(container).toHaveClass('w-full');

    

    // Should have 4 vehicle type options    const headerContainer = screen.getByText('Vehicle Type').closest('div');

    const vehicleTypes = ['Economy', 'Compact', 'Mid-size', 'Full-size'];

            const classList = Array.from(headerContainer?.classList || []);  });

    vehicleTypes.forEach(type => {

      expect(screen.getByText(type)).toBeInTheDocument();    // Should have background color

    });

        expect(headerContainer).toHaveClass('bg-[#406170]');    const hasRoundedCorners = classList.some(className => 

    // Grid should contain all 4 options

    const gridContainer = screen.getByText('Economy').closest('div').parentElement;    

    const buttons = gridContainer.querySelectorAll('button');

    expect(buttons).toHaveLength(4);    // Should have padding      className.includes('rounded-[') && !className.includes('rounded-[0')  it('should have consistent background without border breaks', () => {

  });

});    expect(headerContainer).toHaveClass('px-4');

    expect(headerContainer).toHaveClass('py-3');    );    render(<RentalCarPreferences {...mockProps} />);

    

    // Should NOT have rounded corners that create border interruptions    expect(hasRoundedCorners).toBe(false);    

    expect(headerContainer).not.toHaveClass('rounded-[20px]');

  });  });    // The main container should have consistent background styling



  it('should handle preference saving functionality', () => {    const headerContainer = screen.getByText('Rental Car Preferences').closest('div');

    render(<RentalCarPreferences {...mockProps} />);

      it('should have proper flex layout for header elements', () => {    expect(headerContainer).toBeInTheDocument();

    // Find and click a vehicle type option

    const vehicleOption = screen.getByText('Economy');    render(<RentalCarPreferences {...mockProps} />);    

    fireEvent.click(vehicleOption);

            // Should maintain background styling without border interruptions

    // Find and click save button

    const saveButton = screen.getByText('Save Preferences');    const headerContainer = screen.getByText('Rental Car Preferences').closest('div');    const classList = Array.from(headerContainer?.classList || []);

    fireEvent.click(saveButton);

            const hasConsistentBackground = classList.some(className => 

    // Should call onSave

    expect(mockProps.onSave).toHaveBeenCalled();    // Header should use flex layout      className.includes('bg-[#406170]')

  });

    expect(headerContainer).toHaveClass('flex');    );

  it('should maintain existing functionality while improving styling', () => {

    render(<RentalCarPreferences {...mockProps} />);    expect(headerContainer).toHaveClass('items-center');    expect(hasConsistentBackground).toBe(true);

    

    // Should render vehicle type options      });

    expect(screen.getByText('Economy')).toBeInTheDocument();

    expect(screen.getByText('Compact')).toBeInTheDocument();    // Should have proper spacing between elements

    expect(screen.getByText('Mid-size')).toBeInTheDocument();

    expect(screen.getByText('Full-size')).toBeInTheDocument();    expect(headerContainer).toHaveClass('space-x-3');  it('should maintain proper spacing without border disruptions', () => {

    

    // Should have save button  });    render(<RentalCarPreferences {...mockProps} />);

    expect(screen.getByText('Save Preferences')).toBeInTheDocument();

        

    // Should allow clicking options

    const economyOption = screen.getByText('Economy');  it('should maintain background styling without border interruptions', () => {    const container = screen.getByText('Rental Car Preferences').closest('div');

    fireEvent.click(economyOption);

    expect(economyOption.closest('button')).toHaveClass('bg-[#17a2b8]');    render(<RentalCarPreferences {...mockProps} />);    

  });

});        // Should have proper padding/margin classes for spacing



describe('RentalCarPreferences - 2x2 Grid Layout Contract Tests', () => {    const headerContainer = screen.getByText('Rental Car Preferences').closest('div');    const classList = Array.from(container?.classList || []);

  beforeEach(() => {

    vi.clearAllMocks();        const hasSpacingClasses = classList.some(className => 

  });

    // Header should have consistent dark background      className.startsWith('p-') || className.startsWith('m-') || 

  it('should have vehicle type options in a 2x2 grid layout', () => {

    render(<RentalCarPreferences {...mockProps} />);    const classList = Array.from(headerContainer?.classList || []);      className.startsWith('px-') || className.startsWith('py-') ||

    

    // Find the grid container for vehicle types    const hasCorrectBackground = classList.some(className =>       className.startsWith('mx-') || className.startsWith('my-')

    const gridContainer = screen.getByText('Economy').closest('div').parentElement;

          className.includes('bg-[#406170]')    );

    // Should use grid layout with 2 columns (2x2)

    expect(gridContainer).toHaveClass('grid');    );    expect(hasSpacingClasses).toBe(true);

    expect(gridContainer).toHaveClass('grid-cols-2');

        expect(hasCorrectBackground).toBe(true);  });

    // Should NOT have the old 4-column layout

    expect(gridContainer).not.toHaveClass('grid-cols-4');  });

  });

  it('should handle preference saving functionality', () => {

  it('should maintain proper gap between grid items', () => {

    render(<RentalCarPreferences {...mockProps} />);  it('should maintain existing functionality', () => {    render(<RentalCarPreferences {...mockProps} />);

    

    // Find the grid container    render(<RentalCarPreferences {...mockProps} />);    

    const gridContainer = screen.getByText('Economy').closest('div').parentElement;

            // Find a car type option to click (assuming there are buttons for car types)

    // Should have proper gap

    expect(gridContainer).toHaveClass('gap-2');    // Verify key elements are still present and functional    const buttons = screen.getAllByRole('button');

  });

    expect(screen.getByText('Rental Car Preferences')).toBeInTheDocument();    if (buttons.length > 0 && buttons[0]) {

  it('should have exactly 4 vehicle type options visible in 2x2 layout', () => {

    render(<RentalCarPreferences {...mockProps} />);  });      fireEvent.click(buttons[0]);

    

    // Should have 4 vehicle type options});      // The onSave should be called when preferences change

    const vehicleTypes = ['Economy', 'Compact', 'Mid-size', 'Full-size'];

          expect(mockProps.onSave).toHaveBeenCalled();

    vehicleTypes.forEach(type => {

      expect(screen.getByText(type)).toBeInTheDocument();describe('RentalCarPreferences - 2x2 Grid Layout Contract Tests', () => {    }

    });

      it('should have vehicle options in a 2x2 grid layout', () => {  });

    // Grid should contain all 4 options

    const gridContainer = screen.getByText('Economy').closest('div').parentElement;    render(<RentalCarPreferences {...mockProps} />);

    const buttons = gridContainer.querySelectorAll('button');

    expect(buttons).toHaveLength(4);      it('should maintain existing functionality while improving styling', () => {

  });

});    // Find the vehicle types container    render(<RentalCarPreferences {...mockProps} />);

    const gridContainer = screen.getByText('Economy').closest('.grid');    

    expect(gridContainer).toBeInTheDocument();    // Verify key elements are still present and functional

        expect(screen.getByText('Rental Car Preferences')).toBeInTheDocument();

    // Should use grid layout with 2 columns (2x2)    

    expect(gridContainer).toHaveClass('grid');    // Check for interactive elements

    expect(gridContainer).toHaveClass('grid-cols-2');    const inputs = screen.getAllByRole('textbox');

        const buttons = screen.getAllByRole('button');

    // Should NOT have the old 4-column layout    

    expect(gridContainer).not.toHaveClass('grid-cols-4');    // Should have some interactive elements for car preferences

  });    expect(inputs.length + buttons.length).toBeGreaterThan(0);

  });

  it('should maintain proper gap between grid items', () => {});
    render(<RentalCarPreferences {...mockProps} />);
    
    const gridContainer = screen.getByText('Economy').closest('.grid');
    
    // Should maintain gap between items
    expect(gridContainer).toHaveClass('gap-2');
  });

  it('should have exactly 4 vehicle options visible in 2x2 layout', () => {
    render(<RentalCarPreferences {...mockProps} />);
    
    // Count vehicle type buttons
    const vehicleButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && 
      ['Economy', 'Compact', 'Mid-size', 'Full-size'].includes(button.textContent.trim())
    );
    
    // Should have at least 4 main vehicle types for 2x2 grid
    expect(vehicleButtons.length).toBeGreaterThanOrEqual(4);
  });
});