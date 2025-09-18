// Enhanced Travel Style Hook
// Constitutional compliance: Edge-compatible, type-safe, observable

import { useState, useCallback, useMemo } from 'react';
import { TravelStyleState, TravelStyleActions, TravelStyleData } from '../types/travel-style';
import { TravelStyleChoice } from '../types/enhanced-form-data';

// Initial state factory
const createInitialState = (
  initialChoice: TravelStyleChoice = 'not-selected'
): TravelStyleState => ({
  showSelectionButtons: initialChoice === 'not-selected',
  userChoice: initialChoice,
  showAllSections: initialChoice === 'answer-questions',
  completedSections: [],
  canSkipToNickname: initialChoice === 'skip-to-details',
  navigationPath: [],
  preservedData: {
    experience: [],
    vibes: [],
    sampleDays: [],
    dinnerChoices: [],
    customTexts: {},
  },
  isDirty: false,
});

/**
 * Enhanced Travel Style Hook
 * Manages travel style selection and progressive disclosure
 */
export const useTravelStyle = (initialChoice: TravelStyleChoice = 'not-selected') => {
  // State management
  const [state, setState] = useState<TravelStyleState>(() => createInitialState(initialChoice));

  // Actions
  const actions: TravelStyleActions = useMemo(
    () => ({
      makeChoice: useCallback((choice: TravelStyleChoice) => {
        setState((prev) => ({
          ...prev,
          userChoice: choice,
          showSelectionButtons: false,
          showAllSections: choice === 'answer-questions',
          canSkipToNickname: choice === 'skip-to-details',
          navigationPath: [...prev.navigationPath, choice],
        }));
      }, []),

      showAllSections: useCallback(() => {
        setState((prev) => ({
          ...prev,
          showAllSections: true,
          navigationPath: [...prev.navigationPath, 'show-all'],
        }));
      }, []),

      skipToNickname: useCallback(() => {
        setState((prev) => ({
          ...prev,
          canSkipToNickname: true,
          navigationPath: [...prev.navigationPath, 'skip-to-nickname'],
        }));
      }, []),

      markSectionComplete: useCallback((section: string) => {
        setState((prev) => ({
          ...prev,
          completedSections: [...prev.completedSections, section],
          isDirty: true,
        }));
      }, []),

      preserveData: useCallback((data: Partial<TravelStyleData>) => {
        setState((prev) => ({
          ...prev,
          preservedData: { ...prev.preservedData, ...data },
          isDirty: true,
        }));
      }, []),

      resetState: useCallback(() => {
        setState(createInitialState());
      }, []),
    }),
    []
  );

  // Computed values
  const computedState = useMemo(
    () => ({
      ...state,
      hasCompletedAllSections: state.completedSections.length > 0,
      canProceed: state.canSkipToNickname || state.showAllSections,
      progressPercentage: state.completedSections.length > 0 ? 100 : 0,
    }),
    [state]
  );

  return [computedState, actions] as const;
};
