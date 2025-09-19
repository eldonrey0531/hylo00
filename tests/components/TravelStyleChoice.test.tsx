/**
 * TravelStyleChoice Component Tests
 * Feature: 003-group-travel-style
 * 
 * TDD Tests - These MUST fail before implementation!
 * Tests the choice button component using GenerateItineraryButton styling.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TravelStyleChoice from '../../src/components/TravelStyleChoice';
import { TravelStyleChoice as TravelStyleChoiceEnum } from '../../src/types/travel-style-choice';

describe('TravelStyleChoice Component', () => {
  const mockOnChoiceSelect = vi.fn();

  beforeEach(() => {
    mockOnChoiceSelect.mockClear();
  });

  it('renders two choice buttons with correct labels', () => {
    render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} />);
    
    // Test that both choice buttons are rendered
    expect(screen.getByText('Answer 4 more questions')).toBeInTheDocument();
    expect(screen.getByText('Skip ahead')).toBeInTheDocument();
  });

  it('displays choice buttons in GenerateItineraryButton styling pattern', () => {
    const { container } = render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} />);
    
    // Test container has gradient background (GenerateItineraryButton pattern)
    const gradientContainer = container.querySelector('.bg-gradient-to-br');
    expect(gradientContainer).toBeInTheDocument();
    expect(gradientContainer).toHaveClass('from-[#406170]', 'to-[#2a4552]', 'rounded-[36px]', 'p-8', 'text-white');
    
    // Test buttons have proper styling
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    
    // First button (detailed) should have green background with white text
    const detailedButton = buttons[0];
    expect(detailedButton).toHaveClass('bg-[#b0c29b]', 'text-white', 'border-4', 'border-white', 'rounded-[20px]');
    expect(detailedButton).toHaveClass('font-bold', 'font-raleway', 'text-xl');
    
    // Second button (skip) should have white background
    const skipButton = buttons[1];
    expect(skipButton).toHaveClass('bg-white', 'text-primary', 'border-4', 'border-white', 'rounded-[20px]');
    expect(skipButton).toHaveClass('font-bold', 'font-raleway', 'text-xl');
  });

  it('calls onChoiceSelect with DETAILED when first button clicked', () => {
    render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} />);
    
    const detailedButton = screen.getByText('Answer 4 more questions');
    fireEvent.click(detailedButton);
    
    expect(mockOnChoiceSelect).toHaveBeenCalledWith(TravelStyleChoiceEnum.DETAILED);
    expect(mockOnChoiceSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onChoiceSelect with SKIP when second button clicked', () => {
    render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} />);
    
    const skipButton = screen.getByText('Skip ahead');
    fireEvent.click(skipButton);
    
    expect(mockOnChoiceSelect).toHaveBeenCalledWith(TravelStyleChoiceEnum.SKIP);
    expect(mockOnChoiceSelect).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly when disabled prop is true', () => {
    const { container } = render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} disabled={true} />);
    
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed');
    });
    
    // Should not call handler when disabled
    const detailedButton = screen.getByText('Answer 4 more questions');
    fireEvent.click(detailedButton);
    expect(mockOnChoiceSelect).not.toHaveBeenCalled();
  });

  it('includes proper icons in buttons (Sparkles and FastForward)', () => {
    const { container } = render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} />);
    
    // Test that icons are present (will be implemented as Lucide icons)
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(2);
    
    // Test icon sizing matches GenerateItineraryButton pattern
    icons.forEach(icon => {
      expect(icon).toHaveClass('h-6', 'w-6');
    });
  });

  it('has proper hover effects and transitions', () => {
    const { container } = render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} />);
    
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('transition-all', 'duration-300', 'transform', 'hover:scale-105');
      expect(button).toHaveClass('hover:shadow-2xl', 'hover:shadow-white/30');
    });
  });

  it('applies custom className when provided', () => {
    const { container } = render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} className="custom-class" />);
    
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('custom-class');
  });

  it('has proper ARIA labels for accessibility', () => {
    render(<TravelStyleChoice onChoiceSelect={mockOnChoiceSelect} />);
    
    const detailedButton = screen.getByRole('button', { name: /Choose detailed travel style preferences/i });
    const skipButton = screen.getByRole('button', { name: /Skip ahead to trip nickname/i });
    
    expect(detailedButton).toHaveAttribute('aria-label');
    expect(skipButton).toHaveAttribute('aria-label');
    expect(detailedButton).toHaveAttribute('role', 'button');
    expect(skipButton).toHaveAttribute('role', 'button');
  });
});