/**
 * AI Error Boundary Component
 *
 * Provides comprehensive error handling for AI operations with:
 * - Graceful degradation strategies
 * - User-friendly error messages
 * - Recovery mechanisms
 * - Error reporting to observability systems
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface AIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
}

interface AIErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
  className?: string;
}

export class AIErrorBoundary extends Component<AIErrorBoundaryProps, AIErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: AIErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AIErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Report error to observability system
    this.reportError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt automatic recovery for certain error types
    if (this.props.enableRecovery && this.shouldAttemptRecovery(error)) {
      this.scheduleRecovery();
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount,
      },
    };

    // Log to console for development
    console.error('🚨 AI Error Boundary caught error:', errorReport);

    // In production, send to monitoring service
    if (process.env['NODE_ENV'] === 'production') {
      this.sendToMonitoring(errorReport);
    }
  };

  private sendToMonitoring = async (errorReport: any) => {
    try {
      // Send error report to monitoring service
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      });
    } catch (monitoringError) {
      console.error('Failed to send error report to monitoring:', monitoringError);
    }
  };

  private shouldAttemptRecovery = (error: Error): boolean => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    // Don't retry if we've exceeded max retries
    if (retryCount >= maxRetries) {
      return false;
    }

    // Attempt recovery for network errors, timeout errors, and temporary AI service issues
    const recoverableErrorPatterns = [
      /network/i,
      /timeout/i,
      /503/i, // Service unavailable
      /502/i, // Bad gateway
      /500/i, // Internal server error
      /rate.?limit/i,
      /quota.?exceeded/i,
    ];

    return recoverableErrorPatterns.some(
      (pattern) => pattern.test(error.message) || pattern.test(error.name)
    );
  };

  private scheduleRecovery = () => {
    const { retryCount } = this.state;

    // Exponential backoff: 1s, 2s, 4s, 8s...
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);

    this.setState({ isRecovering: true });

    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, retryDelay);
  };

  private handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
    }));
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
    });
  };

  private getErrorMessage = (): string => {
    const { error } = this.state;

    if (!error) return 'An unexpected error occurred';

    // Provide user-friendly messages for common AI errors
    if (error.message.includes('API key')) {
      return "There's a configuration issue with our AI service. Please try again in a moment.";
    }

    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return 'Our AI service is currently experiencing high demand. Please try again in a few minutes.';
    }

    if (error.message.includes('timeout') || error.message.includes('network')) {
      return "We're having trouble connecting to our AI service. Please check your connection and try again.";
    }

    if (
      error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503')
    ) {
      return "Our AI service is temporarily unavailable. We're working to resolve this quickly.";
    }

    return 'Something went wrong with our AI service. Please try again or contact support if the problem persists.';
  };

  override render() {
    const { hasError, isRecovering, retryCount } = this.state;
    const { children, fallback, maxRetries = 3, className } = this.props;

    if (hasError) {
      // Show custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Show recovery UI
      return (
        <div className={`ai-error-boundary ${className || ''}`}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">AI Service Error</h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-red-700">{this.getErrorMessage()}</p>
            </div>

            {isRecovering ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span className="ml-2 text-sm text-red-600">
                  Attempting to recover... (Attempt {retryCount + 1}/{maxRetries})
                </span>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={this.handleManualRetry}
                  className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Try Again
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Refresh Page
                </button>
              </div>
            )}

            {process.env['NODE_ENV'] === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-xs text-red-600 cursor-pointer">Developer Details</summary>
                <pre className="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default AIErrorBoundary;
