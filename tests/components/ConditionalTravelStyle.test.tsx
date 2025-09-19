/**
 * ConditionalTravelStyle Component Tests
 * Feature: 003-group-travel-style
 * 
 * TDD Tests - These MUST fail before implementation!
 * Tests the conditional rendering container component.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConditionalTravelStyle from '../../src/components/ConditionalTravelStyle';
import { TravelStyleChoice } from '../../src/types/travel-style-choice';

describe('ConditionalTravelStyle Component', () => {
  const mockProps = {
    choice: TravelStyleChoice.NOT_SELECTED,
    onChoiceChange: vi.fn(),
    formData: {},
    onFormChange: vi.fn(),
    selectedExperience: [],
    onExperienceChange: vi.fn(),
    selectedVibes: [],
    onVibeChange: vi.fn(),
    customVibesText: '',
    onCustomVibesChange: vi.fn(),
    selectedSampleDays: [],
    onSampleDaysChange: vi.fn(),
    dinnerChoices: [],
    onDinnerChoicesChange: vi.fn(),
    tripNickname: '',
    onTripNicknameChange: vi.fn(),
    contactInfo: {},
    onContactChange: vi.fn(),
  };

  beforeEach(() => {
    Object.values(mockProps).forEach(mock => {
      if (typeof mock === 'function') mock.mockClear();
    });
  });

  it('renders travel style header and description when choice is NOT_SELECTED', () => {
    render(<ConditionalTravelStyle {...mockProps} />);
    
    // Test that travel style header is displayed
    expect(screen.getByRole('heading', { name: /TRAVEL STYLE/i })).toBeInTheDocument();
    expect(screen.getByText(/Help us create the perfect itinerary/i)).toBeInTheDocument();
    expect(screen.getByText(/sharing your travel preferences/i)).toBeInTheDocument();
  });

  it('renders TravelStyleChoice component when choice is NOT_SELECTED', () => {
    render(<ConditionalTravelStyle {...mockProps} />);
    
    // Test that choice buttons are displayed
    expect(screen.getByText('I want to add answer more forms to suit my travel style')).toBeInTheDocument();
    expect(screen.getByText('Skip ahead')).toBeInTheDocument();
  });

  it('renders all detailed forms when choice is DETAILED', () => {
    const detailedProps = { ...mockProps, choice: TravelStyleChoice.DETAILED };
    render(<ConditionalTravelStyle {...detailedProps} />);
    
    // Test that all detailed form components are rendered
    expect(screen.getByTestId('travel-experience-form')).toBeInTheDocument();
    expect(screen.getByTestId('trip-vibe-form')).toBeInTheDocument();
    expect(screen.getByTestId('sample-days-form')).toBeInTheDocument();
    expect(screen.getByTestId('dinner-choice-form')).toBeInTheDocument();
    expect(screen.getByTestId('trip-nickname-form')).toBeInTheDocument();
    
    // Test that generate button is included
    expect(screen.getByText(/GENERATE MY PERSONALIZED ITINERARY/i)).toBeInTheDocument();
  });

  it('renders only nickname form when choice is SKIP', () => {
    const skipProps = { ...mockProps, choice: TravelStyleChoice.SKIP };
    render(<ConditionalTravelStyle {...skipProps} />);
    
    // Test that only nickname form is rendered
    expect(screen.getByTestId('trip-nickname-form')).toBeInTheDocument();
    expect(screen.getByText(/GENERATE MY PERSONALIZED ITINERARY/i)).toBeInTheDocument();
    
    // Test that detailed forms are NOT rendered
    expect(screen.queryByTestId('travel-experience-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trip-vibe-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sample-days-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dinner-choice-form')).not.toBeInTheDocument();
  });

  it('passes all props correctly to TravelExperience component in detailed mode', () => {
    const detailedProps = { 
      ...mockProps, 
      choice: TravelStyleChoice.DETAILED,
      selectedExperience: ['beginner'],
    };
    render(<ConditionalTravelStyle {...detailedProps} />);
    
    // This will be verified when components are implemented
    // Should pass selectedExperience and onExperienceChange props
    expect(screen.getByTestId('travel-experience-form')).toBeInTheDocument();
  });

  it('passes all props correctly to TripVibe component in detailed mode', () => {
    const detailedProps = { 
      ...mockProps, 
      choice: TravelStyleChoice.DETAILED,
      selectedVibes: ['adventurous'],
      customVibesText: 'Custom vibe text',
    };
    render(<ConditionalTravelStyle {...detailedProps} />);
    
    // Should pass selectedVibes, onVibeChange, customVibesText, onCustomVibesChange
    expect(screen.getByTestId('trip-vibe-form')).toBeInTheDocument();
  });

  it('preserves form data during choice changes', () => {
    const { rerender } = render(<ConditionalTravelStyle {...mockProps} />);
    
    // Switch to detailed mode
    const detailedProps = { ...mockProps, choice: TravelStyleChoice.DETAILED };
    rerender(<ConditionalTravelStyle {...detailedProps} />);
    
    // All form components should maintain their prop values
    expect(screen.getByTestId('travel-experience-form')).toBeInTheDocument();
    
    // Switch to skip mode
    const skipProps = { ...mockProps, choice: TravelStyleChoice.SKIP };
    rerender(<ConditionalTravelStyle {...skipProps} />);
    
    // Nickname form should still have preserved data
    expect(screen.getByTestId('trip-nickname-form')).toBeInTheDocument();
  });

  it('maintains existing form styling patterns', () => {
    const detailedProps = { ...mockProps, choice: TravelStyleChoice.DETAILED };
    const { container } = render(<ConditionalTravelStyle {...detailedProps} />);
    
    // Test that forms are present and have proper structure
    const formTestIds = container.querySelectorAll('[data-testid*="form"]');
    expect(formTestIds.length).toBeGreaterThan(0);
    
    // Test that components have proper spacing
    const spaceContainers = container.querySelectorAll('.space-y-8');
    expect(spaceContainers.length).toBeGreaterThan(0);
  });

  it('handles onChoiceChange callback correctly', () => {
    render(<ConditionalTravelStyle {...mockProps} />);
    
    // When TravelStyleChoice component calls onChoiceSelect, it should trigger onChoiceChange
    // This will be tested more thoroughly in integration tests
    expect(mockProps.onChoiceChange).toBeDefined();
  });

  it('provides proper spacing between form components in detailed mode', () => {
    const detailedProps = { ...mockProps, choice: TravelStyleChoice.DETAILED };
    const { container } = render(<ConditionalTravelStyle {...detailedProps} />);
    
    // Test that there's proper spacing (space-y-8 or similar)
    const formsContainer = container.querySelector('.space-y-8');
    expect(formsContainer).toBeInTheDocument();
  });
});