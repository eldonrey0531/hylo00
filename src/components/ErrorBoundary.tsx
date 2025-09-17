/**
 * Generic Error Boundary Component
 *
 * Provides comprehensive error handling for all application operations with:
 * - Graceful degradation strategies
 * - User-friendly error messages
 * - Recovery mechanisms
 * - Error reporting to observability systems
 *
 * Constitutional compliance:
 * - Graceful error handling with user-friendly messages
 * - Observable operations through error reporting
 * - Progressive enhancement with fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
  className?: string;
  context?: string; // Additional context for error categorization
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Report error
    this.reportError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt automatic recovery if enabled
    if (this.props.enableRecovery && this.shouldAttemptRecovery(error)) {
      this.attemptRecovery();
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount,
        boundaryContext: this.props.context || 'generic',
      },
    };

    // Log to console for development
    console.error('🚨 Error Boundary caught error:', errorReport);

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
        body: JSON.stringify({
          ...errorReport,
          type: 'react_error_boundary',
        }),
      });
    } catch (monitoringError) {
      console.error('Failed to send error report to monitoring:', monitoringError);
    }
  };

  private shouldAttemptRecovery = (error: Error): boolean => {
    const { maxRetries = 2 } = this.props;
    const { retryCount } = this.state;

    // Don't retry if we've exceeded max retries
    if (retryCount >= maxRetries) {
      return false;
    }

    // Don't retry for certain error types
    if (
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('SyntaxError')
    ) {
      return false;
    }

    return true;
  };

  private attemptRecovery = () => {
    this.setState({ isRecovering: true });

    this.retryTimeout = setTimeout(() => {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRecovering: false,
      }));
    }, 2000); // Wait 2 seconds before retry
  };

  override componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

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

    // UI/Component related errors
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return "We're updating the application. Please refresh the page to get the latest version.";
    }

    if (error.message.includes('SyntaxError')) {
      return "There's an issue with the application code. Please refresh the page or contact support.";
    }

    // Network related errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return "We're having trouble connecting to our services. Please check your connection and try again.";
    }

    // Generic fallback
    return 'Something unexpected happened. Please try again or contact support if the problem persists.';
  };

  private getErrorType = (): string => {
    const { error } = this.state;

    if (!error) return 'unknown';

    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'chunk_load';
    }

    if (error.message.includes('SyntaxError')) {
      return 'syntax';
    }

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'network';
    }

    return 'component';
  };

  override render() {
    const { hasError, isRecovering, retryCount } = this.state;
    const { children, fallback, maxRetries = 2, className } = this.props;

    if (hasError) {
      // Show custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const errorType = this.getErrorType();
      const canRetry = retryCount < maxRetries && this.shouldAttemptRecovery(this.state.error!);

      // Show recovery UI
      return (
        <div className={`error-boundary ${className || ''}`}>
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
                <h3 className="text-sm font-medium text-red-800">
                  {isRecovering ? 'Recovering...' : 'Something went wrong'}
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-red-700">{this.getErrorMessage()}</p>

              {retryCount > 0 && (
                <p className="text-xs text-red-600 mt-2">
                  Retry attempt: {retryCount} of {maxRetries}
                </p>
              )}
            </div>

            {!isRecovering && (
              <div className="flex space-x-3">
                {canRetry && (
                  <button
                    onClick={this.handleManualRetry}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                )}

                {errorType === 'chunk_load' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Refresh Page
                  </button>
                )}
              </div>
            )}

            {process.env['NODE_ENV'] === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-red-100 rounded">
                <summary className="text-xs font-medium text-red-800 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
