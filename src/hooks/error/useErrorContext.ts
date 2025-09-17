/**
 * Error context provider and hook for global error handling
 * Constitutional compliance: Progressive enhancement, observable operations
 */

import React, { createContext, useContext, type ReactNode } from 'react';

export interface ErrorContextValue {
  errors: ErrorState[];
  reportError: (error: Error, context?: ErrorContext) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
}

export interface ErrorState {
  id: string;
  error: Error;
  context?: ErrorContext;
  timestamp: Date;
  recovered?: boolean;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Create context with default values
const ErrorContextData = createContext<ErrorContextValue>({
  errors: [],
  reportError: () => {},
  clearError: () => {},
  clearAllErrors: () => {},
});

/**
 * Hook to access error context
 */
export function useErrorContext(): ErrorContextValue {
  const context = useContext(ErrorContextData);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

/**
 * Error provider component props
 */
export interface ErrorProviderProps {
  children: ReactNode;
  onError?: (error: ErrorState) => void;
}

/**
 * Error provider component - implementation will be added in T026
 */
export function ErrorProvider({ children, onError }: ErrorProviderProps): JSX.Element {
  // Implementation will be added in T026
  console.debug('ErrorProvider placeholder:', { onError });

  const contextValue: ErrorContextValue = {
    errors: [],
    reportError: () => {},
    clearError: () => {},
    clearAllErrors: () => {},
  };

  return React.createElement(ErrorContextData.Provider, { value: contextValue }, children);
}
