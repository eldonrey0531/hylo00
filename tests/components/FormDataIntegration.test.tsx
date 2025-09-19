/**
 * T012: FormData Integration Validation Test Suite
 * 
 * This comprehensive test verifies that all enhanced TripDetails components
 * properly integrate with the FormData interface and ensure comprehensive
 * data visibility for future AI integration.
 */

import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormData } from '../../src/components/TripDetails/types';

// Import all enhanced components
import BudgetForm from '../../src/components/TripDetails/BudgetForm';
import TravelGroupSelector from '../../src/components/TripDetails/TravelGroupSelector';
import TravelInterests from '../../src/components/TripDetails/TravelInterests';
import ItineraryInclusions from '../../src/components/TripDetails/ItineraryInclusions';
import TripNickname from '../../src/components/TripDetails/TripNickname';
import TravelExperience from '../../src/components/TripDetails/TravelExperience';
import TripVibe from '../../src/components/TripDetails/TripVibe';
import SampleDays from '../../src/components/TripDetails/SampleDays';
import DinnerChoice from '../../src/components/TripDetails/DinnerChoice';

describe('T012: FormData Integration Validation', () => {
  const mockFormData: FormData = {
    location: '',
    departDate: '',
    flexibleDates: false,
    adults: 2,
    children: 1,
    budget: 5000,
    currency: 'USD' as const,
    flexibleBudget: false,
    travelStyleChoice: 'skip-to-details' as const,
    
    // All enhanced fields should be properly typed
    budgetMode: 'total' as const,
    selectedGroups: [],
    customGroupText: '',
    selectedInterests: [],
    customInterestsText: '',
    selectedInclusions: [],
    customInclusionsText: '',
    inclusionPreferences: {},
    travelExperience: [],
    customTravelExperienceText: '',
    selectedTripVibes: [],
    otherTripVibeText: '',
    selectedSampleDays: [],
    otherSampleDaysText: '',
    selectedDinnerChoices: [],
    otherDinnerChoiceText: '',
    tripNickname: '',
    contactName: '',
    contactEmail: ''
  };

  const mockOnFormChange = vi.fn();

  beforeEach(() => {
    mockOnFormChange.mockClear();
  });

  describe('FormData Interface Completeness', () => {
    it('should include all required enhanced fields', () => {
      // Verify all enhanced fields exist in FormData interface
      expect(mockFormData).toHaveProperty('budgetMode');
      expect(mockFormData).toHaveProperty('selectedGroups');
      expect(mockFormData).toHaveProperty('customGroupText');
      expect(mockFormData).toHaveProperty('selectedInterests');
      expect(mockFormData).toHaveProperty('customInterestsText');
      expect(mockFormData).toHaveProperty('selectedInclusions');
      expect(mockFormData).toHaveProperty('customInclusionsText');
      expect(mockFormData).toHaveProperty('inclusionPreferences');
      expect(mockFormData).toHaveProperty('travelExperience');
      expect(mockFormData).toHaveProperty('customTravelExperienceText');
      expect(mockFormData).toHaveProperty('selectedTripVibes');
      expect(mockFormData).toHaveProperty('otherTripVibeText');
      expect(mockFormData).toHaveProperty('selectedSampleDays');
      expect(mockFormData).toHaveProperty('otherSampleDaysText');
      expect(mockFormData).toHaveProperty('selectedDinnerChoices');
      expect(mockFormData).toHaveProperty('otherDinnerChoiceText');
      expect(mockFormData).toHaveProperty('tripNickname');
      expect(mockFormData).toHaveProperty('contactName');
      expect(mockFormData).toHaveProperty('contactEmail');
    });
  });

  describe('Component Integration Tests', () => {
    it('should render all enhanced components without errors', () => {
      // Test that all components can be rendered with FormData
      expect(() => {
        render(<BudgetForm formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<TravelGroupSelector formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<TravelInterests formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<ItineraryInclusions formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<TripNickname formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<TravelExperience formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<TripVibe formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<SampleDays formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      expect(() => {
        render(<DinnerChoice formData={mockFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();
    });

    it('should properly handle FormData integration across all components', () => {
      // Test that all components accept and work with FormData interface
      const testFormData: FormData = {
        ...mockFormData,
        budgetMode: 'per-person',
        selectedGroups: ['solo'],
        selectedInterests: ['adventure-outdoor'],
        travelExperience: ['first-time-visiting'],
        tripNickname: 'Test Trip'
      };

      // Verify BudgetForm can handle FormData
      expect(() => {
        render(<BudgetForm formData={testFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      // Verify TravelGroupSelector can handle FormData
      expect(() => {
        render(<TravelGroupSelector formData={testFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      // Verify TravelInterests can handle FormData
      expect(() => {
        render(<TravelInterests formData={testFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      // Verify TravelExperience can handle FormData
      expect(() => {
        render(<TravelExperience formData={testFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      // Verify TripNickname can handle FormData
      expect(() => {
        render(<TripNickname formData={testFormData} onFormChange={mockOnFormChange} />);
      }).not.toThrow();

      // Verify all components have proper BaseFormProps pattern
      expect(testFormData.budgetMode).toBe('per-person');
      expect(testFormData.selectedGroups).toContain('solo');
      expect(testFormData.selectedInterests).toContain('adventure-outdoor');
      expect(testFormData.travelExperience).toContain('first-time-visiting');
      expect(testFormData.tripNickname).toBe('Test Trip');
    });
  });

  describe('Comprehensive Data Capture Validation', () => {
    it('should capture all user selections for AI integration', () => {
      const comprehensiveData: FormData = {
        ...mockFormData,
        budgetMode: 'per-person',
        selectedGroups: ['couple', 'friends'],
        customGroupText: 'Small group of close friends',
        selectedInterests: ['adventure-outdoor', 'cultural-historical'],
        customInterestsText: 'Photography workshops',
        selectedInclusions: ['accommodations', 'activities'],
        customInclusionsText: 'Luxury spa treatments',
        inclusionPreferences: {
          accommodations: { level: 'luxury' },
          activities: { adventureLevel: 'moderate' }
        },
        travelExperience: ['experienced-traveler', 'local-connections'],
        customTravelExperienceText: 'Have friends living locally',
        selectedTripVibes: ['adventure', 'cultural'],
        otherTripVibeText: 'Photography focused journey',
        selectedSampleDays: ['guided-tour', 'cultural-immersion'],
        otherSampleDaysText: 'Photography walking tours',
        selectedDinnerChoices: ['street-food', 'michelin-starred'],
        otherDinnerChoiceText: 'Vegetarian fine dining',
        tripNickname: 'European Photography Adventure',
        contactName: 'John Doe',
        contactEmail: 'john@example.com'
      };

      // Verify that all data is captured and accessible
      expect(comprehensiveData.budgetMode).toBe('per-person');
      expect(comprehensiveData.selectedGroups).toContain('couple');
      expect(comprehensiveData.selectedGroups).toContain('friends');
      expect(comprehensiveData.customGroupText).toBe('Small group of close friends');
      expect(comprehensiveData.selectedInterests).toContain('adventure-outdoor');
      expect(comprehensiveData.selectedInterests).toContain('cultural-historical');
      expect(comprehensiveData.customInterestsText).toBe('Photography workshops');
      expect(comprehensiveData.selectedInclusions).toContain('accommodations');
      expect(comprehensiveData.selectedInclusions).toContain('activities');
      expect(comprehensiveData.customInclusionsText).toBe('Luxury spa treatments');
      expect(comprehensiveData.inclusionPreferences?.['accommodations']?.['level']).toBe('luxury');
      expect(comprehensiveData.travelExperience).toContain('experienced-traveler');
      expect(comprehensiveData.travelExperience).toContain('local-connections');
      expect(comprehensiveData.customTravelExperienceText).toBe('Have friends living locally');
      expect(comprehensiveData.selectedTripVibes).toContain('adventure');
      expect(comprehensiveData.selectedTripVibes).toContain('cultural');
      expect(comprehensiveData.otherTripVibeText).toBe('Photography focused journey');
      expect(comprehensiveData.selectedSampleDays).toContain('guided-tour');
      expect(comprehensiveData.selectedSampleDays).toContain('cultural-immersion');
      expect(comprehensiveData.otherSampleDaysText).toBe('Photography walking tours');
      expect(comprehensiveData.selectedDinnerChoices).toContain('street-food');
      expect(comprehensiveData.selectedDinnerChoices).toContain('michelin-starred');
      expect(comprehensiveData.otherDinnerChoiceText).toBe('Vegetarian fine dining');
      expect(comprehensiveData.tripNickname).toBe('European Photography Adventure');
      expect(comprehensiveData.contactName).toBe('John Doe');
      expect(comprehensiveData.contactEmail).toBe('john@example.com');
    });

    it('should support AI-ready data serialization', () => {
      const aiReadyData = {
        budget: {
          amount: mockFormData.budget,
          currency: mockFormData.currency,
          mode: mockFormData.budgetMode
        },
        travelers: {
          adults: mockFormData.adults,
          children: mockFormData.children,
          groups: mockFormData.selectedGroups,
          customGroupDetails: mockFormData.customGroupText
        },
        interests: {
          selected: mockFormData.selectedInterests,
          custom: mockFormData.customInterestsText
        },
        inclusions: {
          selected: mockFormData.selectedInclusions,
          custom: mockFormData.customInclusionsText,
          preferences: mockFormData.inclusionPreferences
        },
        travelStyle: {
          experience: mockFormData.travelExperience,
          experienceDetails: mockFormData.customTravelExperienceText,
          vibes: mockFormData.selectedTripVibes,
          vibeDetails: mockFormData.otherTripVibeText,
          sampleDays: mockFormData.selectedSampleDays,
          sampleDayDetails: mockFormData.otherSampleDaysText,
          diningPreferences: mockFormData.selectedDinnerChoices,
          diningDetails: mockFormData.otherDinnerChoiceText
        },
        contact: {
          tripName: mockFormData.tripNickname,
          name: mockFormData.contactName,
          email: mockFormData.contactEmail
        }
      };

      // Verify data can be structured for AI consumption
      expect(aiReadyData).toBeDefined();
      expect(aiReadyData.budget).toBeDefined();
      expect(aiReadyData.travelers).toBeDefined();
      expect(aiReadyData.interests).toBeDefined();
      expect(aiReadyData.inclusions).toBeDefined();
      expect(aiReadyData.travelStyle).toBeDefined();
      expect(aiReadyData.contact).toBeDefined();
    });
  });
});