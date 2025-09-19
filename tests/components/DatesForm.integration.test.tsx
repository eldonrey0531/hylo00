// tests/components/DatesForm.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DatesForm from '../../src/components/TripDetails/DatesForm';
import { FormData } from '../../src/components/TripDetails/types';

describe('DatesForm Integration', () => {
  const mockFormData: FormData = {
    location: 'Test Location',
    departDate: '',
    returnDate: '',
    flexibleDates: false,
    adults: 2,
    children: 0,
    childrenAges: [],
    budget: 5000,
    currency: 'USD',
    flexibleBudget: false,
    budgetMode: 'total',
    travelStyleChoice: 'not-selected',
    travelStyleAnswers: {},
    selectedGroups: [],
    selectedInterests: [],
    selectedInclusions: [],
    customGroupText: '',
    customInterestsText: '',
    customInclusionsText: '',
    inclusionPreferences: {},
  };

  const defaultProps = {
    formData: mockFormData,
    onFormChange: vi.fn(),
  };

  it('renders dates form with unified date picker', () => {
    render(<DatesForm {...defaultProps} />);
    
    expect(screen.getByText('DATES')).toBeInTheDocument();
    expect(screen.getByText('Travel Dates')).toBeInTheDocument();
    expect(screen.getByText('Edit Dates')).toBeInTheDocument();
  });

  it('shows date display boxes for departure and return', () => {
    render(<DatesForm {...defaultProps} />);
    
    expect(screen.getByText('Depart')).toBeInTheDocument();
    expect(screen.getByText('Return')).toBeInTheDocument();
    expect(screen.getByText('Select date')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('opens date range picker when Edit Dates is clicked', async () => {
    render(<DatesForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Edit Dates'));
    
    await waitFor(() => {
      expect(screen.getByText('Select Travel Dates')).toBeInTheDocument();
    });
  });

  it('displays selected dates in the date boxes', () => {
    const formDataWithDates = {
      ...mockFormData,
      departDate: '12/25/25',
      returnDate: '12/28/25',
    };
    
    render(<DatesForm {...defaultProps} formData={formDataWithDates} />);
    
    expect(screen.getByText('12/25/25')).toBeInTheDocument();
    expect(screen.getByText('12/28/25')).toBeInTheDocument();
  });

  it('shows total days when both dates are present', () => {
    const formDataWithDates = {
      ...mockFormData,
      departDate: '12/25/25',
      returnDate: '12/28/25',
    };
    
    render(<DatesForm {...defaultProps} formData={formDataWithDates} />);
    
    expect(screen.getByText('Total days:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides date picker when flexible dates is enabled', () => {
    const formDataWithFlex = {
      ...mockFormData,
      flexibleDates: true,
    };
    
    render(<DatesForm {...defaultProps} formData={formDataWithFlex} />);
    
    expect(screen.queryByText('Edit Dates')).not.toBeInTheDocument();
    expect(screen.getByText('How many days should we plan?')).toBeInTheDocument();
  });

  it('calls onFormChange when date range picker saves dates', async () => {
    const onFormChange = vi.fn();
    render(<DatesForm {...defaultProps} onFormChange={onFormChange} />);
    
    // Open date picker
    fireEvent.click(screen.getByText('Edit Dates'));
    
    await waitFor(() => {
      expect(screen.getByText('Select Travel Dates')).toBeInTheDocument();
    });

    // Set dates in the date picker
    const departInput = screen.getByLabelText('Departure date');
    const returnInput = screen.getByLabelText('Return date');
    
    fireEvent.change(departInput, { target: { value: '2025-12-25' } });
    fireEvent.change(returnInput, { target: { value: '2025-12-28' } });
    
    // Save dates
    await waitFor(() => {
      const saveButton = screen.getByText('Save Dates');
      fireEvent.click(saveButton);
    });
    
    expect(onFormChange).toHaveBeenCalledWith({
      departDate: '12/25/25',
      returnDate: '12/28/25',
    });
  });

  it('shows flexible dates toggle', () => {
    render(<DatesForm {...defaultProps} />);
    
    expect(screen.getByText("I'm not sure or my dates are flexible")).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});