// Enhanced Travel Style Progressive Hook
// Constitutional compliance: Edge-compatible, type-safe, observable

import { useState, useCallback } from 'react';
import { TravelStyleState, TravelStyleData } from '../types/travel-style';
import { TravelStyleChoice } from '../types/form-ui-enhancements';

interface UseTravelStyleProgressiveOptions {
  enableProgressTracking?: boolean;
  allowBackNavigation?: boolean;
  onComplete?: (data: any) => void;
}

export const useTravelStyleProgressive = (options: UseTravelStyleProgressiveOptions = {}) => {
  const { enableProgressTracking = true, allowBackNavigation = true, onComplete } = options;

  const [state, setState] = useState<TravelStyleState>({
    showSelectionButtons: true,
    userChoice: 'not-selected',
    showAllSections: false,
    completedSections: [],
    canSkipToNickname: false,
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

  const actions = {
    setUserChoice: useCallback((choice: TravelStyleChoice) => {
      setState((prev) => ({
        ...prev,
        userChoice: choice,
        showSelectionButtons: false,
        showAllSections: choice === 'answer-questions',
        canSkipToNickname: choice === 'skip-ahead',
      }));
    }, []),

    completeSection: useCallback((sectionId: string) => {
      setState((prev) => ({
        ...prev,
        completedSections: [...prev.completedSections, sectionId],
        isDirty: true,
      }));
    }, []),

    preserveData: useCallback((data: Record<string, any>) => {
      setState((prev) => ({
        ...prev,
        preservedData: { ...prev.preservedData, ...data },
        isDirty: true,
      }));
    }, []),

    finalize: useCallback(() => {
      onComplete?.(state.preservedData);
    }, [state.preservedData, onComplete]),
  };

  const progress = enableProgressTracking
    ? {
        completionPercentage: (state.completedSections.length / 4) * 100,
        sectionsCompleted: state.completedSections.length,
        totalSections: 4,
      }
    : null;

  return { state, actions, progress };
};
