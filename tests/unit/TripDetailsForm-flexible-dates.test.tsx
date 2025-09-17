// Contract test for TripDetailsForm flexible dates behavior
// Tests FR-001, FR-002, FR-003 from spec.md

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripDetailsForm from '../../src/components/TripDetailsForm';
import {
  createMockFormData,
  createMockHandlers,
  formTestHelpers,
} from '../utils/form-test-helpers';

describe('TripDetailsForm - Flexible Dates Contract', () => {
  let mockFormData: any;
  let mockHandlers: any;

  beforeEach(() => {
    mockFormData = createMockFormData();
    mockHandlers = createMockHandlers();
  });

  describe('FR-001: Hide/replace Depart and Return labels when flexible dates toggle is activated', () => {
    test('should show standard labels when flexible dates is disabled', () => {
      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: false }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Should show standard labels
      expect(screen.getByText('Depart')).toBeInTheDocument();
      expect(screen.getByText('Return')).toBeInTheDocument();

      // Should not show flexible date labels
      expect(screen.queryByText(/trip start.*flexible/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/duration/i)).not.toBeInTheDocument();
    });

    test('should hide Depart and Return labels when flexible dates is enabled', () => {
      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: true }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Should NOT show standard labels
      expect(screen.queryByText(/^depart$/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^return$/i)).not.toBeInTheDocument();
    });

    test('should toggle labels when flexible dates toggle is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: false }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Initial state - should show standard labels
      formTestHelpers.expectFixedDateLabels();

      // Click the flexible dates toggle
      const toggle = screen.getByLabelText(/I'm not sure or my dates are flexible/i);
      await user.click(toggle);

      // Should trigger form change with flexibleDates: true
      expect(mockHandlers.onFormChange).toHaveBeenCalledWith(
        expect.objectContaining({ flexibleDates: true })
      );
    });
  });

  describe('FR-002: Provide contextually appropriate messaging when dates are flexible', () => {
    test('should show contextual labels when flexible dates is enabled', () => {
      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: true }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Should show contextual messaging
      expect(screen.getByText(/trip start/i)).toBeInTheDocument();
      expect(screen.getByText(/duration/i)).toBeInTheDocument();
    });

    test('should show appropriate placeholders for flexible date mode', () => {
      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: true }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Should show duration dropdown instead of return date input
      expect(screen.getByLabelText(/planned days/i)).toBeInTheDocument();

      // Date inputs should be hidden
      const dateInputs = screen.queryAllByPlaceholderText('mm/dd/yy');
      dateInputs.forEach((input) => {
        expect(input).not.toBeVisible();
      });
    });

    test('should provide clear indication of flexible date mode', () => {
      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: true }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Toggle should be checked
      const toggle = screen.getByLabelText(/I'm not sure or my dates are flexible/i);
      expect(toggle).toBeChecked();
    });
  });

  describe('FR-003: Maintain clear visual hierarchy when switching between modes', () => {
    test('should maintain consistent layout when switching modes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: false }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Capture initial layout
      const datesSection = screen.getByText('DATES').closest('div');
      expect(datesSection).toBeInTheDocument();

      // Switch to flexible mode
      rerender(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: true }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Dates section should still be present with same structure
      const datesSectionAfter = screen.getByText('DATES').closest('div');
      expect(datesSectionAfter).toBeInTheDocument();
    });

    test('should preserve form data when switching from fixed to flexible mode', async () => {
      const user = userEvent.setup();
      const formDataWithDates = {
        ...mockFormData,
        departDate: '12/25/24',
        returnDate: '01/02/25',
        flexibleDates: false,
      };

      render(
        <TripDetailsForm formData={formDataWithDates} onFormChange={mockHandlers.onFormChange} />
      );

      // Toggle to flexible dates
      const toggle = screen.getByLabelText(/I'm not sure or my dates are flexible/i);
      await user.click(toggle);

      // Should preserve depart date but clear return date
      expect(mockHandlers.onFormChange).toHaveBeenCalledWith(
        expect.objectContaining({
          flexibleDates: true,
          departDate: '12/25/24', // Should be preserved
          returnDate: '', // Should be cleared
        })
      );
    });

    test('should handle rapid toggling without layout issues', async () => {
      const user = userEvent.setup();

      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: false }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      const toggle = screen.getByLabelText(/I'm not sure or my dates are flexible/i);

      // Rapidly toggle multiple times
      for (let i = 0; i < 5; i++) {
        await user.click(toggle);
        await user.click(toggle);
      }

      // Should end in original state
      formTestHelpers.expectFixedDateLabels();
    });
  });

  describe('Edge Cases', () => {
    test('should handle switching from flexible to fixed mode', async () => {
      const user = userEvent.setup();

      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: true, plannedDays: 7 }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      // Should start in flexible mode
      formTestHelpers.expectFlexibleDateLabels();

      // Toggle to fixed mode
      const toggle = screen.getByLabelText(/I'm not sure or my dates are flexible/i);
      await user.click(toggle);

      // Should clear planned days and show fixed date labels
      expect(mockHandlers.onFormChange).toHaveBeenCalledWith(
        expect.objectContaining({
          flexibleDates: false,
          plannedDays: undefined,
        })
      );
    });

    test('should handle invalid form data gracefully', () => {
      const invalidFormData = {
        ...mockFormData,
        flexibleDates: undefined, // Invalid state
      };

      expect(() => {
        render(
          <TripDetailsForm formData={invalidFormData} onFormChange={mockHandlers.onFormChange} />
        );
      }).not.toThrow();

      // Should default to fixed mode
      formTestHelpers.expectFixedDateLabels();
    });
  });

  describe('Accessibility', () => {
    test('should maintain proper ARIA labels for flexible dates toggle', () => {
      render(<TripDetailsForm formData={mockFormData} onFormChange={mockHandlers.onFormChange} />);

      const toggle = screen.getByLabelText(/I'm not sure or my dates are flexible/i);
      expect(toggle).toHaveAttribute('aria-label');
    });

    test('should announce state changes to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TripDetailsForm
          formData={{ ...mockFormData, flexibleDates: false }}
          onFormChange={mockHandlers.onFormChange}
        />
      );

      const toggle = screen.getByLabelText(/I'm not sure or my dates are flexible/i);

      // Should have proper checked state
      expect(toggle).not.toBeChecked();

      await user.click(toggle);

      // State should be communicated through checked attribute
      expect(toggle).toBeChecked();
    });
  });
});
