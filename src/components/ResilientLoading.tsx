/**
 * Resilient Loading State Component
 *
 * Enhanced loading component with timeout detection and recovery options
 */

import { useState, useEffect } from 'react';

interface ResilientLoadingProps {
  isLoading: boolean;
  loadingMessage?: string;
  timeoutMessage?: string;
  timeoutDuration?: number; // milliseconds
  onTimeout?: () => void;
  onRetry?: () => void;
  showRetryButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function ResilientLoading({
  isLoading,
  loadingMessage = 'Processing your request...',
  timeoutMessage = 'This is taking longer than expected. Our AI service might be experiencing high demand.',
  timeoutDuration = 30000, // 30 seconds
  onTimeout,
  onRetry,
  showRetryButton = true,
  className = '',
  children,
}: ResilientLoadingProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    if (isLoading) {
      setHasTimedOut(false);
      setTimeElapsed(0);

      // Set up timeout detection
      timeoutId = setTimeout(() => {
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, timeoutDuration);

      // Update elapsed time every second
      intervalId = setInterval(() => {
        setTimeElapsed((prev) => prev + 1000);
      }, 1000);
    } else {
      setHasTimedOut(false);
      setTimeElapsed(0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, timeoutDuration, onTimeout]);

  const formatElapsedTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`p-6 bg-white rounded-lg border shadow-sm ${className}`}>
      {!hasTimedOut ? (
        // Normal loading state
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* Loading spinner */}
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              {/* Pulse effect */}
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-blue-400 opacity-25"></div>
            </div>

            {/* Loading message */}
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">{loadingMessage}</p>

              {/* Progress indicator */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>Processing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span>{formatElapsedTime(timeElapsed)}</span>
              </div>
            </div>

            {/* AI service status */}
            <div className="text-xs text-gray-400 max-w-md">
              <p>
                Our AI agents are analyzing your preferences and generating your personalized
                itinerary.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Timeout state with recovery options
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* Warning icon */}
            <div className="bg-yellow-100 rounded-full p-3">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Timeout message */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-yellow-800">Taking Longer Than Expected</h3>
              <p className="text-sm text-yellow-700 max-w-md">{timeoutMessage}</p>
            </div>

            {/* Recovery actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {showRetryButton && onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {/* Support information */}
            <div className="text-xs text-gray-500 border-t pt-4 max-w-md">
              <p>
                If this issue persists, it may be due to high demand on our AI services. Please try
                again in a few minutes or contact support if you continue to experience problems.
              </p>
              <p className="mt-2">Runtime: {formatElapsedTime(timeElapsed)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
