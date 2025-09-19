// tests/components/DateRangePicker.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateRangePicker from '../../src/components/TripDetails/DateRangePicker';

describe('DateRangePicker', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    departDate: '',
    returnDate: '',
    onDatesChange: vi.fn(),
    disabled: false,
  };

  it('renders when open', () => {
    render(<DateRangePicker {...defaultProps} />);
    
    expect(screen.getByText('Select Travel Dates')).toBeInTheDocument();
    expect(screen.getByLabelText('Departure date')).toBeInTheDocument();
    expect(screen.getByLabelText('Return date')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<DateRangePicker {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Select Travel Dates')).not.toBeInTheDocument();
  });

  it('shows existing dates in inputs', () => {
    const props = {
      ...defaultProps,
      departDate: '12/25/24',
      returnDate: '01/02/25',
    };
    
    render(<DateRangePicker {...props} />);
    
    const departInput = screen.getByLabelText('Departure date') as HTMLInputElement;
    const returnInput = screen.getByLabelText('Return date') as HTMLInputElement;
    
    expect(departInput.value).toBe('2024-12-25');
    expect(returnInput.value).toBe('2025-01-02');
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<DateRangePicker {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn();
    render(<DateRangePicker {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByLabelText('Close date picker'));
    expect(onClose).toHaveBeenCalled();
  });

  it('validates departure date is required', async () => {
    render(<DateRangePicker {...defaultProps} />);
    
    const saveButton = screen.getByText('Save Dates');
    expect(saveButton).toBeDisabled();
  });

  it('validates return date must be after departure date', async () => {
    render(<DateRangePicker {...defaultProps} />);
    
    const departInput = screen.getByLabelText('Departure date');
    const returnInput = screen.getByLabelText('Return date');
    
    // Set departure date to future date
    fireEvent.change(departInput, { target: { value: '2025-12-25' } });
    
    // Set return date to earlier date
    fireEvent.change(returnInput, { target: { value: '2025-12-20' } });
    
    await waitFor(() => {
      expect(screen.getByText('Return date must be after departure date')).toBeInTheDocument();
    });
  });

  it('calls onDatesChange when save is clicked with valid dates', async () => {
    const onDatesChange = vi.fn();
    render(<DateRangePicker {...defaultProps} onDatesChange={onDatesChange} />);
    
    const departInput = screen.getByLabelText('Departure date');
    const returnInput = screen.getByLabelText('Return date');
    
    // Set valid future dates
    fireEvent.change(departInput, { target: { value: '2025-12-25' } });
    fireEvent.change(returnInput, { target: { value: '2025-12-28' } });
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save Dates');
      expect(saveButton).not.toBeDisabled();
      fireEvent.click(saveButton);
    });
    
    expect(onDatesChange).toHaveBeenCalledWith('12/25/25', '12/28/25');
  });

  it('shows trip duration when both dates are set', async () => {
    render(<DateRangePicker {...defaultProps} />);
    
    const departInput = screen.getByLabelText('Departure date');
    const returnInput = screen.getByLabelText('Return date');
    
    // Set dates with 3 day difference
    fireEvent.change(departInput, { target: { value: '2025-12-25' } });
    fireEvent.change(returnInput, { target: { value: '2025-12-28' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Trip Duration: 3 days/)).toBeInTheDocument();
    });
  });

  it('disables return date input when no departure date is set', () => {
    render(<DateRangePicker {...defaultProps} />);
    
    const returnInput = screen.getByLabelText('Return date') as HTMLInputElement;
    expect(returnInput).toBeDisabled();
    expect(screen.getByText('Select departure date first')).toBeInTheDocument();
  });
});